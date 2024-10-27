import React, { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import LocationsDropdownComponent from '../singletrip/LocationsDropdownComponent';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';

const GeneralTripInfoComponent = ({ tripData, tripId, tripLocations, expenses }) => {
    const [totalExpensesByDate, setTotalExpensesByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showExpenseBox, setShowExpenseBox] = useState(false);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
    const expenseBoxRef = useRef(null);


    const DateComponent = ({ dateStr }) => {
        const dateObj = new Date(dateStr);
        const options = { month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);

        return (
            <span>
                {dateObj.toLocaleDateString('en-US', options)}
            </span>
        );
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

        return { startDate, endDate };
    };

    const { startDate, endDate } = getTripDates();




    useEffect(() => {
        const totals = {};
        expenses.forEach(expense => {
            const [year, month, day] = expense.posted.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            date.setHours(0, 0, 0, 0);
            const dateKey = date.toDateString();

            const amount = parseFloat(expense.amountInHomeCurrency);
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

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);


    return (
        <div>
            <div className="trip-overview">
                <div className="trip-overview-div">
                    <div className="trip-overview-circle">🗓️</div>
                    <div className="trip-overview-content">
                        <p>
                            <DateComponent dateStr={tripData.data.start_date} /> {' ~ '} 
                            <DateComponent dateStr={tripData.data.end_date} />
                        </p>
                    </div>
                </div>

                <div className="trip-overview-div">
                    <div className="trip-overview-circle">💰</div>
                    <div className="trip-overview-content">
                        <p>${tripData.data.budget}</p>
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
                <div className='col'>
                    <DefaultTripImagesComponent tripId={tripId} tripLocations={tripLocations} />
                </div>
                <div className='col' style={{ flexDirection: "column" }}>
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
                                        <div className="expense-amount">{total.toFixed(2)}</div>
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
                                        <span style={{ width: '80px', textAlign: 'right' }}>{expense.amountInHomeCurrency}</span> {/* Fixed width for amount */}
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
