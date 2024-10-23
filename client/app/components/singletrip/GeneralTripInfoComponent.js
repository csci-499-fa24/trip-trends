import React from 'react';
import Calendar from 'react-calendar';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import LocationsDropdownComponent from '../singletrip/LocationsDropdownComponent';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';

const GeneralTripInfoComponent = ({ tripData, tripId, tripLocations }) => {
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
                    <div className="meter-container">
                        <p id='budgetTitle'>Your Trip Calendar:</p>
                        <br />
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
                </div>
            </div>
        </div>
    );
};

export default GeneralTripInfoComponent;
