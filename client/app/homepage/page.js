'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/homepage.css';
import axios from 'axios';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import 'ol/ol.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaderComponent from '../components/HeaderComponent';
import MapComponent from '../components/homepage/MapComponent';
import RecentTripsComponent from '../components/homepage/RecentTripsComponent';
import TripsDisplayComponent from '../components/homepage/TripsDisplayComponent';

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function homepage() {
    // States
    const [userName, setUserName] = useState("");
    const [trips, setTrips] = useState([]);
    const [allTripLocations, setAllTripLocations] = useState([]);
    const [userId, setUserId] = useState(null);

    // Used to display user's name
    const fetchUserName = async () => {
        const userId = localStorage.getItem("user_id");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`);
            if (response.data && response.data.data) {
                const userData = response.data.data;
                setUserName(userData.fname); // Set the username from the database
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const handleToken = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            const userCredential = jwtDecode(token);
        } else {
            console.log("Token not found. Redirecting to sign in page.");
            window.location.href = '/signup';
        }
    };

    const getUserId = () => {
        // Get user ID to create and get trip from onboarded user
        const user_id = localStorage.getItem("user_id");
        if (user_id) {
            setUserId(user_id);
        }
        else {
            console.error("User ID not found.");
        }
    }

    useEffect(() => {
        fetchUserName();
        handleToken();
        getUserId();
    }, []);

    const fetchUserTrips = async () => {
        if (!userId) {
            console.error("User ID is not set.");
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`);
            setTrips(response.data.data);
        } catch (err) {
            console.error(err);
            setTrips([]);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserTrips(); // Call the function to fetch trips on component mount
        }
    }, [userId]);


    // Toggle the expanded state of a trip
    const toggleTripDetails = async (tripId) => {
        setExpandedTripId(prevId => (prevId === tripId ? null : tripId));
        setAnimationForTripId(tripId); // enable animation
        setTimeout(() => setAnimationForTripId(null), 300); // for trip divider when toggled
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`);

        } catch (error) {
            console.error('Error fetching trip locations:', error);
        }
    };

    const fetchTripLocations = async () => {
        if (!userId) {
            console.error("User ID is not available.");
            return;
        }
        let locations_response = null;
        try {
            locations_response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/users/${userId}`);
        } catch (error) {
            console.error("Error getting all trip locations from user:", error);
            return;
        }
    
        const loc_data = locations_response?.data?.data;
        if (loc_data && loc_data.length > 0) {
            const locations = loc_data.map(location => ({
                "trip_id": location.trip_id,
                "location": location.location,
                "latitude": location.latitude,
                "longitude": location.longitude
            }));
            setAllTripLocations(locations);
        } else {
            console.log("No locations available for this user.");
        }
    };    

    useEffect(() => {
        handleToken();
        localStorage.removeItem('selectedFilter');
    }, []);

    useEffect(() => {
        if (userId) {
            fetchTripLocations();
        }
    }, [userId]);

    return (
        <GoogleOAuthProvider clientId={googleID}>
        <ToastContainer />
            {/* Header section */}
            <HeaderComponent 
                headerTitle="Trip Trends" 
                setUserName={setUserName} 
                userId={userId}
            />
            <div className='main-container'>
                {/* Welcome section */}
                <div className="welcome-section">
                    <h1>Welcome, {userName}!</h1>
                    
                    <br /><br />
                    <p>See your trip history:</p>
                </div>
        
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    
                    {/* Map section */}
                    <MapComponent allTripLocations={allTripLocations} toggleTripDetails={toggleTripDetails} />
                    
                    {/* Recent Trips section */}
                    <div style={{ width: '35%', marginLeft: '10px' }}>
                        <RecentTripsComponent trips={trips} />
                    </div>
                    
                </div>

                <br /><br />

                {/* All Trips Section */}
                <TripsDisplayComponent trips={trips} userId={userId} />

            </div>
        </GoogleOAuthProvider>
    );
}

export default homepage;
