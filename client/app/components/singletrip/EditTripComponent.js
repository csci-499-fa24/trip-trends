import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/singletrip.css';

const EditTripComponent = ({ tripId, tripData, tripLocations, userRole }) => {
    // hide button if user is not trip owner
    if (userRole == 'viewer') return null;

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(tripData.data?.name || "");
    const [startDate, setStartDate] = useState(tripData.data?.start_date || "");
    const [endDate, setEndDate] = useState(tripData.data?.end_date || "");
    const [budget, setBudget] = useState(tripData.data?.budget || ""); 
    // console.log(startDate, endDate);   

    // console.log(name, startDate, endDate, budget);
    
    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const requestBody = { name, start_date: startDate, end_date: endDate, budget }; 
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`, requestBody);
            toast.success("Trip updated successfully!");
            setIsOpen(false);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error updating trip:', error);
            toast.error("Error updating trip. Please try again.");
        }

    };

    return (
        <>
            <div className="icon-div" tooltip="Edit Trip" tabIndex="0">
                <div className="icon-SVG">
                    <svg
                        onClick={() => setIsOpen(true)}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span className="icon-text">Edit Trip</span>
                </div>
            </div>

            {/* Create Edit Trip popup form */}
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
                        <h2 className="share-trip-title">Edit Trip</h2>
                        <form onSubmit={handleEdit}>
                            <label className="share-trip-field-label">
                                Name:
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Start Date:
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                End Date:
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Budget:
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    required
                                />
                            </label>

                            <button type="submit" className="share-trip-button">Submit</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default EditTripComponent;