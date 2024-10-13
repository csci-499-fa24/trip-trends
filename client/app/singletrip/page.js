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
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);


function Singletrip() {
    const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [expenseData, setExpenseData] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [otherCurrencies, setOtherCurrencies] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
    const [isEditPopupVisible, setEditPopupVisible] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
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
        "Accommodations",
        "Food/Drink",
        "Transport",
        "Activities",
        "Shopping",
        "Phone/Internet",
        "Health/Safety",
        "Accommodations",
        "Food/Drink",
        "Transport",
        "Activities",
        "Shopping",
        "Phone/Internet",
        "Health/Safety",
        "Other"
    ]);
    const userId = localStorage.getItem("user_id");
    const [userRole, setUserRole] = useState(null);

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
                    setExpenseData(response.data);
                    setOriginalData(response.data);
                    const fetchedExpenses = response.data.data;

                    const savedFilter = localStorage.getItem('selectedFilter');
                    if (savedFilter) {
                        applyFilter(savedFilter, response.data);
                    }

                    const total = response.data.data.reduce((sum, expense) => {
                        const amount = parseFloat(expense.amount);
                        return sum + amount;
                    }, 0);

                    setTotalExpenses(total);
                    fetchCurrencyRates(fetchedExpenses);
                })
                .catch(error => {
                    console.error('Error fetching trip data:', error);
                });

            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`)
                .then(response => {
                    // console.log(response.data);
                    setSelectedCurrency(response.data.data[0].currency_code)

                    const locations = response.data.data;
                    const currencyCodes = locations.map(location => location.currency_code);

                    setOtherCurrencies(currencyCodes);

                })
                .catch(error => {
                    console.error('Error fetching trip data:', error);
                });

        }
    }, [tripId]);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sharedtrips/`, {
                    params: { userId: userId, tripId: tripData.data.trip_id }
                });
                if (response.data && response.data.role) {
                    setUserRole(response.data.role);
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, [tripData.data.trip_id, userId]);

    useEffect(() => {
        const getExchangeRates = async () => {
            const rates = {};

            try {
                for (let currency of otherCurrencies) {
                    const response = await axios.get(`https://hexarate.paikama.co/api/rates/latest/USD`, {
                        params: {
                            target: currency
                        }
                    });
                    //console.log('API Response:', response.data);

                    if (response.data && response.data.data && response.data.data.mid) {
                        rates[currency] = response.data.data.mid;
                    } else {
                        console.error('Invalid response structure:', response.data);
                    }
                }
                setExchangeRates(rates);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };

        getExchangeRates();
    }, [selectedCurrency]);

    const fetchCurrencyRates = async (expenses) => {
        try {
            const currencyPromises = expenses
                .filter(expense => expense.currency) // Filter out expenses with invalid currencies
                .map(expense => {
                    const targetCurrency = expense.currency;
                    return axios.get(`https://hexarate.paikama.co/api/rates/latest/${targetCurrency}?target=USD`);
                });

            // Proceed only if there are valid currency requests
            if (currencyPromises.length > 0) {
                const currencyResponses = await Promise.all(currencyPromises);
                const currencyRates = currencyResponses.map((response, index) => ({
                    currency: expenses[index].currency, // Get the corresponding currency
                    rate: response.data.data.mid // Adjust according to the response structure
                }));

                // Convert expenses to USD and accumulate category data
                const categoryTotals = {};
                const convertedExpenses = expenses.map((expense, index) => {
                    const rate = currencyRates.find(rate => rate.currency === expense.currency)?.rate || 1; // Default to 1 if not found
                    const amountInUSD = (parseFloat(expense.amount) * rate).toFixed(2); // Convert amount to USD

                    // Accumulate totals by category
                    if (!categoryTotals[expense.category]) {
                        categoryTotals[expense.category] = 0;
                    }
                    categoryTotals[expense.category] += parseFloat(amountInUSD);

                    return {
                        ...expense,
                        amountInUSD // Add converted amount to expense
                    };
                });

                // Prepare data for pie chart
                const labels = Object.keys(categoryTotals);
                const data = Object.values(categoryTotals);

                setCategoryData({
                    labels,
                    datasets: [{
                        label: 'Expenses by Category',
                        data,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // Add more colors as needed
                        hoverOffset: 4
                    }]
                });

                // console.log('Converted expenses:', convertedExpenses);
            } else {
                console.warn('No valid currencies found for conversion.');
            }

        } catch (error) {
            console.error('Error fetching currency rates:', error);
        }
    };

    useEffect(() => {
        const config = {
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

    }, [tripId]);


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

    const submitEditExpense = async (e) => {
        e.preventDefault();
        // API CALL
        alert("Editing is still a WIP :)");
        setEditPopupVisible(false);
    };

    const deleteExpense = async (expenseID) => {
        if (window.confirm('Please confirm expense deletion. This action cannot be undone.')) {
            axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseID}`)
                .then(response => {
                    console.log(response)
                })
                .catch(error => {
                    console.error('Error deleting expense:', error);
                });
        }
        setEditPopupVisible(false);
        window.location.reload();
    };

    const downloadTripData = async () => {
        try {
            const response = await axios({
                url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/download/${tripId}`,
                method: 'GET',
                responseType: 'blob'
            });

            console.log(response.headers)

            const contentDisposition = response.headers['content-disposition'];
            let filename = `trip_${tripId}.csv`; // Default filename
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const filenamePart = contentDisposition.split('filename=')[1];
                filename = filenamePart.replace(/"/g, ''); // Clean up the filename
            }

            // Create a blob from the CSV data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading trip data:', error);
        }
    };

    const newExpenseInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'currency') {
            setSelectedCurrency(value); // Update selected currency
        }
        setNewExpenseData({ ...newExpenseData, [name]: value });
    };

    const submitNewExpense = async (e) => {
        e.preventDefault();

        const updatedExpenseData = {
            ...newExpenseData,
            trip_id: tripId,
            currency: selectedCurrency || 'USD',
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
            sortedExpenses = [...data.data].sort((a, b) => b.amount - a.amount);
        } else if (filterOption === 'lowest') {
            sortedExpenses = [...data.data].sort((a, b) => a.amount - b.amount);
        } else if (filterOption === 'recent') {
            sortedExpenses = [...data.data].sort((a, b) => new Date(b.posted) - new Date(a.posted));
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

    const shareTrip = async (newUserId, role) => {
        try {
            if (!userId) {
                console.error('User not authenticated. Cannot share trip.');
                return;
            }
            if (!tripId) {
                console.error('Trip ID not found. Cannot share trip.');
                return;
            }
            const requestBody = {
                newUserId, 
                role        
            };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}/trips/${tripId}/`, requestBody);
            console.log('Trip shared successfully:', response.data);
        } catch (error) {
            console.error('Error sharing trip:', error.response?.data || error.message);
        }
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
                        <div className="trip-info-cards">
    <div className="trip-info-card">
        <h4><b>BUDGET</b></h4>
        <p>${tripData.data.budget}</p>
    </div>
    <div className="trip-info-card">
        <h4><b>START</b></h4>
        <p>{tripData.data.start_date}</p>
    </div>
    <div className="trip-info-card">
        <h4><b>END</b></h4>
        <p>{tripData.data.end_date}</p>
    </div>
</div>

                        {/* General Trip Info Table
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
                        </Table> */}
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
                                                    segmentColors={['#b3e5fc', '#ffe0b2', '#ffccbc', '#d1c4e9']}
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
                                <Table striped bordered hover size="sm" responsive="sm" className="expense-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Amount</th>
                                            <th>Category</th>
                                            <th>Currency</th>
                                            <th>Date Posted</th>
                                            <th>Notes</th>
                                            <th>Modify Expense</th>
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
                                                <td>
                                                    <button onClick={() => { setEditPopupVisible(true); setSelectedExpense(expense) }} className='edit-expense'>Edit/Delete</button>
                                                    <div className="expense-form">
                                                        {isEditPopupVisible && selectedExpense && (
                                                            <div className="modal">
                                                                <div className="modal-content">
                                                                    <span className="close" onClick={() => setEditPopupVisible(false)}>&times;</span>
                                                                    <h2 className="edit-expense-title">Edit or Delete this Expense</h2>
                                                                    <form onSubmit={submitEditExpense}>
                                                                        <label className="edit-expense-field-label">
                                                                            Expense Name:
                                                                            <input
                                                                                type="text"
                                                                                name="name"
                                                                                value={selectedExpense.name}
                                                                                required
                                                                            />
                                                                        </label>
                                                                        <label className="edit-expense-field-label">
                                                                            Amount:
                                                                            <input
                                                                                type="number"
                                                                                name="amount"
                                                                                value={selectedExpense.amount}
                                                                                required
                                                                            />
                                                                        </label>
                                                                        <label className="edit-expense-field-label">
                                                                            Currency:
                                                                            <select
                                                                                name="currency"
                                                                                value={selectedExpense.currency}
                                                                                required
                                                                            >
                                                                                <option value="">Select Currency</option>
                                                                                {currencyCodes.map((code) => (
                                                                                    <option key={code} value={code}>{code}</option>
                                                                                ))}
                                                                            </select>
                                                                        </label>
                                                                        <label className="edit-expense-field-label">
                                                                            Category:
                                                                            <select
                                                                                name="category"
                                                                                value={selectedExpense.category}
                                                                                required
                                                                            >
                                                                                <option value="">Select Category</option>
                                                                                {expenseCategories.map((category) => (
                                                                                    <option key={category} value={category}>{category}</option>
                                                                                ))}
                                                                            </select>
                                                                        </label>
                                                                        <label className="edit-expense-field-label">
                                                                            Date:
                                                                            <input
                                                                                type="date"
                                                                                name="posted"
                                                                                value={selectedExpense.posted}
                                                                                required
                                                                            />
                                                                        </label>
                                                                        <label className="edit-expense-field-label">
                                                                            Notes:
                                                                            <input
                                                                                type="text"
                                                                                name="notes"
                                                                                value={selectedExpense.notes}
                                                                            />
                                                                        </label>
                                                                        <div className='container'>
                                                                            <div className='row'>
                                                                                <div className='col'>
                                                                                    <button type="submit" className="submit-edit-expense-button">Edit</button>
                                                                                </div>
                                                                                <div className='col'>
                                                                                    <button type="button" onClick={() => deleteExpense(expense.expense_id)} className="delete-expense-button">Delete</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
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
                        {/* Add the Delete Button */}
                        <button onClick={deleteTrip} className="delete-trip-button">
                            Delete Trip
                        </button>
                    </div>
                ) : (
                    <p>No Trip Data Found.</p>
                )}

                {/* Create a expense popup form */}
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

                                    <div className="field-pair">
                                        <label className="new-expense-field-label half-width">
                                            Amount:
                                            <input
                                                type="number"
                                                name="amount"
                                                value={newExpenseData.amount}
                                                onChange={newExpenseInputChange}
                                                required
                                            />
                                        </label>
                                        <label className="new-expense-field-label half-width">
                                            Currency:
                                            <select
                                                name="currency"
                                                value={selectedCurrency}
                                                onChange={(e) => {
                                                    setSelectedCurrency(e.target.value); // Update selected currency state
                                                    newExpenseInputChange(e); // Call your input change handler
                                                }}
                                                required
                                            >
                                                <option value="">Select Currency</option>

                                                {/* Display the selected currency at the top if it exists and it's not USD */}
                                                {selectedCurrency && selectedCurrency !== "USD" && (
                                                    <option value={selectedCurrency}>{selectedCurrency}</option>
                                                )}

                                                {/* Recommended currencies section */}
                                                {otherCurrencies
                                                    .filter(code => code !== selectedCurrency) // Exclude selected currency
                                                    .length > 0 && (
                                                        <optgroup label="Recommended">
                                                            {otherCurrencies
                                                                .filter(code => code !== selectedCurrency) // Exclude selected currency
                                                                .map((code, index) => (
                                                                    <option key={`other-${index}`} value={code}>{code}</option>
                                                                ))}
                                                        </optgroup>
                                                    )}

                                                {/* Always place USD after other currencies */}
                                                <optgroup label="Other">
                                                    <option value="USD">USD</option>

                                                    {/* Display remaining currency codes, excluding selectedCurrency and other currencies */}
                                                    {currencyCodes
                                                        .filter(code => code !== selectedCurrency && code !== "USD" && !otherCurrencies.includes(code))
                                                        .map((code) => (
                                                            <option key={code} value={code}>{code}</option>
                                                        ))}
                                                </optgroup>
                                            </select>
                                        </label>

                                    </div>

                                    <div className="field-pair">
                                        <label className="new-expense-field-label half-width">
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
                                        <label className="new-expense-field-label half-width">
                                            Date:
                                            <input
                                                type="date"
                                                name="posted"
                                                value={newExpenseData.posted}
                                                onChange={newExpenseInputChange}
                                                required
                                            />
                                        </label>
                                    </div>

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


                {/* Pie Chart */}
                <div>
                    <div className="pie-chart-container">
                        <Pie data={categoryData} />
                    </div>
                </div>

                {/* Exchange Rate Table */}
                <div className="exchange-rates-container">
                    <table className="exchange-rates-table">
                        <thead>
                            <tr>
                                <th>Currency</th>
                                <th>Rate (Relative to USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(exchangeRates).map((currency) => (
                                <tr key={currency}>
                                    <td>{currency}</td>
                                    <td>{exchangeRates[currency]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>




            </div >
        </div >
    );
}

export default Singletrip;