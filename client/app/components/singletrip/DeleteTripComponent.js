import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/singletrip.css';
import '../../css/modifyTrip.css';

const DeleteTripComponent = ({ tripId, userRole }) => {
    const [isMounted, setIsMounted] = useState(false); // State to check if component is mounted

    useEffect(() => {
        setIsMounted(true); // Set mounted to true on client-side
    }, []);

    const handleDelete = async () => {
        if (window.confirm('Please confirm trip deletion. This action cannot be undone.')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`);
                toast.success("Trip successfully deleted!");
                setTimeout(() => {
                    window.location.href = '/homepage';
                }, 1500);
            } catch (error) {
                console.error('Error deleting trip:', error);
                toast.error("Error deleting trip. Please try again.");
            }
        }
    };

    const removeTrip = async (userId) => {
        if (window.confirm('Please confirm removal of this trip. This action cannot be undone.')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}/trips/${tripId}`);
                window.location.href = '/homepage';
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
            <div className="icon-div delete-icon" title={userRole !== 'owner' ? 'Remove Trip' : 'Delete Trip'} tabIndex="0">
                <div className="icon-SVG">
                    <svg
                        onClick={handleDeleteAction}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span className="icon-text">Delete Trip</span>
                </div>
            </div>

            {isMounted && <ToastContainer hideProgressBar={true} />} {/* Render only on the client */}
        </>
    );
};

export default DeleteTripComponent;
