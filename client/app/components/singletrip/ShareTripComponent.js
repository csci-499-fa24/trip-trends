import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/modifyTrip.css';

const ShareTripComponent = ({ tripId, isOwner }) => {
    // hide button if user is not trip owner
    if (!isOwner) return null;
    
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    const [sharedUsers, setSharedUsers] = useState([]);

    useEffect(() => {
        const fetchSharedUsers = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`);
                setSharedUsers(response.data.data);
            } catch (error) {
                console.error("Error fetching shared users:", error);
                toast.error("Failed to load shared users.");
            }
        };

        fetchSharedUsers();
    }, [tripId]);

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
            window.location.reload();

        } catch (error) {
            toast.error(
                error.response?.data?.message || "An error occurred while sharing the trip."
            );
        }
        window.location.reload();
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/${userId}/trips/${tripId}`, { role: newRole });
            setSharedUsers(prevUsers => 
                prevUsers.map(user => 
                    user.user_id === userId ? { ...user, role: newRole } : user
                )
            );
            toast.success("Role updated successfully: " + user.name + " now has " + newRole + "access!");
        } catch (error) {
            toast.error("Failed to update role.");
        }
    };

    const handleRemoveUser = async (userId) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/${userId}/trips/${tripId}`);
            setSharedUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
            toast.success("User removed successfully!");
        } catch (error) {
            toast.error("Failed to remove user.");
        }
    };

    return (
        <>
            <div className="icon-div" tooltip="Share Trip" tabIndex="0">
                <div className="icon-SVG">
                    <svg
                    onClick={() => setIsOpen(true)}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                    </svg>
                <span className="icon-text">Share Trip</span>
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

                            {/* Display existing shared users */}
                            <div className="existing-users-section">
                                {sharedUsers.map(user => (
                                    <div key={user.user_id} className="share">
                                        <span className="share-trip-field-label">{user.fname} {user.lname}</span>
                                        <div className="share-user-actions">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                                className="share-trip-dropdown"
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="editor">Editor</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                            <div className="edit-trip-icon-div" onClick={() => handleRemoveUser(user.user_id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="edit-trip-icon-SVG">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="button">Confirm</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default ShareTripComponent;
