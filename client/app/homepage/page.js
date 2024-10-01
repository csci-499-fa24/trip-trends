'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import logo from '../img/Logo.png';
import '../css/homepage.css';
import axios from 'axios';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import pinIcon from '../img/Pin.png';
import 'ol/ol.css'; // Import OpenLayers CSS
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
    const [newTripLocation, setNewTripLocation] = useState({ trip_locations: '' });
    const mapRef = useRef(null); // Reference for the map

    // Handle events
    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("token");
        window.location.href = '/signup';
    };

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

    const fetchTrips = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/get-trips`);
            console.log(response.data);
            setTrips(response.data.data);
        } catch (err) {
            console.error(err);
            setTrips([]);
        }
    };

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
        const { name, value } = e.target;
        setNewTripLocation({ ...newTripLocation, [name]: value });
    };

    const submitNewTrip = async (e) => {
        e.preventDefault();
        try {
            console.log("New trip data", newTripData);
            await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/create-trip`, newTripData);
            setPopUpVisible(false); // Close the popup
            setNewTripData({ name: '', start_date: '', end_date: '', budget: '' }); // Reset form fields
            setNewTripLocation({ trip_locations: '' });
            fetchTrips(); // Refresh trips after creating a new one
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    };

    useEffect(() => {
        handleToken();
        fetchTrips(); // Call the function to fetch trips on component mount
    }, []);

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
                    <Image src={logo} alt="Logo" width={300} height={300}/>
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
                                    <input type="text" name="trip_locations" placeholder="Enter city or country" value={newTripLocation.trip_locations} onChange={newTripLocInputChange} required />
                                </label>
                                
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
                                            <Link href={`/singletrip`} style={{ color: 'white', textDecoration: 'underline' }}>
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