import React, { useState, useEffect } from 'react';
import '../../css/recentTrips.css';
import DisplayOneImageComponent from './DisplayOneImageComponent';

const RecentTripsComponent = ({ trips }) => {
    const [recentTrips, setRecentTrips] = useState([]);

    const DateComponent = ({ dateStr, showYear }) => {
        const [year, month, day] = dateStr.split('-');
        const options = showYear
            ? { month: 'long', day: 'numeric', year: 'numeric' }
            : { month: 'long', day: 'numeric' };
    
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(
            new Date(year, month - 1, day)
        );
    
        const parts = formattedDate.split(' ');
        const abbreviatedMonth = parts[0].slice(0, 3);
        const restOfDate = parts.slice(1).join(' ');
    
        return <span>{`${abbreviatedMonth} ${restOfDate}`}</span>;
    };
    

    useEffect(() => {
        // Function to find the three most recent trips
        const findRecentTrips = () => {
            if (trips.length === 0) return [];
            const sortedTrips = [...trips].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            return sortedTrips.slice(0, 3);
        };

        const updatedRecentTrips = findRecentTrips();
        setRecentTrips(updatedRecentTrips);
    }, [trips]);

    const handleTripClick = (tripId) => {
        window.location.href = `/singletrip?tripId=${tripId}`;
    };

    return (
        <div className="recent-trips-container">
            <h2>Recent & Upcoming Trips</h2>
            {recentTrips.map(trip => (
                <div 
                    key={trip.trip_id} 
                    className="trip-card" 
                    onClick={() => handleTripClick(trip.trip_id)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '10px 0', marginRight: '-5px'}} 
                >
                    <DisplayOneImageComponent tripId={trip.trip_id} size="medium" />
                    <div className="trip-info">
                        <h3>{trip.name}</h3>
                        <p className="recent-trip-dates">
                            <DateComponent 
                                dateStr={trip.start_date} 
                                showYear={trip.start_date.split('-')[0] !== trip.end_date.split('-')[0]} 
                            /> 
                            ~
                            <DateComponent 
                                dateStr={trip.end_date} 
                                showYear={trip.start_date.split('-')[0] !== trip.end_date.split('-')[0]} 
                            />
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentTripsComponent;
