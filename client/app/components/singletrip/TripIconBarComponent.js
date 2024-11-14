import ShareTripComponent from "./ShareTripComponent"
import EditTripComponent from "./EditTripComponent"
import DownloadTripComponent from "./DownloadTripComponent"
import DeleteTripComponent from "./DeleteTripComponent"
import SharedUsersComponent from "./SharedUsersComponent"
import { useEffect, useState } from "react"
import axios from "axios"

const TripIconBarComponent = ({ tripId, userId, isOwner, tripData, tripLocations, userRole, fetchTripData }) => {
    const [sharedUsers, setSharedUsers] = useState([]);

    useEffect(() => {
        const fetchSharedUsers = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`)
                const users = response.data.data.filter(user => user.id !== userId);
                setSharedUsers(users);
            } catch (error) {
                console.error("Error fetching shared users:", error);
            }
        };

        fetchSharedUsers();
    }, [tripId, userId]);

    // console.log("sharedUsers:", sharedUsers);

    return (
        <header className="top-icon-bar-header">
            {/* Shared users */}
            <SharedUsersComponent tripId={tripId} userId={userId} />
            {/* Home Button */}
            <div className="icon-div" tooltip="Home" tabIndex="0">
                <div className="icon-SVG">
                    <div onClick={() => window.location.href = '/homepage'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </div>
                </div>
                <span className="icon-text">Home</span>
            </div>
            {/* Share Trip Button */}
            <ShareTripComponent tripId={tripId} isOwner={isOwner} />
            {/* Edit Trip Button */}
            <EditTripComponent tripId={tripId} tripData={tripData} tripLocations={tripLocations} userRole={userRole} onUpdate={fetchTripData} />
            {/* Download Trip Button */}
            <DownloadTripComponent tripData={tripData} tripId={tripId} />
            {/* Delete Trip Button */}
            <DeleteTripComponent tripId={tripId} userRole={userRole} />
            {/* Gallery Button */}
            <div className="icon-div gallery-icon" tooltip="Gallery" tabIndex="0">
                <div className="icon-SVG">
                    <div onClick={() => window.location.href = `/gallery?tripId=${tripId}&userRole=${userRole}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="icon-text">Gallery</span>
                    </div>
                </div>
            </div>
            {/* To Do List Button */}
            <div className="icon-div todo-icon" tooltip="Gallery" tabIndex="0">
                <div className="icon-SVG">
                    <div onClick={() => window.location.href = `/todo?tripId=${tripId}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                        </svg>
                        <span className="icon-text">To-Do List</span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default TripIconBarComponent;