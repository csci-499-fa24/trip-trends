import React from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/singletrip.css';

const DeleteTripComponent = ({ tripId, userRole }) => {
    const handleDelete = async () => {
        if (window.confirm('Please confirm trip deletion. This action cannot be undone.')) {
            try {
                // delete trip
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`);
                window.location.href = '/homepage'; // redirect to homepage
            } catch (error) {
                console.error('Error deleting trip:', error);
                toast.error("Error deleting trip. Please try again.");
            }
        }
    };

    const removeTrip = async (userId) => {
        if (window.confirm('Please confirm removal of this trip. This action cannot be undone.')) {
            try {
                // delete user from trip
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sharedtrips/users/${userId}/trips/${tripId}`);
                window.location.href = '/homepage'; // redirect to homepage
            } catch (error) {
                console.error('Error removing trip:', error);
                toast.error("Error removing trip. Please try again.");
            }
        }
    };

    const handleDeleteAction = () => {
        const userId = localStorage.getItem("user_id");
        if (userRole !== 'owner') {
            removeTrip(userId);
        } else {
            handleDelete();
        }
    };

    return (
        <>
            <div className="text-center">
                <button onClick={handleDeleteAction} className="delete-trip-button">
                    {userRole !== 'owner' ? 'Remove Trip' : 'Delete Trip'}
                </button>
            </div>

            <ToastContainer />
        </>
    );
};

export default DeleteTripComponent;
