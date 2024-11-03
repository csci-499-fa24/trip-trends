import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';
import '../../css/recentTrips.css';

const RecentTripsComponent = ({ trips }) => {
    const [tripLocations, setTripLocations] = useState({});
    const [recentTrips, setRecentTrips] = useState([]);

    useEffect(() => {
        // Function to find the three most recent trips
        const findRecentTrips = () => {
            if (trips.length === 0) return [];

            // Initialize an array to hold the three most recent trips
            const recent = [];
            for (let trip of trips) {
                // Check if the trip is among the three most recent
                if (recent.length < 3) {
                    recent.push(trip);
                } else {
                    const oldestIndex = recent.findIndex(t => new Date(t.start_date) < new Date(trip.start_date));
                    if (oldestIndex > -1) {
                        recent[oldestIndex] = trip; // Replace the oldest trip
                    }
                }
            }
            return recent;
        };

        const updatedRecentTrips = findRecentTrips();
        setRecentTrips(updatedRecentTrips);
    }, [trips]);

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

        const locationsByTripId = locations.reduce((acc, { tripId, locations }) => {
            acc[tripId] = locations;
            return acc;
        }, {});
        setTripLocations(locationsByTripId);
    };

    // const formatTripDates = (startDate, endDate) => {
    //     console.log("startDate:", startDate);
    //     if (startDate.split('-')[0] === endDate.split('-')[0]) {
    //         if (startDate.split('-')[1] === endDate.split('-')[1]) {
    //             return `${startDate.split('-')[1]}/${startDate.split('-')[0].slice(-2)}`; // same month
    //         } else {
    //             return `${startDate.split('-')[1]} ~ ${endDate.split('-')[1]}/${startDate.split('-')[0].slice(-2)}`; // same year
    //         }
    //     } else {
    //         return `${startDate.split('-')[1]}/${startDate.split('-')[0].slice(-2)} ~ ${endDate.split('-')[1]}/${endDate.split('-')[0].slice(-2)}`; // diff years
    //     }
    // };    

    useEffect(() => {
        if (recentTrips.length > 0) {
            fetchAllTripLocations();
        }
    }, [recentTrips]);

    const handleTripClick = (tripId) => {
        window.location.href = `/singletrip?tripId=${tripId}`;
    };

    return (
        <div className="recent-trips-container">
            <h2>Recent & Upcoming</h2>
            {recentTrips.map(trip => (
                <div 
                    key={trip.trip_id} 
                    className="trip-card" 
                    onClick={() => handleTripClick(trip.trip_id)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '10px 0' }} 
                >
                    <div className="trip-image-wrapper">
                        <DefaultTripImagesComponent tripId={trip.trip_id} tripLocations={tripLocations[trip.trip_id] || []} />
                    </div>
                    <div className="trip-info">
                        <h3>{trip.name}</h3>
                        <p>{trip.start_date} ~ {trip.end_date}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentTripsComponent;
