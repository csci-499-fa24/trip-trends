import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/sharedTrip.css';

const ShareTripComponent = ({ tripId, isOwner }) => {
    // hide button if user is not trip owner
    if (!isOwner) return null;
    // console.log("isOwner: ", isOwner);
    // console.log("tripId: ", tripId);

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
            <div className="text-center">
                <button onClick={() => setIsOpen(true)} className="share-trip-button">
                    Share Trip
                </button>
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

                            <button type="submit" className="share-trip-button">Share</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default ShareTripComponent;
