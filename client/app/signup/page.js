'use client';

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import logo from '../img/newlogo.png'
import '../css/signup.css'
import axios from 'axios';
import { Inria_Sans } from 'next/font/google';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const googleID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const inriaSans = Inria_Sans({
    weight: ['300', '400', '700'],
    subsets: ['latin']
});

function Signup() {

    const handleLoginSuccess = async (response) => {
        const token = response.credential
        const tokenBody = { token: token }

        axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/auth/google`, tokenBody)
            .then(response => {
                toast.success("Sign in successful!");
                localStorage.setItem("user_id", response.data.user.user_id);
                localStorage.setItem("token", token);
                setTimeout(() => {
                    window.location.href = '/homepage';
                }, 1500);
            })
            .catch(error => {
                console.error('Axios error:', error.response ? error.response.data : error.message);
                toast.error("Sign in failed. Please try again.");
            });
    };

    const handleLoginFailure = (error) => {
        console.error('Signup failed:', error.response ? error.response.data : error.message);
        toast.error("Sign in failed. Please try again.");
    };

    return (
        <GoogleOAuthProvider clientId={googleID}>
            <ToastContainer hideProgressBar={true} />
            <div className={`container text-center ${inriaSans.className}`}>
                <div className='row'>
                    <div className='col-md-6 logo'>
                        <Image src={logo} alt="Logo" width={"15vw"} height={"15vw"} priority/>
                    </div>
                    <div className='col-md-6 signIn'>
                        <div>
                            <h1 className='signInGoogle'>Sign In With Google</h1>
                            <GoogleLogin
                                onSuccess={handleLoginSuccess}
                                onError={handleLoginFailure}
                            />
                            <h2 className='welcome'>Welcome to Trip Trends!</h2>
                            <p className='description'>We hope you enjoy your adventure with our easily accessible and modernized app. Here’s to a great time!</p>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>

    );
}

export default Signup;
