import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/singletrip.css';

const EditTripComponent = ({ tripId, tripData, tripLocations, userRole }) => {
    // hide button if user is not trip owner
    if (userRole == 'viewer') return null;

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(tripData?.name || "");
    const [startDate, setStartDate] = useState(tripData?.start_date || "");
    const [endDate, setEndDate] = useState(tripData?.end_date || "");
    const [budget, setBudget] = useState(tripData?.budget || "");

    // console.log(name, startDate, endDate, budget);

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const requestBody = { name, startDate, endDate, budget };
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`, requestBody);
            toast.success("Trip updated successfully!");
            setIsOpen(false);
        } catch (error) {
            console.error('Error updating trip:', error);
            toast.error("Error updating trip. Please try again.");
        }

    };

    return (
        <>
            <div class="icon-div" tooltip="Edit Trip" tabindex="0">
                <div class="icon-SVG">
                    <svg
                        onClick={() => setIsOpen(true)}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span class="icon-text">Edit Trip</span>
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
                                    value={tripData.data.name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Start Date:
                                <input
                                    type="date"
                                    value={tripData.data.start_date}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                End Date:
                                <input
                                    type="date"
                                    value={tripData.data.end_date}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Budget:
                                <input
                                    type="number"
                                    value={tripData.data.budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    required
                                />
                            </label>

                            <button type="submit" className="share-trip-button">Submit Change</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default EditTripComponent;