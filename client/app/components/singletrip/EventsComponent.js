import React, { useEffect, useState, useRef } from 'react';
import '../../css/discover.css';
import axios from 'axios';


const EventComponent = ({ tripId }) => {

    const [storedTripId, setStoredTripId] = useState(tripId);
    const [locationsData, setLocationsData] = useState([]);
    const [tripData, setTripData] = useState([]);
    const [eventsData, setEventsData] = useState([]);


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
                console.log("Location Data:", location);
                console.log("Trip Data:", tripData.data);
                const { latitude, longitude } = location;
                const { start_date, end_date } = tripData.data;

                getEvents(latitude, longitude, start_date, end_date);
            });
        } else {
            console.log("Problem with locationsData:", locationsData);
        }
    }, [tripData, locationsData]);

    const getTripLocation = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`)
            .then(response => {
                console.log(response.data);
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
                console.log(response.data);
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
                `&size=30`,
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

    return (
        <div>
            <h2>Events</h2>
            <div className="event-container">
                {eventsData.length > 0 ? (
                    eventsData.map((event, index) => (
                        <div key={index} className="event-card">
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
                                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="event-location">
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
    );
};

export default EventComponent;
