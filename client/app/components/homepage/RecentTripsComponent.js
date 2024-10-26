import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';
import '../../css/recentTrips.css';

const RecentTripsComponent = ({ trips }) => {
    const [tripLocations, setTripLocations] = useState({}); // Store locations by trip ID
    const recentTrips = trips
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .slice(0, 3);

    // Effect to fetch trip locations for all recent trips
    useEffect(() => {
        const fetchAllTripLocations = async () => {
            const locations = await Promise.all(
                recentTrips.map(trip => {
                    return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${trip.trip_id}`)
                        .then(response => ({
                            tripId: trip.trip_id,
                            locations: response.data.data.map(location => location.location)
                        }))
                        .catch(error => {
                            console.error('Error fetching trip locations for trip ID:', trip.trip_id, error);
                            return { tripId: trip.trip_id, locations: [] }; // Return an empty array on error
                        });
                })
            );

            // Set all fetched locations in the state
            const locationsByTripId = locations.reduce((acc, { tripId, locations }) => {
                acc[tripId] = locations;
                return acc;
            }, {});

            setTripLocations(locationsByTripId);
        };

        fetchAllTripLocations(); // Call the function to fetch locations
    }, [recentTrips]); // Run effect when recentTrips change

    const handleTripClick = (tripId) => {
        // Navigate to the trip page
        window.location.href = `/singletrip?tripId=${tripId}`; // Adjust the URL as needed
    };

    return (
        <div className="recent-trips-container">
            <h2>Recent & Upcoming</h2>
            {recentTrips.map(trip => (
                <div 
                    key={trip.trip_id} 
                    className="trip-card" 
                    onClick={() => handleTripClick(trip.trip_id)} // Add the onClick handler
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '10px 0' }} // Flex layout
                >
                    {/* Image to the left */} 
                    <div className="trip-image-wrapper">
                        <DefaultTripImagesComponent tripId={trip.trip_id} tripLocations={tripLocations[trip.trip_id] || []} />
                    </div>
                    <div className="trip-info">
                        <h3>{trip.name}</h3>
                        <p>{trip.start_date} – {trip.end_date}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentTripsComponent;