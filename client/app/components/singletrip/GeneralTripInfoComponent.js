import React, { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import LocationsDropdownComponent from '../singletrip/LocationsDropdownComponent';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import currencySymbolMap from 'currency-symbol-map';
import axios from 'axios';
import '../../css/singletrip.css';

const GeneralTripInfoComponent = ({ userId, tripData, convertedBudget, tripId, tripLocations, expenses, totalExpenses, currency }) => {
    const [totalExpensesByDate, setTotalExpensesByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showExpenseBox, setShowExpenseBox] = useState(false);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
    const [isFavorited, setIsFavorited] = useState(false);
    const expenseBoxRef = useRef(null);
    const currencySymbol = currencySymbolMap(currency);
    const exceedsBudget = totalExpenses > convertedBudget;
    // console.log(convertedBudget);
    // console.log(tripId);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`);
                // console.log(response.data); 
                if (response.data && Array.isArray(response.data)) {
                    const user = response.data.find((user) => user.user_id === userId);
                    
                    if (user) {
                        setIsFavorited(user.favorite);  
                    } else {
                        console.log(`Trip with ID ${tripId} not found`);
                    }
                } else {
                    console.log("No trips found for the user");
                }
            } catch (error) {
                console.error("Error fetching favorite status:", error);
            }
        };

        fetchFavoriteStatus();
    }, [userId, tripId]);
    // console.log(isFavorited);

    const DateComponent = ({ dateStr, showYear }) => {
        const [year, month, day] = dateStr.split('-');
        const options = showYear
            ? { month: 'long', day: 'numeric', year: 'numeric' }
            : { month: 'long', day: 'numeric' };

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(
            new Date(year, month - 1, day)
        );

        return <span>{formattedDate}</span>;
    };

    const isDateInRange = (date) => {
        if (!startDate || !endDate) {
            return false;
        }
        return date >= startDate && date <= endDate;
    };

    const getTripDates = () => {
        if (!tripData) {
            return { startDate: null, endDate: null };
        }

        const startDate = startOfDay(parseISO(tripData.data.start_date));
        const endDate = endOfDay(parseISO(tripData.data.end_date));
        const startYear = tripData.data.start_date.split('-')[0];
        const endYear = tripData.data.end_date.split('-')[0];
        const showYear = startYear !== endYear;

        return { startDate, endDate, startYear, endYear, showYear };
    };

    const { startDate, endDate, startYear, endYear, showYear } = getTripDates();

    useEffect(() => {
        if (!expenses || !Array.isArray(expenses)) return; // to handle expenses undefined during runtime

        const totals = {};
        expenses.forEach(expense => {
            if (!expense.posted || !expense.amount) return; // Skip invalid data.

            const [year, month, day] = expense.posted.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toDateString();

            const amount = parseFloat(expense.amount);
            if (!totals[dateKey]) {
                totals[dateKey] = 0;
            }
            totals[dateKey] += amount;
        });

        setTotalExpensesByDate(totals);
    }, [expenses]);



    const handleDateClick = (date, event) => {
        const dateKey = date.toDateString();
        const expensesForDay = expenses.filter(exp => {
            const [year, month, day] = exp.posted.split('-').map(Number);
            const expDate = new Date(year, month - 1, day);
            return expDate.toDateString() === dateKey;
        });

        if (expensesForDay.length > 0) {
            const { top, left, height } = event.target.getBoundingClientRect();
            setBoxPosition({ top: top + height + window.scrollY, left: left + window.scrollX });
            setSelectedDate({ date, expenses: expensesForDay });
            setShowExpenseBox(true);
        } else {
            setSelectedDate(null);
            setShowExpenseBox(false);
        }
    };

    const handleOutsideClick = (event) => {
        if (expenseBoxRef.current && !expenseBoxRef.current.contains(event.target)) {
            setShowExpenseBox(false);
            setSelectedDate(null);
        }
    };

    const handleFavoriteClick = async () => {
        setIsFavorited(prevState => !prevState);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/users/${userId}/trips/${tripId}`, {
                favorite: !isFavorited
            });
        } catch (error) {
            console.error("Error favoriting trip", error);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);


    return (
        <div>
            <br />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <h2 className='trip-info-title' style={{ marginRight: '10px', marginTop: '40px' }}>Trip Info</h2>
                {/* Favorite Star Icon */}
                <div
                    className="favorite-icon"
                    onClick={(event) => {
                        handleFavoriteClick();
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {isFavorited ? (
                        <StarIcon sx={{ color: 'yellow', zIndex: 2, fontSize: 35 }} />
                    ) : (
                        <StarBorderIcon sx={{ color: 'gray', zIndex: 2, fontSize: 35 }} />
                    )}
                </div>
            </div>
            <div className="trip-overview">
                <div className="trip-overview-div">
                    <div className="trip-overview-circle">🗓️</div>
                    <div className="trip-overview-content">
                        <p>
                            <DateComponent dateStr={tripData.data.start_date} showYear={showYear} /> {' ~ '}
                            <DateComponent dateStr={tripData.data.end_date} showYear={true} />
                        </p>
                    </div>
                </div>

                <div className="trip-overview-div">
                    <div className="trip-overview-bag" style={{ marginLeft: '-30px' }}>💰</div>
                    <div className="trip-overview-content">
                        <p style={{ marginLeft: '-30px' }}>{currencySymbol}{convertedBudget}</p>
                    </div>
                </div>

                <div className="trip-overview-div">
                    <div id="trip-locations-circle">📍</div>
                    <div className="trip-overview-content">
                        <div className='dropdown-container'>
                            <LocationsDropdownComponent tripLocations={tripLocations} />
                        </div>
                    </div>
                </div>
            </div>


            <br />
            <div className='row'>
                <div className='col' style={{ marginBottom: "20px" }}>
                    <DefaultTripImagesComponent tripId={tripId} tripLocations={tripLocations} />
                </div>
                <div className='col' style={{ flexDirection: "column", marginBottom: "20px" }}>
                    <Calendar
                        tileClassName={({ date }) => {
                            if (isDateInRange(date)) {
                                return 'highlighted-date';
                            }
                            return null;
                        }}
                        tileContent={({ date }) => {
                            const dateKey = date.toDateString();
                            const total = totalExpensesByDate[dateKey];

                            return (
                                <div
                                    className="tile-content"
                                    onClick={(event) => handleDateClick(date, event)}
                                >
                                    {total !== undefined && (
                                        <div className={`expense-amount ${exceedsBudget ? 'cal-above-budget' : 'cal-below-budget'}`}>{currencySymbol}{total.toFixed(2)}</div>
                                    )}
                                </div>
                            );
                        }}
                    />

                    {showExpenseBox && selectedDate && (
                        <div
                            ref={expenseBoxRef}
                            className="expense-box"
                            style={{
                                position: 'absolute',
                                top: `${boxPosition.top}px`,
                                left: `${boxPosition.left}px`,
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderRadius: '5px',
                                padding: '10px',
                                zIndex: 1000,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {selectedDate.expenses.map((expense, index) => (
                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ flex: 1 }}>{expense.name}</span>
                                        <span style={{ width: '80px', textAlign: 'right' }}>{currencySymbol}{expense.amount}</span> {/* Fixed width for amount */}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default GeneralTripInfoComponent;
