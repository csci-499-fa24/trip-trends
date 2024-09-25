'use client';

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Signup() {
    const handleLoginSuccess = async (response) => {
        console.log('Encoded JWT ID token:', response.credential);
        // const token = response.credential

        // console.log(token)

        const userData = jwtDecode(token)

        const name = userData.name;
        const email = userData.email;
        const imageUrl = userData.picture;

        // console.log('Name:', name);
        // console.log('Email:', email);
        // console.log('Image URL:', imageUrl);


        // send to backend
    };

    const handleLoginFailure = (error) => {
        console.error('Signup failed:', error);
    };

    return (
        <GoogleOAuthProvider clientId={googleID}>
            <div>
                <h2>SIGNUP PAGE</h2>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginFailure}
                />
            </div>
        </GoogleOAuthProvider>
    );
}

export default Signup;
