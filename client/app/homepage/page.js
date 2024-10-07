'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import logo from '../img/Logo.png';
import '../css/homepage.css';
import axios from 'axios';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import pinIcon from '../img/Pin.png';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Link from 'next/link';
import { debounce } from 'lodash'; // for rate limiting when calling the OpenCage API on every keystroke

// Custom marker icon style
const customIconStyle = new Style({
    image: new Icon({
        src: pinIcon.src,
        scale: 0.1,
    }),
});

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function homepage() {
    // States
    const [userName, setUserName] = useState("[NAME]"); 
    const [trips, setTrips] = useState([]);
    const [expandedTripId, setExpandedTripId] = useState(null);
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [newTripData, setNewTripData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        budget: 0,
        image: null
    });
    const [newTripLocation, setNewTripLocation] = useState({ trip_locations: [] });
    const [tempLocation, setTempLocation] = useState('');
    const mapRef = useRef(null); // Reference for the map
    const [suggestions, setSuggestions] = useState([]);
    const [locationsNotProvided, setLocationsNotProvided] = useState(false);
    const [userId, setUserId] = useState(null);

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("token");
        window.location.href = '/signup';
    };

    // Used to display user's name if token exists
    const handleToken = () => {
        const token = localStorage.getItem("token");
        if (token) {
            const userCredential = jwtDecode(token);
            const userName = userCredential.given_name;
            console.log(userCredential);
            setUserName(userName);
        } else {
            console.log("Token not found. Redirecting to sign in page.");
            window.location.href = '/signup';
        }
    };

    const getUserId = () => {
        // Get user ID to create and get trip from onboarded user
        const user_id = localStorage.getItem("user_id");
        if (user_id){
            setUserId(user_id);
        }
        else {
            console.error("User ID not found.");
        }
    }

    useEffect(() => {
        handleToken();
        getUserId();
    }, []);

    const fetchUserTrips = async () => {
        if (!userId){
            console.error("User ID is not set.");
            return;
        }
        console.log("Fetching trips for user ID:", userId);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`);
            console.log(response.data);
            setTrips(response.data.data);
        } catch (err) {
            console.error(err);
            setTrips([]);
        }
    };

    useEffect(() => {
        fetchUserTrips(); // Call the function to fetch trips on component mount
    }, [userId]);

    // Toggle the expanded state of a trip
    const toggleTripDetails = (tripId) => {
        setExpandedTripId(prevId => (prevId === tripId ? null : tripId));
    };

    // Captures new input instantly in each popup field
    const newTripInputChange = (e) => {
        const { name, value } = e.target;
        setNewTripData({ ...newTripData, [name]: value });
    };

    const newTripLocInputChange = (e) => {
        const value = e.target.value;
        setTempLocation(value);
        fetchLocationSuggestions(value);
    };
    
    const fetchLocationSuggestions = useCallback(debounce(async (query) => {
        if (query) {
            try {
                const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                    params: {
                        q: query,
                        key: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY, // Using OpenCage API key
                        limit: 5 // Limit the number of suggestions
                    }
                });
                const results = response.data.results.map(result => result.formatted); // Extract formatted addresses
                setSuggestions(results); // Set suggestions state
            } catch (error) {
                console.error('Error fetching location suggestions:', error);
                setSuggestions([]); // Clear suggestions on error
            }
        } else {
            setSuggestions([]);
        }
    }, 200), // debounce delay to reduce the number of API calls to avoid errors
    []); 

    const selectSuggestion = (suggestion) => {
        // Check if the suggestion is not already included and if the max limit is not reached
        if (!newTripLocation.trip_locations.includes(suggestion) && newTripLocation.trip_locations.length < 10) {
            setNewTripLocation(prev => ({
                trip_locations: [...prev.trip_locations, suggestion] // Add selected suggestion to locations array
            }));
        } else if (newTripLocation.trip_locations.length >= 10) {
            alert("You can only add a maximum of 10 locations."); // Alert if limit is reached
        }
        setSuggestions([]); // Clear suggestions after selection
        setTempLocation(''); // Clear input field after selection
    };    

    const addLocation = () => {
        if (tempLocation && 
            !newTripLocation.trip_locations.includes(tempLocation) && 
            newTripLocation.trip_locations.length < 10) {
            setNewTripLocation(prev => ({
                trip_locations: [...prev.trip_locations, tempLocation] // Add the new location to the array
            }));
            setTempLocation(''); // Clear the input
            setSuggestions([]); // Clear suggestions after adding location either by entering or clicking the button
        } else if (newTripLocation.trip_locations.length >= 10) {
            alert("You can only add a maximum of 10 locations."); // Alert if limit is reached
        }
    };   

    const submitNewTrip = async (e) => {
        e.preventDefault();
        // No locations selected
        if (newTripLocation.trip_locations.length === 0){
            setLocationsNotProvided(true);
            alert("Please provide at least one location.")
            return;
        }
        try {
            console.log("User ID:", userId);
            const trip_submission_response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`, newTripData); // locations not needed for a trip submission
            const trip_id = trip_submission_response.data.data.trip_id;
            console.log("Trip ID:", trip_id);
            console.log("Trip Locations: ", newTripLocation.trip_locations);
            const num_trip_locs = newTripLocation.trip_locations.length;

            // For every location, create a trip location entry
            for (let i = 0; i < num_trip_locs; i++){
                let a_trip_location = {trip_id: trip_id, location: newTripLocation.trip_locations[i]};
                console.log(`Trip Location ${i+1}:`, a_trip_location);
                try {
                    await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations`, a_trip_location);
                }
                catch (error){
                    console.error(`Error creating trip location ${i+1}:`, error);
                }
            }

            // A shared trip will be under the user who created the trip to support future shared trips
            const shared_trip = {user_id: userId, trip_id: trip_id};
            console.log("Shared Trip:", shared_trip);
            // console.log("User ID:", userId, "Type:", typeof userId);
            // console.log("Trip ID:", trip_id, "Type:", typeof trip_id);  
            console.log(`Sending request to: ${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}/trips/${trip_id}`);
            // await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}/trips/${trip_id}`, shared_trip);
            
            setPopUpVisible(false); // Close the popup
            setNewTripData({ name: '', start_date: '', end_date: '', budget: '' }); // Reset form fields
            setNewTripLocation({ trip_locations: [] }); // Reset locations
            await fetchUserTrips(); // Refresh trips after creating a new one
            setLocationsNotProvided(false); 

        } catch (error) {
            console.error("Error creating trip:", error);
        }
    };

    useEffect(() => {
        // Initialize the OpenLayers map after the component mounts
        if (mapRef.current) {
            const features = trips.map(trip => {
                if (trip.latitude && trip.longitude) {
                    const feature = new Feature({
                        geometry: new Point(fromLonLat([trip.longitude, trip.latitude])), // Note the order
                    });
                    feature.setStyle(customIconStyle);
                    return feature;
                }
                return null;
            }).filter(Boolean); // Remove any null values

            const vectorSource = new VectorSource({ features });
            const vectorLayer = new VectorLayer({ source: vectorSource });

            const map = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    vectorLayer,
                ],
                view: new View({
                    center: fromLonLat([-74.0060, 40.7128]), // New York City
                    zoom: 13,
                }),
            });

            // Cleanup function to remove the map instance on unmount
            return () => map.setTarget(undefined);
        }
    }, [trips]);

    return (
        <div className="dashboard">
            {/* Header section */}
            <header className="header">
                <div className="logo-container">
                    <Image src={logo} alt="Logo" width={300} height={300} priority/>
                </div>
                <div className="left-rectangle"></div>
                <div className="right-rectangle"></div>
            </header>

            <GoogleOAuthProvider clientId={googleID}>
                <button onClick={handleLogout} className='logout'>Logout</button>
            </GoogleOAuthProvider>

            {/* Welcome section */}
            <div className="welcome-section">
                <h1>Welcome Back, {userName}!</h1>
                <br></br>
                <button onClick={() => setPopUpVisible(true)} className='create-trip'>Create a Trip</button>
                <br></br>
                <br></br>
                <p>See everywhere you've gone:</p>
            </div>

            {/* Create a trip popup form */}
            <div className="trip-form">
                {isPopUpVisible && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setPopUpVisible(false)}>&times;</span>
                            <h2 className="new-trip-title">New Trip</h2>
                            <form onSubmit={submitNewTrip}>
                                <label className="new-trip-field-label">
                                    Trip Name:
                                    <input type="text" name="name" value={newTripData.name} onChange={newTripInputChange} required />
                                </label>
                                
                                <div className="date-fields">
                                    <label className="new-trip-field-label">
                                        Start Date:
                                        <input type="date" name="start_date" value={newTripData.start_date} onChange={newTripInputChange} required />
                                    </label>
                                    <label className="new-trip-field-label">
                                        End Date:
                                        <input type="date" name="end_date" value={newTripData.end_date} onChange={newTripInputChange} required />
                                    </label>
                                </div>

                                <label className="new-trip-field-label">
                                    Budget:
                                    <input type="number" name="budget" value={newTripData.budget} onChange={newTripInputChange} required />
                                </label>

                                <label className="new-trip-field-label">
                                    Locations:
                                    <input
                                        type="text"
                                        name="trip_locations"
                                        placeholder="Enter city or country"
                                        value={tempLocation}
                                        onChange={newTripLocInputChange}
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Prevent form submission
                                            }
                                        }} 
                                    />
                                </label>

                                <div>
                                    {newTripLocation.trip_locations.map((location, index) => (
                                        <div key={index} className="selected-location">
                                            <span className="location-text">{location}</span>
                                            <button type="button" onClick={() => {
                                                setNewTripLocation(prev => ({
                                                    trip_locations: prev.trip_locations.filter((loc, i) => i !== index) // Remove selected location
                                                }));
                                            }}>Remove</button>
                                        </div>
                                    ))}
                                </div>

                                {isPopUpVisible && (
                                    <div className="dropdown-suggestions">
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="dropdown-suggestion"
                                                onClick={() => selectSuggestion(suggestion)}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <button type="submit" className="submit-new-trip-button">Create</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Map section */}
            <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>

            {/* Recent trips section */}
            <div className="recent-trips">
                <br></br>
                <h2>Recent Trips</h2>
                <br></br>
                <br></br>
                {trips.length === 0 ? (
                    <p>Loading trips...</p>
                ) : (
                    Array.isArray(trips) && trips.length > 0 ? (
                        <ul>
                            {trips.map(trip => (
                                <li key={trip.trip_id}>
                                    <div onClick={() => toggleTripDetails(trip.trip_id)} style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', marginBottom: '5px', backgroundColor: '#134a09' }}>
                                        {trip.name}
                                    </div>
                                    {expandedTripId === trip.trip_id && (
                                        <div style={{ padding: '10px', backgroundColor: '#134a09', border: '1px solid #ccc' }}>
                                            <p>
                                                <strong>Dates:</strong> {trip.start_date} - {trip.end_date}
                                            </p>
                                            <p><strong>Budget:</strong> ${trip.budget}</p>
                                            <Link href={`/singletrip?tripId=${trip.trip_id}`} style={{ color: 'white', textDecoration: 'underline' }}>
                                                See more
                                            </Link>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No trips available.</p>
                    )
                )}
            </div>
        </div>
    );
}

export default homepage;