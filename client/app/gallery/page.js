'use client';

import React, { useEffect, useState, useRef } from 'react';
import TripImageComponent from '../components/singletrip/TripImageComponent';
import UploadTripImage from '../components/singletrip/UploadTripImage';
import HeaderComponent from '../components/HeaderComponent';
import NavBarComponent from '../components/singletrip/NavBarComponent';
import LoadingPageComponent from '../components/LoadingPageComponent';
import axios from 'axios';

function Gallery() {
    const [tripId, setTripId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const [tripName, setTripName] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    const tripImageRef = useRef();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoadingTimedOut(true); 
            }
        }, 5000); // 5 seconds

        return () => clearTimeout(timeoutId);
    }, [loading]);

    const getUserId = () => {
        const user_id = localStorage.getItem("user_id");
        if (user_id) {
            setUserId(user_id);
        } else {
            console.error("User ID not found.");
        }
    }

    const fetchUserName = async () => {
        const userId = localStorage.getItem("user_id");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`);
            if (response.data && response.data.data) {
                const userData = response.data.data;
                setUserName(userData.fname);
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

        const fetchTripName = () => {
            if (tripId) {
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`)
                    .then(response => {
                        setTripName(`${response.data.data.name}`);
                    })
                    .catch(error => {
                        console.error('Error fetching trip data:', error);
                    })
            }
        };

        getUserId();
        fetchUserName();
        fetchTripName();
        setLoading(false);
    }, []);

    const handleImageUpload = () => {
        tripImageRef.current.refetchImages();
    };

    if (loading && !loadingTimedOut) {
        return (
            <div>
                <HeaderComponent
                    headerTitle="Trip Gallery"
                    setUserName={setUserName}
                    userId={userId}
                />
                <NavBarComponent tripId={tripId} userRole={userRole} tripName={tripName} pointerDisabled={true}/>
                <header className="top-icon-bar-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div className="icon-div" tooltip="Gallery" tabIndex="0" style={{ display: 'flex', cursor: 'pointer' }}>
                        {userRole === 'owner' || userRole === 'editor' ? (
                            <UploadTripImage tripId={tripId} onUpload={handleImageUpload}/>
                        ) : null}
                    </div>
                </header> 
                <LoadingPageComponent />
            </div>
        );
    }

    if (loadingTimedOut) {
        return (
            <div>
                <HeaderComponent
                    headerTitle="Trip Gallery"
                    setUserName={setUserName}
                    userId={userId}
                />
                <NavBarComponent tripId={tripId} userRole={userRole} tripName={tripName} pointerDisabled={true}/>
                <header className="top-icon-bar-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div className="icon-div" tooltip="Gallery" tabIndex="0" style={{ display: 'flex', cursor: 'pointer' }}>
                        {userRole === 'owner' || userRole === 'editor' ? (
                            <UploadTripImage tripId={tripId} onUpload={handleImageUpload} />
                        ) : null}
                    </div>
                </header> 
                <TripImageComponent tripId={tripId} ref={tripImageRef}/>
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
            <NavBarComponent tripId={tripId} userRole={userRole} tripName={tripName} pointerDisabled={true}/>
            <header className="top-icon-bar-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                
                <div className="icon-div" tooltip="Gallery" tabIndex="0" style={{ display: 'flex', cursor: 'pointer' }}>
                    {userRole === 'owner' || userRole === 'editor' ? (
                        <UploadTripImage tripId={tripId} onUpload={handleImageUpload} />
                    ) : null}
                </div>
            </header>
            <TripImageComponent tripId={tripId} ref={tripImageRef}/>
        </div>
    )
}

export default Gallery;
