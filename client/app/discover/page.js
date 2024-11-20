'use client';
import React, { useState, useEffect } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/discover.css';
import axios from 'axios';

import EventsComponent from '../components/singletrip/EventsComponent';

function DiscoverPage() {
  const [tripId, setTripId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [tripLocation, setTripLocation] = useState([]);

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



  return (
    <div className='container'>

      <ToastContainer hideProgressBar={true} />
      <HeaderComponent
        headerTitle="Discover Page"
        setUserName={setUserName}
        userId={userId}
      />

      <div className="icon-div" onClick={() => window.location.href = `/singletrip?tripId=${tripId}`} tooltip="Back" tabIndex="0" style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
        <div className="icon-SVG">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6" style={{ width: '24px', height: '24px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          <span className="icon-text">Back</span>
        </div>
      </div>

      <EventsComponent tripId={tripId}/>
    </div>
  );
}

export default DiscoverPage;
