'use client';

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import logo from '../img/Logo.png'
import '../css/signup.css'

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Signup() {
    const handleLoginSuccess = async (response) => {
        // console.log('Encoded JWT ID token:', response.credential);
        const token = response.credential

        // console.log(token)

        const userData = jwtDecode(token)

        const name = userData.name;
        const email = userData.email;
        const imageUrl = userData.picture;

        // console.log('Name:', name);
        // console.log('Email:', email);
        // console.log('Image URL:', imageUrl);

        const splitName = name.split(" ")
        const firstName = splitName[0]
        const lastName = splitName[1]
        // console.log("FirstName: ", firstName)
        // console.log("LastName: ", lastName)

        const signUpData = {
            fname: firstName,
            lname: lastName,
            email: email,
            imageUrl: imageUrl
        }

        // send to backend
    };

    const handleLoginFailure = (error) => {
        console.error('Signup failed:', error);
    };

    return (
        <GoogleOAuthProvider clientId={googleID}>
            <div class='container text-center'>
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
