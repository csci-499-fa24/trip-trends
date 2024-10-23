import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import LocationsDropdownComponent from '../singletrip/LocationsDropdownComponent';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';

const GeneralTripInfoComponent = ({ tripData, tripId, tripLocations, expenses }) => {
    const [totalExpensesByDate, setTotalExpensesByDate] = useState({});

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
            // Split the date string to create a Date object
            const [year, month, day] = expense.posted.split('-').map(Number);
            // Create a date object using the year, month (0-indexed), and day
            const date = new Date(year, month - 1, day); // month is 0-indexed in JS

            // Normalize to the start of the day
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toDateString();

            const amount = parseFloat(expense.amountInUSD);
            if (!totals[dateKey]) {
                totals[dateKey] = 0;
            }
            totals[dateKey] += amount;
        });
        console.log("Totals by date:", totals);
        setTotalExpensesByDate(totals);
    }, [expenses]);

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
                    <Calendar
                        tileClassName={({ date }) => {
                            if (isDateInRange(date)) {
                                return 'highlighted-date'; // Highlight date if it falls within the range
                            }
                            return null; // No highlight otherwise
                        }}
                        tileContent={({ date }) => {
                            const dateKey = date.toDateString(); // Get the date key
                            const total = totalExpensesByDate[dateKey];

                            return (
                                <div style={{ textAlign: 'center' }}>
                                    {/* <div>{date.getDate()}</div> Display the actual date */}
                                    {total !== undefined && <div>${total.toFixed(2)}</div>} {/* Show total if defined */}
                                </div>
                            );
                        }}
                    />
                </div>
            </div>

        </div>
    );
};

export default GeneralTripInfoComponent;
