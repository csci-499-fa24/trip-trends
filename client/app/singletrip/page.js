'use client';

import React, { useEffect, useState, useRef } from 'react';
import '../css/singletrip.css';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/homepage.css';

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

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
        "Food",
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
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`)
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
                if (response.data.success && response.data.symbols) {
                    const codes = Object.keys(response.data.symbols);
                    setCurrencyCodes(codes);

                    // console.log("Fetched Currency Codes:", codes);
                } else {
                    console.error("Failed to fetch currency symbols or symbols is undefined:", response);
                }
            })
            .catch(error => {
                console.error("Error fetching currency symbols:", error);
            });

    }, []);


    const newExpenseInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpenseData({ ...newExpenseData, [name]: value });
    };


    const submitNewExpense = async (e) => {
        e.preventDefault();
        // console.log('New Expense Data:', newExpenseData);
        // console.log(tripId);

        const updatedExpenseData = {
            ...newExpenseData,
            trip_id: tripId
        };

        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses`, updatedExpenseData);

        setNewExpenseData({
            trip_id: '',
            name: '',
            amount: '',
            currency: '',
            category: '',
            posted: '',
            notes: ''
        });

        setPopUpVisible(false);
    };



    const getTripDates = () => {
        if (!tripData) {
            return { startDate: null, endDate: null };
        }

        const startDate = startOfDay(parseISO(tripData.data.start_date));
        const endDate = endOfDay(parseISO(tripData.data.end_date));

        return { startDate, endDate };
    };

    const { startDate, endDate } = getTripDates();

    const isDateInRange = (date) => {
        if (!startDate || !endDate) {
            return false;
        }
        return date >= startDate && date <= endDate;
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
                    <Calendar
                        tileClassName={({ date }) => {
                            if (isDateInRange(date)) {
                                return 'highlighted-date';
                            }
                            if (date.toDateString() === endDate.toDateString()) {

                                return 'highlighted-date';
                            }
                            return null;
                        }}
                    />
                    {tripData.data.image ? (
                        <p>{tripData.data.image}</p>
                    ) : (
                        <p>[Gallery of photos]</p>
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