'use client';

import React, { useEffect, useState } from 'react';
import TripImageComponent from '../components/singletrip/TripImageComponent';
import UploadTripImage from '../components/singletrip/UploadTripImage';

function Gallery() {
    const [tripId, setTripId] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('tripId');
        const userRole = urlParams.get('userRole');
        setTripId(tripId);
        setUserRole(userRole);
    }, []);

    if (!tripId || !userRole) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {/* Add Image Button */}
            {userRole == 'owner' || userRole == 'editor' ? (
                <UploadTripImage tripId={tripId} />
            ) : null}
            {/* Call the ImagesComponent and pass the tripId */}
            <TripImageComponent tripId={tripId} />
        </div>
    )
}

export default Gallery