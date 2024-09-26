'use client';

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import logo from '../img/Logo.png'
import '../css/signup.css'
import axios from 'axios';

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Signup() {

    const handleLoginSuccess = async (response) => {
        const token = {token: response.credential}

        axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/auth/google`, token)
            .then(response => {
                console.log(response)
                window.location.href = '/homepage'; 
                // toast to tell user success
                // navigate to home page
            })
            .catch(error => {
                console.error(error)
                // toast to user to say there's an error
            });
    };

    const handleLoginFailure = (error) => {
        console.error('Signup failed:', error);
        // toast to user to say there's an error
    };

    return (
        <GoogleOAuthProvider clientId={googleID}>
            <div className='container text-center'>
                <div className='row'>
                    <div className='col-md-6 logo'>
                        <Image src={logo} alt="Logo" width={"15vw"} height={"15vw"} />
                    </div>
                    <div className='col-md-6 signIn'>
                        <div>
                            <h2>Sign In With Google</h2>
                            <GoogleLogin
                                onSuccess={handleLoginSuccess}
                                onError={handleLoginFailure}
                            />
                            <p>Welcome to Trip Trends! We hope you enjoy your adventure with our easily accessible and modernized app. Here’s to a great time!</p>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>

    );
}

export default Signup;
