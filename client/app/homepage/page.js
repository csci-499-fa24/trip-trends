'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../img/Logo.png';
import '../css/homepage.css';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import pinIcon from '../img/Pin.png';

// Create a custom icon
const custompinIcon = L.icon({
    iconUrl: pinIcon.src,
    iconSize: [25, 30], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function homepage() {
    // states
    const [userName, setUserName] = useState("[NAME]"); 
    const [trips, setTrips] = useState([]);
    const [expandedTripId, setExpandedTripId] = useState(null);
    const [isPopUpVisible, setPopUpVisible] = useState(false);

    // new trip form fields that match model attributes
    const [newTripData, setNewTripData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        budget: 0,
        image: null
    });

    const [newTripLocation, setNewTripLocation] = useState({trip_locations: ''});

    // handle events
    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("token");
        window.location.href = '/signup';
        
    };

    const handleToken = () => {
        const token = localStorage.getItem("token"); // signed in user's access token
        if (token) {
            const userCredential = jwtDecode(token);
            const userName = userCredential.given_name;
            console.log(userCredential);
            setUserName(userName);

        } else {
            // user is not authenticated
            console.log("Token not found. Redirecting to sign in page.");
            window.location.href = '/signup';
        }
    }

    const fetchTrips = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/trips/get-trips');
            console.log(response.data); // Log the response to see its structure
            setTrips(response.data.data); // Access the data property
        } catch (err) {
            console.error(err);
            setTrips([]); // Set trips to an empty array in case of error
        }
    };

    // Toggle the expanded state of a trip
    const toggleTripDetails = (tripId) => {
        setExpandedTripId(prevId => (prevId === tripId ? null : tripId));
    };

    // captures new input instantly in each popup field
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
            setPopUpVisible(false); // close the popup
            setNewTripData({name: '', start_date: '', end_date: '', budget: ''}); // reset form fields
            setNewTripLocation({trip_locations: ''})
            fetchTrips(); // refresh trips after creating a new one

        } catch (error) {
            console.error('Error creating trip:', error);
        }
    };

    // updating the component after it renders
    useEffect(() => {
        handleToken();
        fetchTrips(); // Call the function to fetch trips on component mount
    }, []);


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
             <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Render markers for each trip */}
                {trips.map(trip => (
                    trip.latitude && trip.longitude ? ( // Check if latitude and longitude are defined
                        <Marker
                            key={trip.trip_id}
                            position={[trip.latitude, trip.longitude]}
                            icon={custompinIcon}
                        >
                            <Popup>
                                {trip.name}: {trip.start_date} to {trip.end_date} - Budget: ${trip.budget}
                            </Popup>
                        </Marker>
                    ) : null // Do not render a marker if coordinates are undefined
                ))}
            </MapContainer>

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
                                            {/* Add more details as needed */}
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