import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { createApi } from 'unsplash-js';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/singletrip.css';
import '../../css/modifyTrip.css';

const EditTripComponent = ({ tripId, tripData, tripLocations, userRole }) => {
    // hide button if user is not trip owner
    if (userRole == 'viewer') return null;

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(tripData.data?.name || "");
    const [startDate, setStartDate] = useState(tripData.data?.start_date || "");
    const [endDate, setEndDate] = useState(tripData.data?.end_date || "");
    const [budget, setBudget] = useState(tripData.data?.budget || ""); 
    const [tripLocationsState, setTripLocationsState] = useState(tripLocations || []);
    const [tempLocation, setTempLocation] = useState('');
    const [suggestions, setSuggestions] = useState([]);
 

    const unsplash = createApi({
        accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      });
    
      // Uses the Unsplash API to fetch one pgoto based on a single trip location
      const getImageURL = async (trip_location) => {
        try {
          const response = await unsplash.search.getPhotos({
            query: trip_location,
            page: 1,
            perPage: 10,
            orientation: 'landscape'
          });
          if (response.response && response.response.results.length > 0) {
            const images = response.response.results.map(image => image.urls.regular); // array of 10 images
    
            const random_index = Math.floor(Math.random() * response.response.results.length); // random index img to set as image url
            const imageURL = images[random_index]
            return imageURL;
            } 
            else {
              return null;
            }
          } catch (error) {
            console.error('Error finding images:', error.message, error.response?.data);
    
          }
      };

      

    useEffect(() => {
        if (isOpen) {
            setTripLocationsState(tripLocations || []);
        }
    }, [isOpen, tripLocations]);

    // console.log(startDate, endDate);   

    // console.log(name, startDate, endDate, budget);
    const fetchLocationSuggestions = async (query) => {
        if (query) {
            try {
                const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                    params: {
                        q: query,
                        key: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY,
                        limit: 5,
                    },
                });
                const results = response.data.results.map(result => result.formatted);
                setSuggestions(results);
            } catch (error) {
                console.error('Error fetching location suggestions:', error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const selectLocation = (suggestion) => {
        if (!tripLocationsState.includes(suggestion) && tripLocationsState.length < 10) {
            setTripLocationsState(prev => [...prev, suggestion]);
        } else if (tripLocationsState.length >= 10) {
            alert("You can only add a maximum of 10 locations.");
        }
        setSuggestions([]);
        setTempLocation('');
    };
    
    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const requestBody = { name, start_date: startDate, end_date: endDate, budget }; 
            const requestLocations = { tripId, locations: tripLocationsState };
    
            // Determine which locations were added
            const addedLocations = tripLocationsState.filter(location => !tripLocations.includes(location));
    
            // Generate images for new locations
            const imageURLs = await Promise.all(
                addedLocations.map(async (location) => {
                    const imageURL = await getImageURL(location);
                    if (imageURL) {
                        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/trips/${tripId}`, { image_url: imageURL });
                    }
                })
            );
    
            //Determine which locations are deleted
            const deletedPositions = tripLocations
                .map((location, index) => ({ location, index }))
                .filter(({ location }) => !tripLocationsState.includes(location))
                .map(({ index }) => index);
    
            //Delete the images based on the specified position
            for (const position of deletedPositions) {
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/trips/${tripId}/${position}`);
            }
    
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`, requestBody); //Update the trip data
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/update-locations`, requestLocations); //Update the location data
    
            toast.success("Trip updated successfully!");
            setIsOpen(false);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error updating trip:', error.message);
            if (error.response) {
                console.error('Response error:', error.response.data);
            }
            toast.error("Error updating trip. Please try again.");
        }
    };
    // console.log(tripLocationsState)
    return (
        <>
            <div className="icon-div" tooltip="Edit Trip" tabIndex="0">
                <div className="icon-SVG">
                    <svg
                        onClick={() => setIsOpen(true)}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span className="icon-text">Edit Trip</span>
                </div>
            </div>
            
            {/* Create Edit Trip popup form */}
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
                        <h2 className="share-trip-title">Edit Trip</h2>
                        <form onSubmit={handleEdit}>
                            <label className="share-trip-field-label">
                                Name:
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Start Date:
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                End Date:
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Budget:
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    required
                                />
                            </label>
                            
                            <label className="share-trip-field-label">
                                Locations:
                                <input
                                    type="text"
                                    value={tempLocation}
                                    onChange={(e) => {
                                        setTempLocation(e.target.value);
                                        fetchLocationSuggestions(e.target.value);
                                    }}
                                    placeholder="Enter city or country"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            selectLocation(tempLocation);
                                        }
                                    }}
                                />
                            </label>

                            <div>
                                {tripLocationsState.map((location, index) => (
                                    <div key={index} className="edit-trip-selected-location">
                                        <span className="edit-trip-location-text">{location}</span>
                                        <div className="edit-trip-icon-div" onClick={() => {
                                            setTripLocationsState(prev => prev.filter((loc, i) => i !== index));
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                            <span className="edit-trip-icon-text">Remove</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {suggestions.length > 0 && (
                                <div className="edit-trip-suggestion-dropdown">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="edit-trip-suggestion-item"
                                            onClick={() => selectLocation(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" className="share-trip-button">Submit</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default EditTripComponent;