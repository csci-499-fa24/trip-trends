import ShareTripComponent from "./ShareTripComponent"
import EditTripComponent from "./EditTripComponent"
import DownloadTripComponent from "./DownloadTripComponent"
import DeleteTripComponent from "./DeleteTripComponent"
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
            {/* <div className="shared-users"> */}
            
            {/* </div> */}
            {/* Home Button */}
            <div className="icon-div" tooltip="Home" tabIndex="0">
                    <div onClick={() => window.location.href = '/homepage'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
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
        </header>
    )
}

export default TripIconBarComponent;