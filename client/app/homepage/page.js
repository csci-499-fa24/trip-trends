'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/homepage.css';
import axios from 'axios';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import pinIcon from '../img/redPin.png';
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
import { boundingExtent } from 'ol/extent';
import { fromLonLat } from 'ol/proj';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaderComponent from '../components/HeaderComponent';
import TripFormComponent from '../components/homepage/TripFormComponent';
import RecentTripsComponent from '../components/homepage/RecentTripsComponent';

// Custom marker icon style
const customDefaultMarker = new Style({
    image: new Icon({
        src: pinIcon.src,
        scale: 0.06,
    }),
});

const customHoverMarker = new Style({
    image: new Icon({
        src: pinIcon.src,
        scale: 0.075,
    })
});

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function homepage() {
    // States
    const [userName, setUserName] = useState("");
    const [trips, setTrips] = useState([]);
    const [allTripLocations, setAllTripLocations] = useState([]);
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
    const mapRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [locationsNotProvided, setLocationsNotProvided] = useState(false);
    const [userId, setUserId] = useState(null);
    const [animatedTripId, setAnimationForTripId] = useState(null);

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
        }
        const loc_data = locations_response.data.data;
        const locations = loc_data.map(location => { return { "trip_id": location.trip_id, "location": location.location, "latitude": location.latitude, "longitude": location.longitude }; });
        setAllTripLocations(locations);
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
        // Initialize the OpenLayers map after the component mounts
        if (mapRef.current) {
            const mapContainer = mapRef.current;
            const features = allTripLocations.map(location => {
                if (location.latitude && location.longitude) {
                    const feature = new Feature({
                        geometry: new Point(fromLonLat([parseFloat(location.longitude), parseFloat(location.latitude)])),
                    });
                    feature.set("trip_id", location.trip_id);
                    feature.setStyle(customDefaultMarker);
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
                    center: fromLonLat([-74.0060, 40.7128]), // Default NYC coords
                    zoom: 13,
                }),
            });

            if (features.length > 0) {
                // Zoom out to fit all the markers
                const extent = boundingExtent(features.map(feature => feature.getGeometry().getCoordinates()));
                // Validate extent
                if (extent.length === 4 &&
                    extent.every(coord => Number.isFinite(coord))) {
                    try {
                        map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 15 });
                    } catch (error) {
                        console.error('Error fitting view to extent:', error);
                    }
                } else {
                    console.error('Invalid extent:', extent);
                }
            } else {
                console.error('No features found.');
            }

            // Listen for map interactions (drag, zoom, etc.)
            map.on('pointerdown', () => {
                mapContainer.classList.add('active'); // Enable map interactions
            });

            // When the pointer leaves the map, disable interaction
            map.on('pointerup', () => {
                mapContainer.classList.remove('active'); // Allow scrolling again
            });

            map.on('mouseout', () => {
                mapContainer.classList.remove('active'); // Reset on mouse out
            });

            // Click markers to trigger dropdown and scroll to divider
            map.on('singleclick', (event) => {
                const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
                if (feature) {
                    const tripId = feature.get('trip_id');
                    console.log('Clicked marker:', tripId);

                    // Scroll to the Recent Trips section and expand the clicked trip
                    const tripElement = document.getElementById(`trip-${tripId}`); // Use a unique ID to target the trip divider
                    if (tripElement) {
                        tripElement.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Delay the toggleTripDetails call
                    setTimeout(() => {
                        toggleTripDetails(tripId);
                    }, 1000); // Delay before toggling
                } else {
                    console.log('No marker found.');
                }
            });

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'marker-tooltip';
            document.body.appendChild(tooltip);

            // Event listener to allow hovering on markers
            map.on('pointermove', (e) => {
                const pixel = map.getEventPixel(e.originalEvent);
                const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature);

                vectorSource.getFeatures().forEach((feature) => {
                    feature.setStyle(customDefaultMarker);
                });

                if (feature) {
                    const coordinates = feature.getGeometry().getCoordinates();
                    const location = allTripLocations.find(loc =>
                        fromLonLat([parseFloat(loc.longitude), parseFloat(loc.latitude)])
                            .toString() === coordinates.toString()
                    )?.location; // Get location name based on the coordinates matching the marker hovered over

                    feature.setStyle(customHoverMarker);

                    tooltip.innerHTML = location || 'Unknown Location';
                    tooltip.style.left = `${e.originalEvent.pageX + 10}px`;
                    tooltip.style.top = `${e.originalEvent.pageY + 10}px`;
                    tooltip.style.opacity = 1;
                } else {
                    tooltip.style.opacity = 0;
                }
            });


            return () => map.setTarget(undefined);
        }
    }, [allTripLocations]); // rerenders when trip locations are updated

    
    const openCurrencyPopup = () => {
        setCurrencyPopupVisible(true);
    };

    const closeCurrencyPopup = () => {
        setCurrencyPopupVisible(false);
    };


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
                    <h1>Welcome Back, {userName}!</h1>
                    <br /> 
                    <button 
                        onClick={() => setPopUpVisible(true)} 
                        className='create-trip'>
                        New Trip
                    </button>
                    
                    {isPopUpVisible && (
                        <TripFormComponent
                            isPopUpVisible={isPopUpVisible} 
                            setPopUpVisible={setPopUpVisible} 
                            userId={userId} 
                        />
                    )}
                    <br /><br />
                    <p>See everywhere you've gone:</p>
                </div>
        
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                    {/* Map section */}
                    <div ref={mapRef} style={{ height: '537px', width: '65%' }}></div>

                    {/* Recent Trips section */}
                    <div style={{ width: '35%', marginLeft: '10px' }}>
                        <RecentTripsComponent trips={trips} />
                    </div>
                </div>

                <br /><br />
                {/* Recent trips section */}
                <div className="recent-trips">
                    <h2>Recent Trips</h2>
                    <br />
                    {trips.length === 0 ? (
                        <p>No trips created.</p>
                    ) : (
                        Array.isArray(trips) ? (
                            <div>
                                {trips.map(trip => (
                                    <div key={trip.trip_id}>
                                        <div
                                            id={`trip-${trip.trip_id}`} // Unique ID for each trip 
                                            onClick={() => toggleTripDetails(trip.trip_id)}
                                            className={animatedTripId === trip.trip_id ? "shake" : ''} // Apply animation
                                            style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', marginBottom: '5px', backgroundColor: expandedTripId === trip.trip_id ? '#2e7d32' : '#588157' }}>
                                            {trip.name}
                                        </div>
                                        {expandedTripId === trip.trip_id && (
                                            <div style={{ padding: '10px', backgroundColor: expandedTripId === trip.trip_id ? '#2e7d32' : '#588157', border: '1px solid #ccc' }}>
                                                <p><strong>Dates:</strong> {trip.start_date} ~ {trip.end_date}</p>
                                                <p><strong>Budget:</strong> ${trip.budget}</p>
                                                <Link href={`/singletrip?tripId=${trip.trip_id}`} style={{ color: 'white', textDecoration: 'underline' }}>
                                                    See more
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No trips available.</p>
                        )
                    )}
                </div>
            
            </div>
        </GoogleOAuthProvider>
    );
}

export default homepage;
