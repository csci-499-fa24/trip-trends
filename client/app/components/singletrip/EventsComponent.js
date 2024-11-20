import React, { useEffect, useState, useRef } from 'react';
import '../../css/discover.css';


const EventComponent = ({ tripId, tripLocations }) => {

    const [storedTripId, setStoredTripId] = useState(tripId);
    const [storedTripLocations, setStoredTripLocations] = useState(tripLocations);

    useEffect(() => {
        setStoredTripId(tripId);
        setStoredTripLocations(tripLocations);
    }, [tripId, tripLocations]);

    return (
        <div>
            <h1>Event Component</h1>
            <p>Trip ID: {storedTripId}</p>
            <p>Trip Locations: {storedTripLocations.join(', ')}</p> {/* Displaying trip locations as a comma-separated list */}
        </div>
    );
};

export default EventComponent;
