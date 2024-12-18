import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TripFormComponent from "./TripFormComponent";
// import ShareTripComponent from "../singletrip/ShareTripComponent";
// import DeleteTripComponent from "../singletrip/DeleteTripComponent";
import "../../css/tripsDisplay.css";
import SharedUsersComponent from "../singletrip/SharedUsersComponent";
import DisplayOneImageComponent from './DisplayOneImageComponent';


const TripsDisplayComponent = ({ userId, homeCurrency }) => {
    const [trips, setTrips] = useState([]);
    const [tripLocations, setTripLocations] = useState({});
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [favoritedTrips, setFavoritedTrips] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUserTrips = async () => {
        if (!userId) {
            console.error("User ID is not set.");
            return;
        }
        try {
            const [tripsResponse, favoritesResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/users/${userId}`),
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}`)
            ]);
            const tripsData = tripsResponse.data.data;
            const favoritesData = favoritesResponse.data.data;
            const tripsWithFavorites = tripsData.map(trip => {
                const favorite = favoritesData.find(fav => fav.trip_id === trip.trip_id);
                return {
                    ...trip,
                    favorite: favorite ? favorite.favorite : false
                };
            });
            const sortedTrips = tripsWithFavorites.sort((a, b) => b.favorite - a.favorite);
            setTrips(sortedTrips);

        } catch (err) {
            console.error(err);
            setTrips([]);
        }
    };

    const fetchAllTripLocations = async () => {
        const locations = await Promise.all(
            trips.map(trip => {
                return axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${trip.trip_id}`)
                    .then(response => ({
                        tripId: trip.trip_id,
                        locations: response.data.data.map(location => location.location)
                    }))
                    .catch(error => {
                        console.error('Error fetching trip locations for trip ID:', trip.trip_id, error);
                        return { tripId: trip.trip_id, locations: [] }; // Return an empty array on error
                    });
            })
        );

        const locationsByTripId = locations.reduce((acc, { tripId, locations }) => {
            acc[tripId] = locations;
            return acc;
        }, {});
        setTripLocations(locationsByTripId);
    };

    const handleFavoriteClick = async (tripId) => {
        const currentFavoriteStatus = favoritedTrips[tripId] || false;

        try {
            const newFavoriteStatus = !currentFavoriteStatus;
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}/trips/${tripId}`, {
                favorite: newFavoriteStatus
            });

            setFavoritedTrips(prevState => {
                const updatedFavorites = { ...prevState, [tripId]: newFavoriteStatus };
                return updatedFavorites;
            });
        } catch (error) {
            console.error("Error favoriting trip.", error);
        }
    };

    const formatTripDates = (startDate, endDate) => {
        const options = { month: 'short', year: 'numeric' };

        const start = new Date(startDate);
        const end = new Date(endDate);

        const startMonthYear = start.toLocaleDateString('en-US', options);
        const endMonthYear = end.toLocaleDateString('en-US', options);

        if (start.getFullYear() === end.getFullYear()) {
            if (start.getMonth() === end.getMonth()) {
                return `${startMonthYear}`; // same month
            } else {
                return `${startMonthYear.split(' ')[0]} ~ ${endMonthYear}`; // same year
            }
        } else {
            return `${startMonthYear} ~ ${endMonthYear}`; // diff years
        }
    };

    const handleTripClick = (tripId) => {
        window.location.href = `/singletrip?tripId=${tripId}`;
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredTrips = trips.filter((trip) =>
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tripLocations[trip.trip_id] && tripLocations[trip.trip_id].some(location =>
            location.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    useEffect(() => {
        if (userId) {
            fetchUserTrips(); // Fetch trips when userId changes
        }
    }, [userId]);

    useEffect(() => {
        if (trips.length > 0) {
            fetchAllTripLocations();
            const initialFavorites = {};
            trips.forEach(trip => {
                initialFavorites[trip.trip_id] = trip.favorite || false;
            });
            setFavoritedTrips(initialFavorites);
        }
    }, [trips]);

    return (
        <div className="trips-display">
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop:"-40px" }}>
                <div className="col">
                    <h1>View Your Trips:</h1>
                </div>
                <div className="col">
                    <div className="button-container">
                        <div className="button" onClick={() => setPopUpVisible(true)}>
                            New Trip
                        </div>
                    </div>
                </div>
            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for a trip..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {isPopUpVisible && (
                <TripFormComponent
                    isPopUpVisible={isPopUpVisible}
                    setPopUpVisible={setPopUpVisible}
                    userId={userId}
                    homeCurrency={homeCurrency}
                    fetchUserTrips={fetchUserTrips}
                />
            )}
            {filteredTrips.length === 0 ? (
                <p>No trips found.</p>
            ) : (
                <div className="trip-cards">
                    {filteredTrips.map(trip => (
                        <Card
                            id={`trip-${trip.trip_id}`}
                            className="trips-display-card"
                            onClick={() => handleTripClick(trip.trip_id)}
                            key={trip.trip_id}
                            sx={{ width: 300, backgroundColor: 'var(--offwhite)' }}
                        >
                            <CardActionArea>
                                <DisplayOneImageComponent tripId={trip.trip_id} size="large"/>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                        {trip.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary", marginTop: "8px", fontStyle: "italic" }}>
                                        {tripLocations[trip.trip_id]?.slice(0, 3).map((location, index) => (
                                            <span key={index}>
                                                {location}{index < tripLocations[trip.trip_id].slice(0, 3).length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {formatTripDates(trip.start_date, trip.end_date)}
                                    </Typography>
                                    <div
                                        className="favorite-icon"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleFavoriteClick(trip.trip_id);
                                        }}
                                    >
                                        {favoritedTrips[trip.trip_id] ? (
                                            <StarIcon sx={{ color: '#fdfd96', zIndex: 2 }} />
                                        ) : (
                                            <StarBorderIcon sx={{ color: 'gray', zIndex: 2 }} />
                                        )}
                                    </div>
                                     <SharedUsersComponent tripId={trip.trip_id} userId={userId} isHomepage={true} />
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TripsDisplayComponent;
