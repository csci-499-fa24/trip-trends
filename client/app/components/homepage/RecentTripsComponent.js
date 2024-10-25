import React, { useState, useEffect } from 'react';
import '../../css/recentTrips.css';

const RecentTripsComponent = ({ trips }) => {
    // Sort the trips by date (descending) and get the latest three trips
    const recentTrips = trips
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    return (
        <div className="recent-trips-container">
            <h2>Recent & Upcoming</h2>
            {recentTrips.map(trip => (
                <div key={trip.id} className="trip-card">
                    {/* <img src={trip.image} alt={trip.name} className="trip-image" /> */}
                    <div className="trip-info">
                        <h3>{trip.name}</h3>
                        <p>{trip.dates}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentTripsComponent;
