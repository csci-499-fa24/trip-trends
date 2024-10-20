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
import Link from 'next/link';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import DeleteTripComponent from '../components/DeleteTripComponent';
import ShareTripComponent from '../components/ShareTripComponent';
import { createApi } from 'unsplash-js';

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
        "Other"
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
        console.log('fetching user role...');
        console.log('Trip ID:', tripId);
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


    // const deleteTrip = async () => {
    //     if (window.confirm('Please confirm trip deletion. This action cannot be undone.')) {
    //         try {
    //             // delete trip
    //             await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`);
    //             window.location.href = '/homepage'; // redirect to homepage
    //         } catch (error) {
    //             console.error('Error deleting trip:', error);
    //         }
    //     }
    // };

    // const deleteUserFromTrip = async (userId) => {
    //     if (window.confirm('Please confirm user removal from trip. This action cannot be undone.')) {
    //         try {
    //             // delete user from trip
    //             await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sharedtrips/${userId}/${tripId}`);
    //             window.location.reload();
    //         } catch (error) {
    //             console.error('Error deleting user from trip:', error);
    //         }
    //     }
    // };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedExpense((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const submitEditExpense = async (expenseID) => {
        axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseID}`, selectedExpense)
            .then(response => {
                console.log(response)
                window.location.reload();
                setEditPopupVisible(false);
            })
            .catch(error => {
                console.error('Error editing expense:', error);
            });
    };

    const deleteExpense = async (expenseID) => {
        if (window.confirm('Please confirm expense deletion. This action cannot be undone.')) {
            axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseID}`)
                .then(response => {
                    console.log(response);
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error deleting expense:', error);
                });
            setEditPopupVisible(false);
        }
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

    // const shareTrip = async (email, role) => {
    //     try {
    //         if (!userId) {
    //             console.error('User not authenticated. Cannot share trip.');
    //             return;
    //         }
    //         if (!tripId) {
    //             console.error('Trip ID not found. Cannot share trip.');
    //             return;
    //         }
    //         const requestBody = {
    //             email, 
    //             role        
    //         };
    //         const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}/trips/${tripId}/`, requestBody);
    //         console.log('Trip shared successfully:', response.data);
    //     } catch (error) {
    //         console.error('Error sharing trip:', error.response?.data || error.message);
    //     }
    // };

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

    const unsplash = createApi({
        accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      });

    const getImageURL = async (trip_location) => {
        try {
            const response = await unsplash.search.getPhotos({
            query: trip_location,
            page: 1,
            perPage: 10,
        });

        if (response.response.results.length > 0) {
            const images = response.response.results.map(image => image.urls.raw); // array of 10 images

            const random_index = Math.floor(Math.random() * response.response.results.length);
            const imageURL = images[random_index]
            console.log(`Image URL for ${trip_location}:`, imageURL); // Display the random image URL
            // console.log(images); // Array of image URLs
          } else {
            console.log('No images found.');
          }
        } catch (error) {
          console.error('Error fetching images:', error);
        }
    };

    return (
        <div className="main-container">
            <div>
                {/* Header section */}
                <div className="banner2">
                    TRIP TRENDS
                </div>

                {tripData ? (
                    <div>
                        <h1 id='tripName'>{tripData.data.name}</h1>
                        <header class="top-icon-header">
                            <div class="icon-div" tooltip="Home" tabindex="0">
                                <Link href={'/homepage'}>
                                    <Image src={homeIcon} alt="homepage" width={"55"} height={"55"} />
                                </Link>
                                <span class="icon-text">Home</span>
                            </div>
                            {/* Share Trip Button */}
                            <ShareTripComponent tripId={tripId} isOwner={isOwner} />
                            {/* Delete Trip Button */}
                            <DeleteTripComponent tripId={tripId} userRole={userRole} />
                        </header>

                        <Slider {...settings}>
                        {tripData.data.tr.map((location) => (
                            <div key={location.name}>
                            <img src={location.imageUrl} alt={location.name} style={{ width: '100%', height: 'auto' }} />
                            </div>
                        ))}
                        </Slider>
                        {/* General Trip Info*/}
                        <div className="trip-overview">
                            <div className="trip-overview-div">
                                <div className="trip-overview-circle">🗓️</div>
                                <div className="trip-overview-content">
                                    <h3>START</h3>
                                    <p>{tripData.data.start_date}</p>
                                </div>
                            </div>

                            <div className="trip-overview-div">
                                <div className="trip-overview-circle">🗓️</div>
                                <div className="trip-overview-content">
                                    <h3>END</h3>
                                    <p>{tripData.data.end_date}</p>
                                </div>
                            </div>

                            <div className="trip-overview-div">
                                <div className="trip-overview-circle">💰</div>
                                <div className="trip-overview-content">
                                    <h3>BUDGET</h3>
                                    <p>${tripData.data.budget}</p>
                                </div>
                            </div>
                        </div>

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
                                                    segmentColors={['#b3e5fc', '#ffe0b2', '#ffccbc', '#d1c4e9']}
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
                                                    segmentColors={['#b3e5fc', '#ffe0b2', '#ffccbc', '#d1c4e9']}
                                                />
                                            </div>
                                        )}
                                        <p id='budgetTitle'>Your Budget Data:</p>
                                        {expenseData && expenseData.data && totalUSDExpenses === 0 ? (
                                            <p>Loading your budget data...</p>
                                        ) : (
                                            <div style={{ textAlign: 'center', margin: '20px' }}>
                                                <p style={{ textDecoration: "underline" }}>Total Expenses in USD:</p>
                                                <p>${totalUSDExpenses.toFixed(2)}</p>
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
                                        <div>
                                            {categoryData && categoryData.datasets && categoryData.datasets.length > 0 ? (
                                                <div className="pie-chart-container">
                                                    <Pie data={categoryData} />
                                                </div>
                                            ) : (
                                                <p>No expense data available to display.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <br></br>
                        {/* Icon Bar Above Expenses */}
                        <div className="filter-section">
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
                                        {selectedFilter && (
                                            <div className="applied-filter">
                                                <span>{`Filter: ${selectedFilter}`}</span>
                                                <button className="clear-filter-btn" onClick={clearFilter}>
                                                    &times;
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                                {/* <div class="spacer"></div>
                                <div class="divider"></div> */}

                                {/* Download Trip Button */}
                                <div class="icon-div" tooltip="Download Trip" tabindex="0">
                                    <div class="icon-SVG">
                                        <svg
                                            onClick={downloadTripData}
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        <span class="icon-text">Download Trip</span>
                                    </div>
                                </div>
                                {/* Add Image Button */}
                                <div class="icon-div" tooltip="Add Image" tabindex="0">
                                    <div class="icon-SVG">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <span class="icon-text">Add Image</span>
                                    </div>
                                </div>
                            </header>
                        </div>

                        {/* Expense Table */}
                        {expenseData && expenseData.data ? (
                            <div>
                                <div className="expense-table-container">
                                    <Table striped bordered hover size="sm" responsive="sm" className="expense-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Amount</th>
                                                <th>Currency</th>
                                                <th>Category</th>
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
                                                    <td>{expense.currency}</td>
                                                    <td>{expense.category}</td>
                                                    <td>{expense.posted}</td>
                                                    <td>{expense.notes}</td>
                                                    <td>
                                                        <button onClick={() => { setEditPopupVisible(true); setSelectedExpense(expense) }} className='edit-expense'>Edit/Delete</button>
                                                        <div className="expense-form">
                                                            {isEditPopupVisible && selectedExpense && (
                                                                <div className="modal">
                                                                    <div className="modal-content">
                                                                        <span className="close" onClick={() => setEditPopupVisible(false)}>&times;</span>
                                                                        <h2 className="edit-expense-title">Edit or Delete Expense</h2>
                                                                        <form onSubmit={(e) => {
                                                                            e.preventDefault();
                                                                            submitEditExpense(selectedExpense.expense_id);
                                                                        }}>
                                                                            <label className="edit-expense-field-label">
                                                                                Expense Name:
                                                                                <input
                                                                                    type="text"
                                                                                    name="name"
                                                                                    value={selectedExpense.name}
                                                                                    onChange={handleEditChange}
                                                                                    required
                                                                                />
                                                                            </label>
                                                                            <div className="field-pair">
                                                                                <label className="edit-expense-field-label">
                                                                                    Amount:
                                                                                    <input
                                                                                        type="number"
                                                                                        name="amount"
                                                                                        value={selectedExpense.amount}
                                                                                        onChange={handleEditChange}
                                                                                        required
                                                                                    />
                                                                                </label>
                                                                                <label className="edit-expense-field-label">
                                                                                    Currency:
                                                                                    <select
                                                                                        name="currency"
                                                                                        value={selectedExpense.currency}
                                                                                        onChange={handleEditChange}
                                                                                        required
                                                                                    >
                                                                                        <option value="">Select Currency</option>
                                                                                        {currencyCodes.map((code) => (
                                                                                            <option key={code} value={code}>{code}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                </label>
                                                                            </div>
                                                                            <div className="field-pair">
                                                                                <label className="edit-expense-field-label">
                                                                                    Category:
                                                                                    <select
                                                                                        name="category"
                                                                                        value={selectedExpense.category}
                                                                                        onChange={handleEditChange}
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
                                                                                        onChange={handleEditChange}
                                                                                        required
                                                                                    />
                                                                                </label>
                                                                            </div>
                                                                            <label className="edit-expense-field-label">
                                                                                Notes:
                                                                                <input
                                                                                    type="text"
                                                                                    name="notes"
                                                                                    value={selectedExpense.notes}
                                                                                    onChange={handleEditChange}
                                                                                />
                                                                            </label>
                                                                            <div className='container'>
                                                                                <div className='row'>
                                                                                    <div className='col'>
                                                                                        <button type="submit" className="submit-edit-expense-button">Edit</button>
                                                                                    </div>
                                                                                    <div className='col'>
                                                                                        <button type="button" onClick={() => deleteExpense(selectedExpense.expense_id)} className="delete-expense-button">Delete</button>
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
                                </div>
                            </div>
                        ) : (
                            <p>No expenses yet...</p>
                        )}
                        {/* Gallery of Photos like Google Photos or Photos on iPhone
                        {tripData.data.image ? (
                            <p>{tripData.data.image}</p>
                        ) : (
                            <p>[Gallery of photos]</p>
                        )} */}

                    </div>
                ) : (
                    <div className="center-container">
                        <p>No Trip Data Found.</p>
                    </div>
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