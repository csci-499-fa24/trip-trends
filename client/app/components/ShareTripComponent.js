import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/modifyTrip.css';

const ShareTripComponent = ({ tripId, isOwner }) => {
    // hide button if user is not trip owner
    if (!isOwner) return null;
    
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");

    const handleShare = async (e) => {
        e.preventDefault(); // prevent default form submission
        if (!email || !role) {
            toast.error("Please fill in all fields.");
            return;
        }
        try {
            const userId = localStorage.getItem("user_id");
            const requestBody = { "role": role, "email": email };
            console.log(requestBody);
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}/trips/${tripId}`, 
                requestBody
            );
            setEmail("");
            setRole("editor");
            toast.success("Trip shared successfully!");
            setIsOpen(false);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "An error occurred while sharing the trip."
            );
        }
    };

    return (
        <>
            <div class="icon-div" tooltip="Share Trip" tabindex="0">
                <div class="icon-SVG">
                    <svg
                    onClick={() => setIsOpen(true)}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                <span class="icon-text">Share Trip</span>
                </div>
            </div>

            

            {/* Create Share Trip popup form */}
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsOpen(false)}>&times;</span>
                        <h2 className="share-trip-title">Share Trip</h2>
                        <form onSubmit={handleShare}>
                            <label className="share-trip-field-label">
                                User's Email:
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>

                            <label className="share-trip-field-label">
                                Trip Access:
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="owner">Owner</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </label>

                            <button type="submit" className="share-trip-button">Confirm Share</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default ShareTripComponent;
