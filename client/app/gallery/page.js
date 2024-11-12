'use client';

import React, { useEffect, useState } from 'react';
import TripImageComponent from '../components/singletrip/TripImageComponent';
import UploadTripImage from '../components/singletrip/UploadTripImage';
import HeaderComponent from '../components/HeaderComponent';

function Gallery() {
    const [tripId, setTripId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");

    const getUserId = () => {
        // Get user ID to create and get trip from onboarded user
        const user_id = localStorage.getItem("user_id");
        if (user_id) {
            setUserId(user_id);
        }
        else {
            console.error("User ID not found.");
        }
    }

    // Used to display user's name
    const fetchUserName = async () => {
        const userId = localStorage.getItem("user_id");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`);
            if (response.data && response.data.data) {
                const userData = response.data.data;
                setUserName(userData.fname); // Set the username from the database
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('tripId');
        const userRole = urlParams.get('userRole');
        setTripId(tripId);
        setUserRole(userRole);

        getUserId();
        fetchUserName();
    }, []);

    if (!tripId || !userRole) {
        return (
            <div>
                <HeaderComponent
                    headerTitle="Trip Gallery"
                    setUserName={setUserName}
                    userId={userId}
                />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <p>Loading your Gallery...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container'>
            <HeaderComponent
                headerTitle="Trip Gallery"
                setUserName={setUserName}
                userId={userId}
            />
            <header className="top-icon-bar-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {/* Back Button */}
                <div className="icon-div" onClick={() => window.location.href = `/singletrip?tripId=${tripId}`} tooltip="Back" tabIndex="0" style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
                    <div className="icon-SVG">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" style={{ width: '24px', height: '24px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                    </div>
                    <span className="icon-text">Back</span>
                </div>
                {/* Gallery Button */}
                <div className="icon-div" tooltip="Gallery" tabIndex="0" style={{ display: 'flex', cursor: 'pointer' }}>
                    {/* Add Image Button */}
                    {userRole === 'owner' || userRole === 'editor' ? (
                        <UploadTripImage tripId={tripId} />
                    ) : null}
                </div>
            </header>
            {/* Call the ImagesComponent and pass the tripId */}
            <TripImageComponent tripId={tripId} />
        </div>
    )
}

export default Gallery