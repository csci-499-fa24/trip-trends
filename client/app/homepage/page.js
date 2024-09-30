'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../img/Logo.png';
import '../css/homepage.css';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import pinIcon from '../img/Pin.png';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

// Create a custom icon
const custompinIcon = L.icon({
    iconUrl: pinIcon.src,
    iconSize: [25, 30], // Size of the icon
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function homepage() {
    const handleLogout = () => {
          googleLogout();
          localStorage.removeItem("token");
          window.location.href = '/signup';
    };
    
    const [userName, setUserName] = useState("[NAME]");

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
            window.location.href = '/signin';
        }
    }

    React.useEffect(() => {
        handleToken();
    }, []); 

    const [trips, setTrips] = useState([]);
    const [expandedTripId, setExpandedTripId] = useState(null); // State for the expanded trip
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
    useEffect(() => {
        fetchTrips(); // Call the function to fetch trips on component mount
    }, []);
    // Toggle the expanded state of a trip
    const toggleTripDetails = (tripId) => {
        setExpandedTripId(prevId => (prevId === tripId ? null : tripId));
    };

    return (
        <div className="dashboard">
            {/* Header Section */}
            <header className="header">
                <div className="logo-container">
                    <Image src={logo} alt="Logo" width={300} height={300} />
                </div>
                <div className="left-rectangle"></div>
                <div className="right-rectangle"></div>
            </header>

            <GoogleOAuthProvider clientId={googleID}>
                <button onClick={handleLogout} className='logout'>Logout</button>
            </GoogleOAuthProvider>

            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>Welcome Back, {userName}!</h1>
                <p>See everywhere you've gone:</p>
            </div>

             {/* Map Section */}
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

           {/* Recent Trips Section */}
           <div className="recent-trips">
                <h2>Recent Trips</h2>
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
