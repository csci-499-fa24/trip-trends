'use client';

import React, { useEffect, useState, useRef } from 'react';
import '../css/singletrip.css';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/homepage.css';


function Singletrip() {
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [newExpenseData, setNewExpenseData] = useState({
        trip_id: '',
        name: '',
        amount: '',
        currency: '',
        category: '',
        posted: '',
        notes: ''
    });
    const [expenseCategories] = useState([
        "Flights",
        "Accommodation",
        "Car Rentals",
        "Fuel",
        "Groceries",
        "Restaurants",
        "Snacks",
        "Beverages",
        "Tours",
        "Tickets",
        "Entertainment",
        "Public Transport",
        "Taxis/Rideshares",
        "Parking",
        "Hotels",
        "Hostels",
        "Vacation Rentals",
        "Souvenirs",
        "Clothing",
        "Essentials",
        "Tips",
        "Travel Insurance",
        "Phone Roaming",
        "Internet/Wi-Fi",
        "Phone Calls",
        "Medication",
        "First Aid",
        "Other"
        // Add more categories as needed
    ]);


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

    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://data.fixer.io/api/symbols?access_key=' + `${process.env.NEXT_PUBLIC_FIXER_KEY}`,
            headers: {}
        };

        axios.request(config)
            .then(response => {
                // logCurrencyCodes(response.data); // Pass the response data to the function
                if (response.data.success && response.data.symbols) {
                    // Extracting currency codes and setting state
                    const codes = Object.keys(response.data.symbols);
                    setCurrencyCodes(codes);

                    // Log the currency codes to the console
                    console.log("Fetched Currency Codes:", codes);
                } else {
                    console.error("Failed to fetch currency symbols or symbols is undefined:", response);
                }
            })
            .catch(error => {
                console.error("Error fetching currency symbols:", error);
            });

    }, []);


    // Captures new input instantly in each popup field
    const newExpenseInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpenseData({ ...newExpenseData, [name]: value });
    };


    const submitNewExpense = async (e) => {
        e.preventDefault();
        // Example form submission logic (e.g., send data to backend)
        console.log('New Expense Data:', newExpenseData);
        console.log(tripId);
        const updatedExpenseData = {
            ...newExpenseData,
            trip_id: tripId // Set the trip_id to the new value
        };
        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/create-expense`, updatedExpenseData);
        // Clear form fields
        setNewExpenseData({
            trip_id: '',
            name: '',
            amount: '',
            currency: '',
            category: '',
            posted: '',
            notes: ''
        });

        // Hide the modal after submission
        setPopUpVisible(false);
    };



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
            {/* Create a expense popup form */}
            <br></br>
            <button onClick={() => setPopUpVisible(true)} className='create-expense'>Create a expense</button>
            <br></br>
            <br></br>
            <div className="expense-form">
                {isPopUpVisible && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setPopUpVisible(false)}>&times;</span>
                            <h2 className="new-expense-title">New Expense</h2>
                            <form onSubmit={submitNewExpense}>
                                <label className="new-expense-field-label">
                                    Expense Name:
                                    <input
                                        type="text"
                                        name="name"
                                        value={newExpenseData.name}
                                        onChange={newExpenseInputChange}
                                        required
                                    />
                                </label>
                                <label className="new-expense-field-label">
                                    Amount:
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newExpenseData.amount}
                                        onChange={newExpenseInputChange}
                                        required
                                    />
                                </label>

                                {/* <label className="new-expense-field-label">
                                    Currency:
                                    <input
                                        type="text"
                                        name="currency"
                                        value={newExpenseData.currency}
                                        onChange={newExpenseInputChange}
                                        required
                                    />
                                </label> */}

                                <label className="new-expense-field-label">
                                    Currency:
                                    <select
                                        name="currency"
                                        value={newExpenseData.currency}
                                        onChange={newExpenseInputChange}
                                        required
                                    >
                                        <option value="">Select Currency</option>
                                        {currencyCodes.map((code) => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                </label>

                                {/* <label className="new-expense-field-label">
                                    Category:
                                    <input
                                        type="text"
                                        name="category"
                                        value={newExpenseData.category}
                                        onChange={newExpenseInputChange}
                                        required
                                    />
                                </label> */}

                                <label className="new-expense-field-label">
                                    Category:
                                    <select
                                        name="category"
                                        value={newExpenseData.category}
                                        onChange={newExpenseInputChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {expenseCategories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="new-expense-field-label">
                                    Date:
                                    <input
                                        type="date"
                                        name="posted"
                                        value={newExpenseData.posted}
                                        onChange={newExpenseInputChange}
                                        required
                                    />
                                </label>

                                <label className="new-expense-field-label">
                                    Notes:
                                    <input
                                        type="text"
                                        name="notes"
                                        value={newExpenseData.notes}
                                        onChange={newExpenseInputChange}
                                    />
                                </label>
                                <button type="submit" className="submit-new-expense-button">Create</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
}

export default Singletrip;