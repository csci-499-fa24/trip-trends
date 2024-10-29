import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useHeader = (userId, setUserName) => {
    const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    
    useEffect(() => {
        // Used to display user's image if token exists
        const handleToken = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const userCredential = jwtDecode(token);
                const userProfileImage = userCredential.picture;
                setProfileImageUrl(userProfileImage);
            } else {
                console.log("Token not found. Redirecting to sign in page.");
                window.location.href = '/signup';
            }
        };
        handleToken();
    }, []);

    const toggleProfileDropdown = () => {
        setProfileDropdownVisible(!profileDropdownVisible);
    };

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("token");
        window.location.href = '/signup';
    };

    const handleChangeDisplayName = async () => {
        const newDisplayName = prompt('Enter a new display name:');
        if (newDisplayName) {
            setUserName(newDisplayName);
            try {
                const newUserData = {
                    fname: newDisplayName, // Assuming the new display name is the first name
                };
                // console.log('newUserData:', newUserData);
                // Send the PUT request to update user details
                const response = await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`, newUserData);

                // Update the frontend state after successful update
                setUserName(newDisplayName);
                toast.success("Display name successfully updated!")
                // console.log('Display name updated successfully:', response.data);
            } catch (error) {
                console.error('Error updating display name:', error);
                toast.error("Display name failed to update.")
            }
        }
    };

    return {
        profileImageUrl,
        profileDropdownVisible,
        toggleProfileDropdown,
        handleLogout,
        handleChangeDisplayName,
    };
};

export default useHeader;