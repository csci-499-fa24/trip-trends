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
import ReactSpeedometer, { Transition } from 'react-d3-speedometer';
import Image from 'next/image';
import homeIcon from '../img/homeIcon.png';
import Filter from '../img/Filter.png';
import logo from '../img/Logo.png';
import Link from 'next/link';

function Singletrip() {
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [expenseData, setExpenseData] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('');
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

            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}`)
                .then(response => {
                    // console.log(response.data.data)
                    setExpenseData(response.data);
                    setOriginalData(response.data);

                    const savedFilter = localStorage.getItem('selectedFilter');
                    if (savedFilter) {
                        applyFilter(savedFilter, response.data);
                    }

                    const total = response.data.data.reduce((sum, expense) => {
                        const amount = parseFloat(expense.amount);
                        return sum + amount;
                    }, 0);

                    setTotalExpenses(total);
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
                } else {
                    console.error("Failed to fetch currency symbols or symbols is undefined:", response);
                }
            })
            .catch(error => {
                console.error("Error fetching currency symbols:", error);
            });

    }, []);

    const deleteTrip = async () => {
        if (window.confirm('Please confirm trip deletion. This action cannot be undone.')) {
            try {
                // delete trip
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`);
                window.location.href = '/homepage'; // redirect to homepage
            } catch (error) {
                console.error('Error deleting trip:', error);
            }
        }
    };

    const downloadTripData = async () => {
        try {
            const response = await axios({
                url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/download/${tripId}`,
                method: 'GET',
                responseType: 'blob' // important
            });

            // Create a blob from the CSV data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `trip_${tripId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading trip data:', error);
        }
    };

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

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}`, updatedExpenseData);

            setNewExpenseData({
                trip_id: '',
                name: '',
                amount: '',
                currency: '',
                category: '',
                posted: '',
                notes: ''
            });

            window.location.reload();
            setPopUpVisible(false);
        } catch (error) {
            console.error("Error fetching currency symbols:", error);
        }
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

    const handleFilterChange = (filterValue) => {
        applyFilter(filterValue);
        setFilterPopupVisible(false);
    };

    const applyFilter = (filterOption, data = originalData) => {
        let sortedExpenses;
        if (filterOption === 'highest') {
            console.log(expenseData.data);
            sortedExpenses = [...data.data].sort((a, b) => b.amount - a.amount);
        } else if (filterOption === 'lowest') {
            sortedExpenses = [...data.data].sort((a, b) => a.amount - b.amount);
        } else if (filterOption === 'recent') {
            sortedExpenses = [...data.data].sort((a, b) => new Date(b.posted) - new Date(a.posted));
            console.log("Sorted by most recent:", sortedExpenses);
        } else if (filterOption === 'oldest') {
            sortedExpenses = [...data.data].sort((a, b) => new Date(a.posted) - new Date(b.posted));
        }
        setExpenseData({ data: sortedExpenses });
        setSelectedFilter(filterOption);
        localStorage.setItem('selectedFilter', filterOption);
    };

    const clearFilter = () => {
        setSelectedFilter('');
        setExpenseData(originalData); // Reset to the original list

        // Remove the filter from localStorage
        localStorage.removeItem('selectedFilter');
    };


    return (
        <div className="main-container">
        <div>
            {/* Header section */}
            <header className="header">
                <div className="logo-container">
                    <Image src={logo} alt="Logo" width={300} height={300} />
                </div>
                <div className="left-rectangle"></div>
                <div className="right-rectangle"></div>
            </header>

            {tripData ? (
                <div>
                    <div className='homeCorner'>
                        <Link href={`/homepage`}>
                            <Image src={homeIcon} alt="homepage" width={"50"} height={"50"} />
                        </Link>
                    </div>
                    <h1 id='tripName'>{tripData.data.name}</h1>
                    {/* General Trip Info Table */}
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
                    {/* Trip Calendar and Budget Meter */}
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
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
                            </div>
                            <div className='col'>
                                <div className="meter-container">
                                    <p id='budgetTitle'>Your Budget Meter:</p>

                                    {totalExpenses > tripData.data.budget ? (
                                        <div style={{
                                            marginTop: "10px",
                                            width: "350px",
                                            height: "230px",
                                            marginLeft: "50px"
                                        }}>
                                            <p id='budget-text'>You are {totalExpenses - tripData.data.budget} dollars over your budget.</p>
                                            <ReactSpeedometer
                                                width={300}
                                                minValue={0}
                                                maxValue={tripData.data.budget}
                                                value={tripData.data.budget}
                                                needleColor="steelblue"
                                                needleTransitionDuration={2500}
                                                needleTransition={Transition.easeBounceOut}
                                                segments={4}
                                                segmentColors={['#7ada2c', '#d4e725', '#f3a820', '#fe471a']}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{
                                            marginTop: "10px",
                                            width: "350px",
                                            height: "200px",
                                            marginLeft: "50px"
                                        }}>
                                            <ReactSpeedometer
                                                width={300}
                                                minValue={0}
                                                maxValue={tripData.data.budget}
                                                value={totalExpenses}
                                                needleColor="steelblue"
                                                needleTransitionDuration={2500}
                                                needleTransition={Transition.easeBounceOut}
                                                segments={4}
                                                segmentColors={['#7ada2c', '#d4e725', '#f3a820', '#fe471a']}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <br></br>
                    <div className="filter-section">
                        <button onClick={() => setPopUpVisible(true)} className='create-expense'>Create Expense</button>
                        <button className="filter-button" onClick={() => setFilterPopupVisible(true)}>
                            <Image src={Filter} alt="Filter" className="filter-icon" />
                        </button>
                        {selectedFilter && (
                            <div className="applied-filter">
                                <span>{`Filter: ${selectedFilter}`}</span>
                                <button className="clear-filter-btn" onClick={clearFilter}>
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                    <br></br>
                    <br></br>

                    {/* Expense Table */}
                    {expenseData && expenseData.data ? (
                        <div>
                            <Table striped bordered hover size="sm" responsive="sm">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Amount</th>
                                        <th>Category</th>
                                        <th>Currency</th>
                                        <th>Date Posted</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseData.data.map((expense) => (
                                        <tr key={expense.expense_id}>
                                            <td>{expense.name}</td>
                                            <td>{expense.amount}</td>
                                            <td>{expense.category}</td>
                                            <td>{expense.currency}</td>
                                            <td>{expense.posted}</td>
                                            <td>{expense.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Add the Download Button */}
                            <button onClick={downloadTripData} className="download-trip-data-btn">
                                Download Trip
                            </button>

                            {/* Add the Delete Button */}
                            <button onClick={deleteTrip} className="delete-trip-button">
                                Delete Trip
                            </button>
                        </div>
                    ) : (
                        <p>No expenses yet...</p>
                    )}
                    {/* Gallery of Photos like Google Photos or Photos on iPhone*/}
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
            {/* <button onClick={() => setPopUpVisible(true)} className='create-expense'>Create an Expense</button> */}
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

            {/* Create a filter popup form */}
            <div className="filter-container">
                {isFilterPopupVisible && (
                    <div className="filter-popup">
                        <div className="filter-popup-content">
                            <span className="filter-popup-close" onClick={() => setFilterPopupVisible(false)}>&times;</span>
                            <h2 className="filter-popup-title">Filter Expenses</h2>
                            <div className="filter-options">
                                <button
                                    className="filter-option-button"
                                    onClick={() => handleFilterChange('highest')}
                                >
                                    Highest to Lowest
                                </button>
                                <button
                                    className="filter-option-button"
                                    onClick={() => handleFilterChange('lowest')}
                                >
                                    Lowest to Highest
                                </button>
                                <button
                                    className="filter-option-button"
                                    onClick={() => handleFilterChange('recent')}
                                >
                                    Most Recent
                                </button>
                                <button
                                    className="filter-option-button"
                                    onClick={() => handleFilterChange('oldest')}
                                >
                                    Oldest
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}

export default Singletrip;