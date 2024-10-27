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
import HeaderComponent from '../components/HeaderComponent';
import TripFormComponent from '../components/homepage/TripFormComponent';
import HomeCurrencyPopupComponent from '../components/homepage/HomeCurrencyPopupComponent';
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

    // // Captures new input instantly in each popup field
    // const newTripInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setNewTripData({ ...newTripData, [name]: value });
    // };

    // const newTripLocInputChange = (e) => {
    //     const value = e.target.value;
    //     setTempLocation(value);
    //     fetchLocationSuggestions(value);
    // };

    // const fetchLocationSuggestions = useCallback(debounce(async (query) => {
    //     if (query) {
    //         try {
    //             const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
    //                 params: {
    //                     q: query,
    //                     key: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY, // Using OpenCage API key
    //                     limit: 5 // Limit the number of suggestions
    //                 }
    //             });
    //             const results = response.data.results.map(result => result.formatted); // Extract formatted addresses
    //             setSuggestions(results); // Set suggestions state
    //         } catch (error) {
    //             console.error('Error fetching location suggestions:', error);
    //             setSuggestions([]); // Clear suggestions on error
    //         }
    //     } else {
    //         setSuggestions([]);
    //     }
    // }, 200), // debounce delay to reduce the number of API calls to avoid errors
    //     []);

    // const selectSuggestion = (suggestion) => {
    //     // Check if the suggestion is not already included and if the max limit is not reached
    //     if (!newTripLocation.trip_locations.includes(suggestion) && newTripLocation.trip_locations.length < 10) {
    //         setNewTripLocation(prev => ({
    //             trip_locations: [...prev.trip_locations, suggestion] // Add selected suggestion to locations array
    //         }));
    //     } else if (newTripLocation.trip_locations.length >= 10) {
    //         alert("You can only add a maximum of 10 locations."); // Alert if limit is reached
    //     }
    //     setSuggestions([]); // Clear suggestions after selection
    //     setTempLocation(''); // Clear input field after selection
    // };

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

    // const submitNewTrip = async (e) => {
    //     e.preventDefault();
    //     // No locations selected
    //     if (newTripLocation.trip_locations.length === 0) {
    //         setLocationsNotProvided(true);
    //         alert("Please provide at least one location.")
    //         return;
    //     }
    //     try {
    //         let trip_submission_response = null;
    //         try {
    //             trip_submission_response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`, newTripData); // locations not needed for a trip submission
    //             toast.success("Trip successfully created!");
    //         } catch (error) {
    //             console.error("Error submitting trip data:", error);
    //             toast.error("Trip creation failed. Please try again later.");
    //         }

    //         const trip_id = trip_submission_response.data.data.trip_id;
    //         const num_trip_locs = newTripLocation.trip_locations.length;

    //         // For every location, create a trip location entry
    //         for (let i = 0; i < num_trip_locs; i++) {
    //             let a_trip_location = { trip_id: trip_id, location: newTripLocation.trip_locations[i] };
    //             let geocode_response = null;
    //             try {
    //                 geocode_response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
    //                     params: {
    //                         q: a_trip_location.location,
    //                         key: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY
    //                     }
    //                 });
    //             }
    //             catch (error) {
    //                 console.error("Error fetching geocode response using trip location.")
    //             }
    //             let trimmed_location = null;
    //             const location_type = geocode_response.data.results[0].components._type;
    //             try {
    //                 trimmed_location = geocode_response.data.results[0].components[location_type];
    //                 a_trip_location.location = trimmed_location;
    //             }
    //             catch {
    //                 trimmed_location = a_trip_location.location; // original location
    //             }

    //             // POST trip location
    //             try {
    //                 await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${trip_id}`, a_trip_location);
    //             }
    //             catch (error) {
    //                 console.error(`Error creating trip location ${i + 1}:`, error);
    //             }

    //             // UPDATE the trip location with location coordinates
    //             const lat = geocode_response.data.results[0].geometry.lat;
    //             const long = geocode_response.data.results[0].geometry.lng;
    //             const currency = geocode_response.data.results[0].annotations.currency.iso_code;
    //             const coordinates = { "latitude": lat, "longitude": long, "currency_code": currency };
    //             try {
    //                 await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${trip_id}/${a_trip_location.location}`, coordinates);
    //             } catch (error) {
    //                 console.error("Error updating trip location with coordinates");
    //             }

    //         }
            
    //         setPopUpVisible(false); // Close the popup
    //         setNewTripData({ name: '', start_date: '', end_date: '', budget: '' }); // Reset form fields
    //         setNewTripLocation({ trip_locations: [] }); // Reset locations

    //         // Refresh trips and trip locations
    //         await fetchUserTrips();
    //         await fetchTripLocations();
    //         setLocationsNotProvided(false);

    //     } catch (error) {
    //         console.error("Error creating trip:", error);
    //     }

    // };

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

    const toggleProfileDropdown = () => {
        setProfileDropdownVisible(!profileDropdownVisible);
    };

    const openCurrencyPopup = () => {
        setCurrencyPopupVisible(true);
    };

    const closeCurrencyPopup = () => {
        setCurrencyPopupVisible(false);
    };

    const handleChangeDisplayName = async () => {
        const newDisplayName = prompt('Enter a new display name:');
        if (newDisplayName) {
            setUserName(newDisplayName);
            try {
                const newUserData = {
                    fname: newDisplayName, // Assuming the new display name is the first name
                };

                // Send the PUT request to update user details
                const response = await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`, newUserData);

                // Update the frontend state after successful update
                setUserName(newDisplayName);
                toast.success("Display name successfully updated!")
                // console.log('Display name updated successfully:', response.data);
            } catch (error) {
                console.error('Error updating display name:', error);
                toast.error("Display name failed to updated.")
            }
        }
    };

    return (
        <div className='main-container'>
        <GoogleOAuthProvider clientId={googleID}>
            <ToastContainer />
            <div className="dashboard">
                {/* Header section */}
                <header className="header">
                        TRIP TRENDS

                    {/* Profile Container on the right */}
                    <div className="profile-container">
                        <Image
                            className="profile-icon"
                            src={profileImageUrl} // User's Google profile image
                            alt="Profile"
                            width={40}
                            height={40}
                            onClick={toggleProfileDropdown} // Toggle dropdown on click
                        />
                        {profileDropdownVisible && (
                        <div className="dropdown">
                            <div className="dropdown-item" onClick={handleLogout}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                                Logout
                            </div>
                            <div className="dropdown-item" onClick={handleChangeDisplayName}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                </svg>
                                Change Display Name
                            </div>
                            {/* Currency selection button */}
                            <div className="dropdown-item" onClick={openCurrencyPopup}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                                Select Home Currency
                            </div>
                        </div>
                    )}

                    </div>
                </header>
                <HomeCurrencyPopupComponent isOpen={currencyPopupVisible} onClose={closeCurrencyPopup} userId={userId} />
                {/* Welcome section */}
                <div className="welcome-section">
                    <h1>Welcome Back, {userName}!</h1>
                    <br></br>
                    <button onClick={() => setPopUpVisible(true)} className='create-trip'>New Trip</button>
                    {isPopUpVisible && (
                        <TripFormComponent
                            isPopUpVisible={isPopUpVisible} 
                            setPopUpVisible={setPopUpVisible} 
                            userId={userId} 
                        />
                    )}
                    <br></br>
                    <br></br>
                    <p>See everywhere you've gone:</p>
                </div>
                {/* <div>
                    <button onClick={() => setPopUpVisible(true)}>Create New Trip</button>
                    {isPopUpVisible && (
                        <TripFormComponent
                            isPopUpVisible={isPopUpVisible} 
                            setPopUpVisible={setPopUpVisible} 
                            userId={userId} 
                        />
                    )}
                </div> */}
                {/* Create a trip popup form */}
                {/* <div className="trip-form">
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

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {/* Map section */}
                    <div ref={mapRef} style={{ height: '537px', width: '65%' }}></div>

                    {/* Recent Trips section */}
                    <div style={{ width: '35%', marginLeft: '10px' }}>
                        <RecentTripsComponent trips={trips} />
                    </div>
                </div>


                {/* Recent trips section */}
                <div className="recent-trips">
                    <br></br>
                    <h2>Recent Trips</h2>
                    <br></br>
                    {trips.length === 0 ? (
                        <p>No trips created.</p>
                    ) : (
                        Array.isArray(trips) && trips.length > 0 ? (
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
                                                <p>
                                                    <strong>Dates:</strong> {trip.start_date} - {trip.end_date}
                                                </p>
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
        </div>
    );
}

export default homepage;
