import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import DefaultTripImagesComponent from "../singletrip/DefaultTripImagesComponent";
import ShareTripComponent from "../singletrip/ShareTripComponent";
import DeleteTripComponent from "../singletrip/DeleteTripComponent";
import "../../css/tripsDisplay.css";

const TripsDisplayComponent = ({ trips }) => {
    const [tripLocations, setTripLocations] = useState({});

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

    const formatTripDates = (startDate, endDate) => {
        const options = { month: 'short', year: 'numeric' };

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startMonthYear = start.toLocaleDateString('en-US', options);
        const endMonthYear = end.toLocaleDateString('en-US', options);
        console.log("startMonthYear:", startMonthYear);
        console.log("endMonthYear:", endMonthYear.split(' ')[0]);
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

    useEffect(() => {
        if (trips.length > 0) {
            fetchAllTripLocations();
        }
    }, [trips]);

    const handleTripClick = (tripId) => {
        window.location.href = `/singletrip?tripId=${tripId}`;
    };

    return (
        <div className="trips-display">
            <br />
            <h2>All Trips</h2>
            <br />
            {trips.length === 0 ? (
                <p>No trips created.</p>
            ) : (
                <div className="trip-cards">
                    {trips.map(trip => (
                        <Card className="trips-display-card" onClick={() => handleTripClick(trip.trip_id)} key={trip.trip_id} sx={{ width: 300, backgroundColor: 'var(--offwhite)' }}>
                            <CardActionArea>
                            <div className="trips-display-image-wrapper">
                                <DefaultTripImagesComponent 
                                    tripId={trip.trip_id} 
                                    tripLocations={tripLocations[trip.trip_id] || []} 
                                />
                            </div>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                        {trip.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {formatTripDates(trip.start_date, trip.end_date)}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            {/* <CardActions>
                                <ShareTripComponent tripId={trip.trip_id} />
                                <DeleteTripComponent tripId={trip.trip_id} />
                            </CardActions> */}
                        </Card>
                    ))}
                </div>
            )}
        </div>       
    );
};

export default TripsDisplayComponent;
