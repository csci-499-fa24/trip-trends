'use client';
import React, { useState, useEffect } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/discover.css';
import axios from 'axios';

import EventsComponent from '../components/singletrip/EventsComponent';
import FlightsComponent from '../components/singletrip/FlightsComponent';
import NavBarComponent from '../components/singletrip/NavBarComponent';

function DiscoverPage() {
  const [tripId, setTripId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [tripLocation, setTripLocation] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const isOwner = userRole === 'owner';
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tripId = queryParams.get('tripId');
    setTripId(tripId);

    getUserId();
    fetchUserName();
  }, []);

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
    const fetchUserRole = async () => {
        if (tripId && userId) {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`);
                const sharedTrips = response.data.data;
                const userRole = sharedTrips.find(trip => trip.user_id === userId)?.role;
                if (userRole) {
                    setUserRole(userRole);
                } else {
                    console.log("User does not have a role for this trip.");
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
                // setError('Error fetching user role. Please try again later.');
            }
        } else {
            console.log("tripId or userId is missing.");
        }
    };
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
    fetchUserRole();
    fetchTripName();

  }, [tripId]);

  return (
    <div className='container'>

      <ToastContainer hideProgressBar={true} />
      <HeaderComponent
        headerTitle="Activities Page"
        setUserName={setUserName}
        userId={userId}
      />
      <NavBarComponent tripId={tripId} userRole={userRole} tripName={tripName} pointerDisabled={true}/>
      {/* <FlightsComponent tripId={tripId}/> */}
      <EventsComponent tripId={tripId}/>
    </div>
  );
}

export default DiscoverPage;
