'use client';

import React, { useEffect, useState } from 'react';
import '../css/singletrip.css';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';

function Singletrip() {
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('tripId');
        setTripId(id);
    }, []);

    useEffect(() => {
        if (tripId) {
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/get-trip/${tripId}`)
                .then(response => {
                    setTripData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching trip data:', error);
                });
        }
    }, [tripId]);

    return (
        <div>
            {tripData ? (
                <div>
                    <h1>{tripData.data.name}</h1>
                    <Table striped bordered hover size="sm" responsive="sm">
                        <thead>
                            <tr>
                                <th>Trip Name</th>
                                <th>Trip Budget</th>
                                <th>Trip Start Date</th>
                                <th>Trip End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{tripData.data.name}</td>
                                <td>{tripData.data.budget}</td>
                                <td>{tripData.data.start_date}</td>
                                <td>{tripData.data.end_date}</td>
                            </tr>
                        </tbody>
                    </Table>
                    {tripData.data.image ? (
                        <p>{tripData.data.image}</p>
                    ) : (
                        <p></p>
                    )}
                </div>
            ) : (
                <p>Loading Trip Data...</p>
            )}
        </div>
    );
}

export default Singletrip;