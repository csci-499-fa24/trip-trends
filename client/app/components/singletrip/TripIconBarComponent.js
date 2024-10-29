import ShareTripComponent from "./ShareTripComponent"
import EditTripComponent from "./EditTripComponent"
import DownloadTripComponent from "./DownloadTripComponent"
import DeleteTripComponent from "./DeleteTripComponent"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import Image from 'next/image';
import homeIcon from "../../img/homeIcon.png";

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
                    <div onClick={() => window.location.href = ‘/homepage’}>
                        <Image src={homeIcon} alt= “homepage” width={55} height={55} />
                    </div>
                    <span class= “icon-text” > Home </span>
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