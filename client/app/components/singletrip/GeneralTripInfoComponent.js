import React from 'react';
import Calendar from 'react-calendar';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import LocationsDropdownComponent from '../singletrip/LocationsDropdownComponent';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';

const GeneralTripInfoComponent = ({ tripData, tripId, tripLocations, expences }) => {
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

    const renderTileContent = (date) => {
        const targetDate = new Date(2024, 9, 23); // October is the 9th month (zero-indexed)

        if (date.toDateString() === targetDate.toDateString()) {
            return (
                <div style={{ textAlign: 'center' }}> {/* Center the content */}
                    <span style={{ color: 'red' }}>10</span> {/* Display "10" underneath */}
                </div>
            );
        }

        return null;
    };

    return (
        <div>
            <div className="trip-overview">
                <div className="trip-overview-div">
                    <div className="trip-overview-circle">🗓️</div>
                    <div className="trip-overview-content">
                        <p>
                            <DateComponent dateStr={tripData.data.start_date} /> -
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
                    <div className="calendar-container">
                        {/* <p id='budgetTitle'>Your Trip Calendar:</p>
                        <br /> */}
                        <Calendar
                            tileClassName={({ date }) => {
                                if (isDateInRange(date)) {
                                    return 'highlighted-date';
                                }
                                return null;
                            }}
                        // tileContent={({ date }) => renderTileContent(date)} // Render content on specific dates
                        />
                    </div>
                </div>
            </div>


            <div>
                <h2>Expense USD</h2>
                <ul>
                    {expences.map((expense) => (
                        <li key={expense.expense_id}>
                            Amount: {expense.amountInUSD}, Category: {expense.posted}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GeneralTripInfoComponent;
