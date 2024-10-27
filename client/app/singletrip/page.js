'use client';

// Import packages
import React, { useEffect, useState } from 'react';
import '../css/singletrip.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-calendar/dist/Calendar.css';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Import components
import DownloadTripComponent from '../components/singletrip/DownloadTripComponent';
import CategoryDataComponent from '../components/singletrip/CategoryDataComponent';
import ExpenseFormComponent from '../components/singletrip/ExpenseFormComponent';
import GeneralTripInfoComponent from '../components/singletrip/GeneralTripInfoComponent';
import ExpenseTableComponent from '../components/singletrip/ExpenseTableComponent';
import BudgetMeterComponent from '../components/singletrip/BudgetMeterComponent';
import ExchangeRateTableComponent from '../components/singletrip/ExchangeRateTableComponent'
import HeaderComponent from '../components/HeaderComponent';
import TripIconBarComponent from '../components/singletrip/TripIconBarComponent';
import HeaderComponent from '../components/HeaderComponent';
import TripIconBarComponent from '../components/singletrip/TripIconBarComponent';
import BarGraphComponent from '../components/singletrip/BarGraphComponent';

Chart.register(ArcElement, Tooltip, Legend);

function Singletrip() {
    const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [expenseData, setExpenseData] = useState([]);
    const [fetchedExpenseData, setFetchedExpenseData] = useState([]);
    const [convertedHomeCurrencyExpenseData, setconvertedHomeCurrencyExpenseData] = useState([])
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [expenseUSD, setExpenseUSD] = useState([]);
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
    const isOwner = userRole === 'owner';
    // const [userId, setUserId] = useState(null);
    const [homeCurrency, setHomeCurrency] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserId = localStorage.getItem("user_id");
            if (storedUserId) {
                setUserId(storedUserId);
            }
        }
    }, []);
    
    // Fetch home currency when userId changes
    useEffect(() => {
        const getHomeCurrency = async () => {
            if (userId) {
                const currency = await fetchHomeCurrency(userId);
                if (currency) {
                    setHomeCurrency(currency);  // Only set if currency is valid
                }
            }
        };
    
        getHomeCurrency(); // Fetch home currency when userId is available
    }, [userId]);

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

    useEffect(() => {
        const savedFilter = localStorage.getItem('selectedFilter');
        if (savedFilter && expenseUSD.length > 0) {
            console.log(expenseUSD); 
            applyFilter(savedFilter, expenseUSD); 
        }
    }, [expenseUSD]);

    const fetchExpenseData = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}`)
            .then(response => {
                setExpenseData(response.data);
                setOriginalData(response.data);
                setFetchedExpenseData(response.data.data);

                fetchCurrencyRates(fetchedExpenses);

                const savedFilter = localStorage.getItem('selectedFilter');
                if (savedFilter) {
                    console.log(expenseUSD);
                    applyFilter(savedFilter, expenseUSD);
                }
            })
            .catch(error => {
                console.error('Error fetching trip data:', error);
            });
    };

    const fetchTripLocations = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`)
            .then(response => {
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

    const submitNewExpense = async (e) => {
        e.preventDefault();

        const updatedExpenseData = {
            ...newExpenseData,
            trip_id: tripId,
            currency: selectedCurrency || homeCurrency,
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

    const applyFilter = (filterOption, data = expenseUSD) => {
        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data);
            return;
        }
        let sortedExpenses;
        if (filterOption === 'highest') {
            sortedExpenses = [...data].sort((a, b) => parseFloat(b.amountInHomeCurrency) - parseFloat(a.amountInHomeCurrency));
        } else if (filterOption === 'lowest') {
            sortedExpenses = [...data].sort((a, b) => parseFloat(a.amountInHomeCurrency) - parseFloat(b.amountInHomeCurrency));
        } else if (filterOption === 'recent') {
            sortedExpenses = [...data].sort((a, b) => new Date(b.posted) - new Date(a.posted));
        } else if (filterOption === 'oldest') {
            sortedExpenses = [...data].sort((a, b) => new Date(a.posted) - new Date(b.posted));
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

        const fetchUserRole = async () => {
            const user_id = localStorage.getItem("user_id");
            if (user_id) {
                setUserId(user_id);
            }
            // console.log('User ID:', userId);
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
    
    useEffect(() => {
        if (homeCurrency) {
            // Only call fetchCurrencyRates when homeCurrency is successfully fetched
            fetchCurrencyRates(fetchedExpenseData);
        } else {
            console.error("Home currency not set. Unable to fetch exchange rates.");
        }
    }, [homeCurrency, fetchedExpenseData]); // Dependencies: re-run if homeCurrency or expenses change

    const fetchHomeCurrency = async (userId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}/home-currency`);
            return response.data.home_currency;
        } catch (error) {
            console.error('Error fetching home currency:', error);
            return null; // Handle error as needed
        }
    };

    useEffect(() => {
        const getExchangeRates = async () => {
            const rates = {};

            try {
                for (let currency of otherCurrencies) {
                    const response = await axios.get(`https://hexarate.paikama.co/api/rates/latest/${homeCurrency}`, {
                        params: {
                            target: currency
                        }
                    });

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


    // useEffect(() => {
    //     console.log(expenseUSD);
    // },[expenseUSD])

    const fetchCurrencyRates = async (expenses) => {
        try {
            const currencyPromises = expenses
                .filter(expense => expense.currency) // Filter out expenses with invalid currencies
                .map(expense => {
                    const targetCurrency = expense.currency;
                    return axios.get(`https://hexarate.paikama.co/api/rates/latest/${targetCurrency}?target=${homeCurrency}`);
                });
    
            if (currencyPromises.length > 0) {
                const currencyResponses = await Promise.all(currencyPromises);
                const currencyRates = currencyResponses.map((response, index) => ({
                    currency: expenses[index].currency,
                    rate: response.data.data.mid // Assuming correct response structure
                }));
    
                // Convert expenses to homeCurrency and accumulate category data
                const categoryTotals = {};
                const convertedExpenses = expenses.map((expense, index) => {
                    const rate = currencyRates.find(rate => rate.currency === expense.currency)?.rate || 1;
                    const amountInHomeCurrency = (parseFloat(expense.amount) * rate).toFixed(2);
    
                    // Accumulate totals by category
                    if (!categoryTotals[expense.category]) {
                        categoryTotals[expense.category] = 0;
                    }
                    categoryTotals[expense.category] += parseFloat(amountInHomeCurrency);
    
                    setTotalExpenses(prevTotal => prevTotal + parseFloat(amountInHomeCurrency));
    
                    return {
                        ...expense,
                        amountInHomeCurrency // Add converted amount to expense
                    };
                });

                setconvertedHomeCurrencyExpenseData(convertedExpenses)
                setExpenseUSD(convertedExpenses);
    
                // Prepare data for pie chart
                const labels = Object.keys(categoryTotals);
                const data = Object.values(categoryTotals);
    
                setCategoryData({
                    labels,
                    datasets: [{
                        label: `Expenses by Category in ${homeCurrency}`,
                        data,
                        backgroundColor: [
                            '#2A9D8F', '#e76f51', '#E9C46A', '#F4A261', '#c476bf', '#264653', '#e5989b', '#9d0208', '#e4c1f9',
                            '#bc6c25', '#fca311', '#d62828', '#003049', '#00a896', '#f77f00', '#8338ec', '#fb5607'
                        ],
                        hoverOffset: 4
                    }]
                });
            } else {
                console.warn('No valid currencies found for conversion.');
            }
        } catch (error) {
            console.error('Error fetching currency rates:', error);
        }
    };    

    return (
        <div className="main-container">
            <div>
                {/* Header section */}
                <HeaderComponent headerTitle={tripData ? tripData.data.name : ''} setUserName={setUserName} userId={userId} />

                {tripData ? (
                    <div>
                        {/* Icon Bar Above Trip Info */}
                        <TripIconBarComponent tripId={tripId} userId={userId} isOwner={isOwner} tripData={tripData} tripLocations={tripLocations} userRole={userRole} fetchTripData={fetchTripData} />
                        {/* General Trip Info*/}
                        <GeneralTripInfoComponent tripData={tripData} tripId={tripId} tripLocations={tripLocations} expenses={expenseUSD}/>
                        {/* Trip Calendar and Budget Meter */}
                        <div className='container'>
                            <div className='row'>
                                <div className='col'>
                                    <div className="meter-container"> 
                                        <BudgetMeterComponent tripData={tripData} expenseData={expenseData} totalExpenses={totalExpenses} homeCurrency={homeCurrency}/>
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
                        <div className="meter-container">
                            <BarGraphComponent tripData={tripData} expenseData={convertedHomeCurrencyExpenseData} categoryData={categoryData} />
                        </div>

                        <br></br>
                        {/* Icon Bar Above Expenses */}
                        <div>
                            <header className="icon-bar-header">
                                {/* Add Expense Button */}
                                <div className="icon-div" tooltip="Add Expense" tabIndex="0">
                                    <div className="icon-SVG">
                                        <svg
                                            onClick={() => setPopUpVisible(true)}
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span className="icon-text">Add Expense</span>
                                    </div>
                                </div>
                                {/* Filter Expenses Button */}
                                <div className="icon-div" tooltip="Filter" tabIndex="0">
                                    <div className="icon-SVG">
                                        <svg
                                            onClick={() => setFilterPopupVisible(true)}
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6" >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                        </svg>
                                        <span className="icon-text">Filter</span>

                                    </div>
                                </div>
                                {/* <div className="spacer"></div>
                                <div className="divider"></div> */}

                                {/* Download Trip Button */}
                                <DownloadTripComponent tripData={tripData} tripId={tripId} />

                                {/* Add Image Button */}
                                <div className="icon-div" tooltip="Add Image" tabIndex="0">
                                    <div className="icon-SVG">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <span className="icon-text">Add Image</span>
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
                        <ExpenseTableComponent tripData={tripData} tripId={tripId} tripLocations={tripLocations} expenseData={expenseData}
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
                    <ExchangeRateTableComponent exchangeRates={exchangeRates} currencyCodes={currencyCodes} homeCurrency={homeCurrency}/>
                </div>
            </div >
        </div >
    );
}

export default Singletrip;