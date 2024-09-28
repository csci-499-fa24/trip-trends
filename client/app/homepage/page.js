'use client';

import React from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import '../css/homepage.css'

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Homepage() {
    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("token");
        window.location.href = '/signup';
    };

    return (
        <GoogleOAuthProvider clientId={googleID}>
            <button onClick={handleLogout} className='logout'>Logout</button>
        </GoogleOAuthProvider>
    );
}
export default Homepage;
