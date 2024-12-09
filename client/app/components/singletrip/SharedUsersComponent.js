import React, { useEffect, useState } from "react";
import "../../css/sharedUsersComponent.css";
import noImage from "../../img/no-user.png";
import Image from "next/image";
import axios from "axios";

const SharedUsersComponent = ({ tripId, userId, isHomepage = false }) => {
    const [sharedUsers, setSharedUsers] = useState([]);
    const [hoveredUser, setHoveredUser] = useState(null);
    const [showAllUsers, setShowAllUsers] = useState(false);

    useEffect(() => {
        const fetchSharedUsers = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`);
                const users = response.data.data.filter(user => user.role !== "owner");
                setSharedUsers(users);
            } catch (error) {
                console.error("Error fetching shared users:", error);
            }
        };

        fetchSharedUsers();
    }, [tripId, userId]);

    const getSharedWithMessage = () => {
        if (sharedUsers.length === 0) return "Not Shared";
        const names = sharedUsers.map(user => user.fname).join(", ");
        return `Shared with ${names}`;
    };

    const handleShowAllUsers = () => {
        setShowAllUsers(!showAllUsers);
    };

    const displayedUsers = showAllUsers ? sharedUsers : sharedUsers.slice(0, 3);
    const additionalUsersCount = sharedUsers.length - displayedUsers.length;

    return (
        <div className={`whole_container ${isHomepage ? "homepage-size" : ""}`}>
             {!isHomepage && (
                <div className="shared-with-message">
                    {getSharedWithMessage()}
                </div>
            )}
            <div className="shared-users">
                {displayedUsers.map(user => (
                    <div key={user.id}
                        className={`shared-user ${isHomepage ? "homepage-user" : ""}`}
                        onMouseEnter={() => setHoveredUser(user)} 
                        onMouseLeave={() => setHoveredUser(null)}
                    >
                        <Image
                            src={user.image || noImage}
                            alt={`${user.fname}'s profile`}
                            width={isHomepage ? 30 : 40}
                            height={isHomepage ? 30 : 40}
                            className="shared-user-image"
                        />
                        {hoveredUser === user && (
                            <div className="popup">
                                {user.role} <br></br> {user.fname.toUpperCase()} {user.lname.toUpperCase()} 
                            </div>
                        )}
                    </div>
                ))}
                {additionalUsersCount > 0 && !showAllUsers && (
                   <div className={`show-more ${isHomepage ? "homepage-show-more" : ""}`} onClick={handleShowAllUsers}>
                        <span className={`show-more-icon ${isHomepage ? "homepage-icon" : ""}`}>+{additionalUsersCount}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedUsersComponent;

