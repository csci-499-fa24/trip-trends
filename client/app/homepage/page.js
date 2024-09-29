'use client';

import React from 'react';
import Image from 'next/image';
import logo from '../img/Logo.png';
import '../css/homepage.css';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';

// Import your custom pin icon
import pinIcon from '../img/Pin.png'; // Change the path as needed

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
                <h1>Welcome Back, [Name]!</h1>
                <p>See everywhere you've gone:</p>
            </div>

             {/* Map Section */}
             <MapContainer center={[40.7128, -74.0060]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[40.7128, -74.0060]} icon={custompinIcon}>
                    <Popup>
                        A marker for New York City!
                    </Popup>
                </Marker>
            </MapContainer>

           {/* Recent Trips Section */}
           <div className="recent-trips">
                <h2>Recent Trips</h2>
                <p>No trips available for now.</p>
            </div>
        </div>
    );
}

export default homepage;
