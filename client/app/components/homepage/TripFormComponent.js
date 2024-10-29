import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import '../../css/homepage.css';
import { toast } from 'react-toastify';

const TripFormComponent = ( {isPopUpVisible, setPopUpVisible, userId} ) => {
    // const router = useRouter();
    const today = new Date().toISOString().split('T')[0];
    const [newTripData, setNewTripData] = useState({
        name: '',
        start_date: today,
        end_date: today,
        budget: 0,
        image: null
    });
    const [newTripLocation, setNewTripLocation] = useState({ trip_locations: [] });
    const [tempLocation, setTempLocation] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [locationsNotProvided, setLocationsNotProvided] = useState(false);

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

    const submitNewTrip = async (e) => {
        e.preventDefault();
        // No locations selected
        if (newTripLocation.trip_locations.length === 0) {
            setLocationsNotProvided(true);
            alert("Please provide at least one location.")
            return;
        }
        try {
            let trip_submission_response = null;
            try {
                trip_submission_response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`, newTripData); // locations not needed for a trip submission
                toast.success("Trip successfully created!");
            } catch (error) {
                console.error("Error submitting trip data:", error);
                toast.error("Trip creation failed. Please try again later.");
            }

            const trip_id = trip_submission_response.data.data.trip_id;
            const num_trip_locs = newTripLocation.trip_locations.length;

            // For every location, create a trip location entry
            for (let i = 0; i < num_trip_locs; i++) {
                let a_trip_location = { trip_id: trip_id, location: newTripLocation.trip_locations[i] };
                let geocode_response = null;
                try {
                    geocode_response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                        params: {
                            q: a_trip_location.location,
                            key: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY
                        }
                    });
                }
                catch (error) {
                    console.error("Error fetching geocode response using trip location.")
                }
                let trimmed_location = null;
                const location_type = geocode_response.data.results[0].components._type;
                try {
                    trimmed_location = geocode_response.data.results[0].components[location_type];
                    a_trip_location.location = trimmed_location;
                }
                catch {
                    trimmed_location = a_trip_location.location; // original location
                }

                // POST trip location
                try {
                    await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${trip_id}`, a_trip_location);
                }
                catch (error) {
                    console.error(`Error creating trip location ${i + 1}:`, error);
                }

                // UPDATE the trip location with location coordinates
                const lat = geocode_response.data.results[0].geometry.lat;
                const long = geocode_response.data.results[0].geometry.lng;
                const currency = geocode_response.data.results[0].annotations.currency.iso_code;
                const coordinates = { "latitude": lat, "longitude": long, "currency_code": currency };
                try {
                    await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${trip_id}/${a_trip_location.location}`, coordinates);
                } catch (error) {
                    console.error("Error updating trip location with coordinates");
                }

            }
            
            setPopUpVisible(false); // Close the popup
            setNewTripData({ name: '', start_date: '', end_date: '', budget: '' }); // Reset form fields
            setNewTripLocation({ trip_locations: [] }); // Reset locations
            // await router.push(`/singletrip?tripId=${trip_id}`); 

            // Refresh trips and trip locations
            await fetchUserTrips();
            await fetchTripLocations();
            setLocationsNotProvided(false);

        } catch (error) {
            console.error("Error creating trip:", error);
        }

    };
    return (
        // Create a trip popup form 
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
                                        <div className="icon-div" tooltip="Remove" tabIndex="0" onClick={() => {
                                                setNewTripLocation(prev => ({
                                                    trip_locations: prev.trip_locations.filter((loc, i) => i !== index) // Remove selected location
                                                }));
                                            }}>
                                                <div className="icon-SVG">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="remove-icon">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                <span className="icon-text">Remove</span>
                                            </div>
                                        </div>
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
    
                            <button type="submit" className="button">Create</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripFormComponent;