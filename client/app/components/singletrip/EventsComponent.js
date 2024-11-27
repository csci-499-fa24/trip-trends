import React, { useEffect, useState, useRef } from 'react';
import '../../css/discover.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingPageComponent from '../LoadingPageComponent';


const EventComponent = ({ tripId }) => {

    const [storedTripId, setStoredTripId] = useState(tripId);
    const [locationsData, setLocationsData] = useState([]);
    const [tripData, setTripData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [sightseeingData, setSightseeingData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    const [activeTab, setActiveTab] = useState('events'); // 'events' or 'sightseeing'

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoadingTimedOut(true); 
            }
        }, 5000); // 5 seconds

        return () => clearTimeout(timeoutId);
    }, [loading]);

    useEffect(() => {
        setStoredTripId(tripId);
    }, [tripId]);

    useEffect(() => {
        if (tripId) {
            getTripLocation();
            getTripInfo();
        }
    }, [tripId]);

    useEffect(() => {
        if (tripData?.data?.start_date && tripData?.data?.end_date && locationsData?.length > 0) {
            locationsData.forEach((location) => {
                //console.log("Location Data:", location);
                // console.log("Trip Data:", tripData.data);
                const { latitude, longitude } = location;
                const { start_date, end_date } = tripData.data;

                getEvents(latitude, longitude, start_date, end_date);
                getSightseeing(latitude, longitude);
            });
        } else {
            console.log("Problem with locationsData:", locationsData);
        }
    }, [tripData, locationsData]);

    const getTripLocation = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`)
            .then(response => {
                // console.log(response.data);
                const data = response.data.data;

                const locationsWithLatLong = data.map(item => ({
                    location: item.location,
                    latitude: item.latitude,
                    longitude: item.longitude,
                }));

                setLocationsData(locationsWithLatLong);

            })
            .catch(error => {
                console.error('Error fetching trip data:', error);
            });
    };

    const getTripInfo = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`)
            .then(response => {
                // console.log(response.data);
                setTripData(response.data);
            })
            .catch(error => {
                console.error('Error fetching trip data:', error);
            })
    };

    const getEvents = (latitude, longitude, start_date, end_date) => {
        if (!start_date || !end_date) {
            console.error('Start and End dates are required');
            return;
        }
        let config = {
            method: 'get',
            maxBodyLength: 10,
            url:
                'https://app.ticketmaster.com/discovery/v2/events.json?' +
                `latlong=${latitude},${longitude}` +
                `&radius=30` +
                `&unit=miles` +
                `&startDateTime=${start_date}T00:00:00Z` +
                `&endDateTime=${end_date}T23:59:59Z` +
                `&apikey=${process.env.NEXT_PUBLIC_EVENTS_API_KEY}` +
                `&size=50`,
            headers: {}
        };

        axios.request(config)
            .then((response) => {
                console.log(response.data);
                setEventsData((prevData) => [
                    ...prevData,
                    ...response.data._embedded?.events || []
                ]);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    async function getSightseeing(latitude, longitude) {
        const API_KEY = `${process.env.NEXT_PUBLIC_SIGHTSEEING_API_KEY}`;
        const baseURL = 'https://api.geoapify.com/v2/places';

        const params = {
            categories: 'tourism.sights,building.tourism',
            filter: `circle:${longitude},${latitude},10000`,
            bias: `proximity:${longitude},${latitude}`,
            limit: 100,
            apiKey: API_KEY,
        };

        try {
            setLoading(true); // Set loading state
            const response = await axios.get(baseURL, { params });
            console.log('API Response:', response.data.features);
            setSightseeingData((prevData) => [
                ...prevData,
                ...response.data.features || []
            ]);
            setError(null); // Clear any previous error
        } catch (error) {
            console.error('Error fetching tourist places:', error.message);
            setError(error.message); // Save error message in state
        } finally {
            setLoading(false); // End loading state
        }
    }


    const handleAddEvent = (event) => {
        console.log('Event added:', event);

        // Check if event name is present, else show an error toast
        if (!event.name && !event.properties?.name_international?.en && !event.properties?.formatted) {
            toast.error("Event name is missing. Please provide a valid event.");
            setTimeout(() => {
            }, 500);
        } else {
            // Determine if the name is for an event or sightseeing
            const newEvent = {
                name: event.name || event.properties?.name_international?.en || event.properties?.formatted || 'Unknown Name',
                list_type: "sightseeing",
                is_completed: false
            };

            console.log("ADDING EVENT: ", newEvent);

            // Event body to send for adding the event
            const eventBody = {
                name: newEvent.name,
                list_type: "sightseeing",
                is_completed: false
            };

            axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/create-item/${tripId}`, eventBody)
                .then((response) => {
                    console.log(response);
                    toast.success("Event added successfully!");
                    setTimeout(() => {
                    }, 500);
                })
                .catch((error) => {
                    console.error("Error adding event:", error);
                    toast.error("Failed to add the event.");
                    setTimeout(() => {
                    }, 500);
                });
        }
    };

    if (loading && !loadingTimedOut) {
        return <LoadingPageComponent />;
    }

    if (loadingTimedOut) {
        return <p>Nothing to display...</p>;
    }

    return (
        <div className="event-widget-container">
            {/* Toggle Buttons */}
            <div className="toggle-container">
                <button
                    className={`toggle-button ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    Events
                </button>
                <button
                    className={`toggle-button ${activeTab === 'sightseeing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sightseeing')}
                >
                    Sightseeing
                </button>
            </div>

            {/* Conditional Rendering Based on Active Tab */}
            {activeTab === 'events' && (
                <div className="event-widget">
                    <h2 className="section-title">Events</h2>
                    <div className="event-container">
                        {eventsData.length > 0 ? (
                            eventsData.map((event, index) => (
                                <div key={index} className="event-card">
                                    <button
                                        className="add-button"
                                        onClick={() => handleAddEvent(event)}
                                    >
                                        +
                                    </button>
                                    {event.images && event.images.length > 0 ? (
                                        <img
                                            src={event.images[0].url}
                                            alt={event.name}
                                            className="event-image"
                                        />
                                    ) : (
                                        <div className="event-placeholder">No Image Available</div>
                                    )}
                                    <div className="event-content">
                                        <p className="event-date">
                                            {new Date(event.dates?.start?.localDate).toDateString()} at{' '}
                                            {event.dates?.start?.localTime || 'TBA'}
                                        </p>
                                        <h3 className="event-title">{event.name}</h3>
                                        <div className="event-location">
                                            <p className="event-loc-name">{event._embedded?.venues[0]?.name}</p>
                                            <p className="event-loc">{event._embedded?.venues[0]?.city?.name}</p>
                                        </div>
                                        <p>
                                            <a
                                                href={event.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="event-detail"
                                            >
                                                View Event Details
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-events">No Events Found</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'sightseeing' && (
                <div className="event-widget">
                    <h2 className="section-title">Sightseeing</h2>
                    {sightseeingData.length === 0 ? (
                        <p>No sightseeing places found.</p>
                    ) : (
                        <div className="event-container">
                            {sightseeingData.map((place, index) => (
                                <div key={`sightseeing-${index}`} className="event-card">
                                    <button
                                        className="add-button"
                                        onClick={() => handleAddEvent(place)}
                                    >
                                        +
                                    </button>
                                    <div className="event-content">
                                        <h3 className="event-title">{place.properties.name_international?.en || place.properties.name || 'Unknown Place'}</h3>
                                        <p><strong>Address:</strong> {place.properties.formatted || 'No address available'}</p>
                                        <br />
                                        <p><strong>Description:</strong> {place.properties.description || 'Tourist Attraction'}</p>
                                        <p>
                                            {place.properties.website ? (
                                                <a
                                                    href={place.properties.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="website-link"
                                                >
                                                    Visit Official Website
                                                </a>
                                            ) : (
                                                <span>No URL</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

    );
};

export default EventComponent;
