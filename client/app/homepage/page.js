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
import LoadingPageComponent from '../components/LoadingPageComponent';
import PlaidButtonComponent from '../components/homepage/PlaidButtonComponent';

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function homepage() {
    // States
    const [userName, setUserName] = useState("");
    const [trips, setTrips] = useState([]);
    const [allTripLocations, setAllTripLocations] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [homeCurrency, setHomeCurrency] = useState(null);

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

    const fetchHomeCurrency = async (userId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}/home-currency`);
            return response.data.home_currency;
        } catch (error) {
            console.error('Error fetching home currency:', error);
            return null; // Handle error as needed
        }
    };

    // Fetch home currency when userId changes
    useEffect(() => {
        const getHomeCurrency = async () => {
            if (userId) {
                const currency = await fetchHomeCurrency(userId);
                if (currency) {
                    setHomeCurrency(currency);  // Only set if currency is valid
                }
            }
        };

        getHomeCurrency(); // Fetch home currency when userId is available
    }, [userId]);

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
            const [tripsResponse, favoritesResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`),
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}`)
            ]);
            const tripsData = tripsResponse.data.data;
            const favoritesData = favoritesResponse.data.data;
            const tripsWithFavorites = tripsData.map(trip => {
                const favorite = favoritesData.find(fav => fav.trip_id === trip.trip_id);
                return {
                    ...trip,
                    favorite: favorite ? favorite.favorite : false
                };
            });
            const sortedTrips = tripsWithFavorites.sort((a, b) => b.favorite - a.favorite);
            setTrips(sortedTrips);

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


    useEffect(() => {
        if (userId && trips.length >= 0 && allTripLocations.length >= 0) {
            setLoading(false); 
        }
    }, [userId, trips, allTripLocations]);

    return (
        <GoogleOAuthProvider clientId={googleID}>
            <ToastContainer />
            {loading ? (
                <LoadingPageComponent /> 
            ) : (
            <div>
                {/* Header section */}
                <HeaderComponent
                    headerTitle="Trip Trends"
                    setUserName={setUserName}
                    userId={userId}
                />
                <div className='main-container'>
                    {/* Welcome section */}
                    <div className="welcome-section">
                        {userName ?
                            (
                                <h1 style={{ textAlign: "center" }}>Welcome, {userName}!</h1>
                            ) :
                            (
                                <h1 style={{ textAlign: "center" }}>Welcome!</h1>
                        )}
                        <PlaidButtonComponent />
                        <p style={{marginLeft: '-15px'}}>See where you've been:</p>
                    </div>

                    <div className="responsive-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {/* Map section */}
                        <MapComponent allTripLocations={allTripLocations} toggleTripDetails={toggleTripDetails} />
                        {/* Recent Trips section */}
                        <div style={{ width: '35%', marginLeft: '10px' }}>
                            <RecentTripsComponent trips={trips} />
                        </div>
                    </div>

                {/* All Trips Section */}
                <TripsDisplayComponent trips={trips} userId={userId} homeCurrency={homeCurrency}/>
                        {/* All Trips Section */}
                        {/* <TripsDisplayComponent trips={trips} userId={userId} /> */}

                </div>
            </div>
        )}
        
        </GoogleOAuthProvider>
    );
}

export default homepage;
