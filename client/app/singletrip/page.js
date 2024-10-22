'use client';

// Import packages
import React, { useEffect, useState } from 'react';
import '../css/singletrip.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import 'react-calendar/dist/Calendar.css';
import ReactSpeedometer, { Transition } from 'react-d3-speedometer';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Import components
import DeleteTripComponent from '../components/singletrip/DeleteTripComponent';
import ShareTripComponent from '../components/singletrip/ShareTripComponent';
import EditTripComponent from '../components/singletrip/EditTripComponent';
import DownloadTripComponent from '../components/singletrip/DownloadTripComponent';
import CategoryDataComponent from '../components/singletrip/CategoryDataComponent';
import ExpenseFormComponent from '../components/singletrip/ExpenseFormComponent';
import GeneralTripInfoComponent from '../components/singletrip/GeneralTripInfoComponent';
import ExpenseTableComponent from '../components/singletrip/ExpenseTableComponent';

Chart.register(ArcElement, Tooltip, Legend);

function Singletrip() {
    const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
    const [customCurrency, setCustomCurrency] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [expenseData, setExpenseData] = useState([]);
    const [totalUSDExpenses, setTotalUSDExpenses] = useState(0);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [otherCurrencies, setOtherCurrencies] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [tripLocations, setTripLocations] = useState([]);
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
        "Other"
    ]);

    useEffect(() => {
        const loadBootstrap = async () => {
            await import('bootstrap/dist/js/bootstrap.bundle.min.js');
        };
        loadBootstrap();

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('tripId');
        setTripId(id);

        if (tripId) {
            fetchTripData();
            fetchExpenseData();
            fetchTripLocations();
        }
    }, [tripId]);

    const fetchTripData = () => {
        if (tripId) {
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`)
                .then(response => {
                    setTripData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching trip data:', error);
                });
        }
    };

    const fetchExpenseData = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}`)
            .then(response => {
                setExpenseData(response.data);
                setOriginalData(response.data);
                const fetchedExpenses = response.data.data;

                const savedFilter = localStorage.getItem('selectedFilter');
                if (savedFilter) {
                    applyFilter(savedFilter, response.data);
                }

                fetchCurrencyRates(fetchedExpenses);
            })
            .catch(error => {
                console.error('Error fetching trip data:', error);
            });
    };

    const fetchTripLocations = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`)
            .then(response => {
                // console.log("TRIP LOCATIONS");
                // console.log(response.data);
                setSelectedCurrency(response.data.data[0].currency_code)
                const locations = response.data.data;
                setTripLocations(locations.map(location => location.location));

                const currencyCodes = locations.map(location => location.currency_code);
                setOtherCurrencies(currencyCodes);

            })
            .catch(error => {
                console.error('Error fetching trip data:', error);
            });
    };


    useEffect(() => {
        const fetchUserRole = async () => {
            const userId = localStorage.getItem("user_id");
            console.log('User ID:', userId);
            if (tripId && userId) {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`);
                    const sharedTrips = response.data.data;
                    const userRole = sharedTrips.find(trip => trip.user_id === userId)?.role;
                    if (userRole) {
                        setUserRole(userRole);
                    } else {
                        console.log("User does not have a role for this trip.");
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setError('Error fetching user role. Please try again later.');
                }
            } else {
                console.log("tripId or userId is missing.");
            }
        };
        fetchUserRole();
    }, [tripId]);
    
    const isOwner = userRole === 'owner';

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

                    setTotalUSDExpenses(prevTotal => prevTotal + parseFloat(amountInUSD));

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
                        backgroundColor: [
                            '#2A9D8F', '#e76f51', '#E9C46A', '#F4A261', '#c476bf', '#264653', '#e5989b', '#9d0208', '#e4c1f9',
                            '#bc6c25', '#fca311', '#d62828', '#003049', '#00a896', '#f77f00', '#8338ec', '#fb5607'
                        ],
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

    const handleCurrencyChange = async (e) => {
        const currency = e.target.value;
        setCustomCurrency(currency);

        // Fetch the exchange rate relative to USD
        try {
            const response = await axios.get(`https://hexarate.paikama.co/api/rates/latest/USD?target=${currency}`);
            //if (response.data && response.data.rate) {
            console.log(response.data.data.mid);
            setExchangeRate(response.data.data.mid);
            // } else {
            //  console.error("Invalid response from the API");
            // }
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
        }
    };

    return (
        <div className="main-container">
            <div>
                {/* Header section */}
                <div className="header">
                    TRIP TRENDS
                </div>

                {tripData ? (
                    <div>
                        <h1 id='tripName'>{tripData.data.name}</h1>
                        <header class="top-icon-header">
                                <div class="icon-div" tooltip="Home" tabindex="0">
                                    <div class="icon-SVG">
                                        <Link href={`/homepage`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                            </svg>
                                        </Link>
                                        <span class="icon-text">Home</span>
                                    </div>
                                </div>
                            {/* Share Trip Button */}
                            <ShareTripComponent tripId={tripId} isOwner={isOwner} />
                            {/* Edit Trip Button */}
                            <EditTripComponent tripId={tripId} tripData={tripData} tripLocations={tripLocations} userRole={userRole} onUpdate={fetchTripData} />
                            {/* Delete Trip Button */}
                            <DeleteTripComponent tripId={tripId} userRole={userRole} />
                        </header>
                        {/* General Trip Info*/}
                        <GeneralTripInfoComponent tripData={tripData} tripId={tripId} tripLocations={tripLocations} />
                        {/* Trip Calendar and Budget Meter */}
                        <div className='container'>
                            <div className='row'>
                               
                                <div className='col'>
                                    <div className="meter-container">
                                        <p id='budgetTitle'>Your Budget Meter:</p>
                                        {expenseData && expenseData.data && totalUSDExpenses === 0 ? (
                                            <p>Loading your budget data...</p>
                                        ) : totalUSDExpenses > tripData.data.budget ? (
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
                                                    value={tripData.data.budget}
                                                    needleColor="steelblue"
                                                    needleTransitionDuration={2500}
                                                    needleTransition={Transition.easeBounceOut}
                                                    segments={4}
                                                    segmentColors={["#a3be8c", "#ebcb8b", "#d08770", "#bf616a"]}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{
                                                marginTop: "10px",
                                                width: "350px",
                                                height: "200px",
                                                marginLeft: "50px",
                                            }}>
                                                <ReactSpeedometer
                                                    width={300}
                                                    minValue={0}
                                                    maxValue={tripData.data.budget}
                                                    value={totalUSDExpenses.toFixed(2)}
                                                    needleColor="steelblue"
                                                    needleTransitionDuration={2500}
                                                    needleTransition={Transition.easeBounceOut}
                                                    segments={4}
                                                    segmentColors={["#a3be8c", "#ebcb8b", "#d08770", "#bf616a"]}
                                                />
                                            </div>
                                        )}
                                        <p id='budgetTitle'>Your Budget Data:</p>
                                        {expenseData && expenseData.data && totalUSDExpenses === 0 ? (
                                            <p>Loading your budget data...</p>
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ textDecoration: "underline", display: "inline" }}>Total Expenses in USD:</p>
                                                <span>  ${totalUSDExpenses.toFixed(2)}</span>
                                                {totalUSDExpenses > tripData.data.budget ? (
                                                    <p id='budget-text'>You are <strong>${(totalUSDExpenses - tripData.data.budget).toFixed(2)}</strong> over your budget.</p>
                                                ) : (
                                                    <p>You are within your budget.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Pie Chart */}
                                <div className='col'>
                                    <div className="meter-container">
                                        <CategoryDataComponent categoryData={categoryData} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <br></br>
                        {/* Icon Bar Above Expenses */}
                        <div>
                            <header class="icon-bar-header">
                                {/* Add Expense Button */}
                                <div class="icon-div" tooltip="Add Expense" tabindex="0">
                                    <div class="icon-SVG">
                                        <svg
                                            onClick={() => setPopUpVisible(true)}
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span class="icon-text">Add Expense</span>
                                    </div>
                                </div>
                                {/* Filter Expenses Button */}
                                <div class="icon-div" tooltip="Filter" tabindex="0">
                                    <div class="icon-SVG">
                                        <svg
                                            onClick={() => setFilterPopupVisible(true)}
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6" >
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                        </svg>
                                        <span class="icon-text">Filter</span>

                                    </div>
                                </div>
                                {/* <div class="spacer"></div>
                                <div class="divider"></div> */}

                                {/* Download Trip Button */}
                                <DownloadTripComponent tripData={tripData} tripId = {tripId} />

                                {/* Add Image Button */}
                                <div class="icon-div" tooltip="Add Image" tabindex="0">
                                    <div class="icon-SVG">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <span class="icon-text">Add Image</span>
                                    </div>
                                </div>
                                
                                {/* Applied filter popup */}
                                {selectedFilter && (
                                    <div className="applied-filter">
                                        <span>{`Filter: ${selectedFilter}`}</span>
                                        <button className="clear-filter-btn" onClick={clearFilter}>
                                            &times;
                                        </button>
                                    </div>
                                )}
                            </header>
                        </div>

                        {/* Expense Table */}
                        <ExpenseTableComponent tripData={tripData} tripId = {tripId} tripLocations = {tripLocations} expenseData={expenseData} 
                        currencyCodes={currencyCodes} expenseCategories={expenseCategories} />

                    </div>
                ) : (
                    <div className="center-container">
                        <p>No Trip Data Found.</p>
                    </div>
                )}

                {/* Create a expense popup form */}
                <ExpenseFormComponent
                    tripId={tripId}
                    newExpenseData={newExpenseData}
                    setNewExpenseData={setNewExpenseData}
                    selectedCurrency={selectedCurrency}
                    setSelectedCurrency={setSelectedCurrency}
                    submitNewExpense={submitNewExpense}
                    isPopUpVisible={isPopUpVisible}
                    setPopUpVisible={setPopUpVisible}
                    otherCurrencies={otherCurrencies}
                    currencyCodes={currencyCodes}
                    expenseCategories={expenseCategories}
                />

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

                <div>
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
                                {/* Last row for dropdown selection and its rate */}
                                {/* {customCurrency && ( */}
                                <tr>
                                    <td className="exchange-table-dropdown">
                                        {/* Dropdown for currency codes */}
                                        <label htmlFor="currency-select"></label>
                                        <select
                                            id="currency-select"
                                            value={customCurrency}
                                            onChange={handleCurrencyChange}
                                        >
                                            <option value="">Currency</option>
                                            {currencyCodes.map((code) => (
                                                <option key={code} value={code}>
                                                    {code}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{exchangeRate !== null ? exchangeRate : 'N/A'}</td>
                                </tr>
                                {/* )} */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </div >
    );
}

export default Singletrip;