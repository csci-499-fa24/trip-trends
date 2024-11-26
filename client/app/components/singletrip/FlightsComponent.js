import React, { useEffect, useState } from 'react';
import Amadeus from 'amadeus';
import '../../css/discover.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingPageComponent from '../LoadingPageComponent';

const FlightsComponent = ({ tripId }) => {
    const [locationsData, setLocationsData] = useState([]);
    const [destinationAirportCodes, setDestinationAirportCodes] = useState([]);
    const [originAirportCode, setOriginAirportCode] = useState('');
    const [travelAirportCode, setTravelAirportCode] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [flights, setFlights] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [budgetOption, setBudgetOption] = useState('$'); // Budget option
    const [sortOption, setSortOption] = useState('PRICE');
    const [classOfServiceOption, setClassOfServiceOption] = useState('ECONOMY'); 

    useEffect(() => {
        if (tripId) {
            getTripLocation();
        }
    }, [tripId]);

    const getTripLocation = () => {
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`)
            .then(response => {
                // console.log(response.data);
                const data = response.data.data;

                const locationsWithLatLong = data.map(item => ({
                    location: item.location,
                    latitude: item.latitude,
                    longitude: item.longitude,
                }));

                setLocationsData(locationsWithLatLong);
                fetchArrivalAirportCodes(locationsWithLatLong);

            })
            .catch(error => {
                console.error('Error fetching trip data:', error);
            });
    };

    const amadeus = new Amadeus({
        clientId: process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET,
    });

    const fetchArrivalAirportCodes = async (locationsWithLatLong) => {
        try {
            const airportPromises = locationsWithLatLong.map(async (location) => {
                const { latitude, longitude } = location;

                try {
                    // fetch airports using coordinates
                    const response = await amadeus.referenceData.locations.airports.get({
                        latitude,
                        longitude,
                        radius: 80, // in km
                        sort: 'distance'
                    });
                    // console.log(response);

                    return response.data.map((airport) => airport.iataCode); // extract IATA codes
                } catch (error) {
                    console.error(`Error fetching airports for location [${latitude}, ${longitude}]:`, error);
                    return [];
                }
            });

            const airports = await Promise.all(airportPromises);

            setDestinationAirportCodes(airports.flat());

        } catch (error) {
            console.error('Error in fetchArrivalAirportCodes:', error);
        }
    };

    const budgetOptions = ['$', '$$', '$$$', '$$$$'];

    const budgetSignMapping = {
        $: { sort: 'PRICE', classOfService: 'ECONOMY' },
        $$: { sort: 'ML_BEST_VALUE', classOfService: 'PREMIUM_ECONOMY' },
        $$$: { sort: 'ML_BEST_VALUE', classOfService: 'BUSINESS' },
        $$$$: { sort: 'ML_BEST_VALUE', classOfService: 'FIRST' },
    };

    const handleBudgetOptionChange = (budgetSign) => {
        setBudgetOption(budgetSign);
        setSortOption(budgetSignMapping[budgetSign].sort);
        setClassOfServiceOption(budgetSignMapping[budgetSign].classOfService);
    };

    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
    
        const formattedDate = new Date(year, month - 1, day);
        
        const formattedDateString = formattedDate.toISOString().split('T')[0];
        return formattedDateString;
    };

    const searchFlights = async (e) => {
        e.preventDefault();
    
        if (!originAirportCode || !travelAirportCode || !travelDate || !returnDate) {
            toast.error('All fields are required!');
            return;
        }

        const formattedTravelDate = formatDate(travelDate)
        const formattedReturnDate = formatDate(returnDate)
        console.log(formattedTravelDate);
        console.log(formattedReturnDate);

        setLoading(true);
        const options = {
            method: 'GET',
            url: 'https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights',
            params: {
                sourceAirportCode: originAirportCode,
                destinationAirportCode: travelAirportCode,
                itineraryType: 'ROUND_TRIP', // assumes round trip, 'ONE_WAY'
                sortOrder: sortOption, //'ML_BEST_VALUE','PRICE'
                numAdults: 1,
                numSeniors: 0,
                classOfService: classOfServiceOption, // 'ECONOMY'
                date: formattedTravelDate,
                returnDate: formattedReturnDate
            },
            headers: {
                'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_TRIPADVISOR_KEY,
                'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
            },
        };
    
        try {
            const response = await axios.request(options);
            console.log('Flights Found:', response.data);
            setFlights(response.data.data.flights || []);
            console.log(response.data.data.flights);
            toast.success('Flight search successful!');

        } catch (error) {
            console.error('Error finding flights:', error);
            toast.error('Error finding flights');
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     console.log(budgetOption);
    //     console.log(sortOption);
    //     console.log(classOfServiceOption);
    // }, [budgetOption]);
    
    return (
    <div>
        {/* flight search fields */}
        <h2 className='section-title' style={{marginTop: '3%'}}>Search for Flights</h2>
        <div>
            <form onSubmit={searchFlights} className="flights-form">
            <div className="form-group">
                <label>Leaving From:</label>
                <div className="input-container">
                    <input
                        type="text"
                        value={originAirportCode}
                        onChange={(e) => setOriginAirportCode(e.target.value)}
                        required
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                </div>
            </div>

                <div className="form-group">
                    <label>Going To:</label>
                    <div className="select-container">
                        <select
                            value={travelAirportCode}
                            onChange={(e) => setTravelAirportCode(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select destination airport</option>
                            {destinationAirportCodes.map((code, index) => (
                                <option key={index} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                    </div>
                </div>

                <div className="form-group">
                    <label>Travel Date:</label>
                    <div className="input-container">
                    <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        required
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                    </svg>
                    </div>
                </div>
                <div className="form-group">
                    <label>Return Date:</label>
                    <div className="input-container">
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        required
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                    </svg>
                    </div>
                </div>

                {/* budget sign options */}
                <div className="budget-options-row">
                    <div className="budget-options-container">
                        {budgetOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`budget-option-btn ${budgetOption === option ? 'selected' : ''}`}
                                onClick={() => handleBudgetOptionChange(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="search-btn" style={{marginLeft: '15px'}}>Search Flights</button>
                </div>
            </form>
        </div>

                {/* flights found container */}
        <div className="flights-widget-container">
            <div className="flights-widget">
                {isLoading ? (
                    <LoadingPageComponent />
                ) : (
                    <>
                        <h2 className="section-title">Available Flights</h2>
                        <div className="flights-container">
                            {flights.length > 0 ? (
                                flights.map((flight, index) => (
                                    <div key={index} className="flight-card">
                                        <div className="flight-content">

                                            <div className="flight-logo-container">
                                                <img
                                                    src={flight.segments[0].legs[0].operatingCarrier.logoUrl}
                                                    alt={flight.segments[0].legs[0].operatingCarrier.displayName}
                                                    className="flight-logo"
                                                />
                                                <h3 className="flight-carrier-name">
                                                    {flight.segments[0].legs[0].marketingCarrier.displayName}
                                                </h3>
                                            </div>

                                            {flight.purchaseLinks[0].totalPricePerPassenger > 0 && (
                                                <p className="flight-price">
                                                    <strong>Price:</strong> ${flight.purchaseLinks[0].totalPricePerPassenger}
                                                </p>
                                            )}

                                            {flight.segments.map((segment, segmentIndex) => (
                                                <div key={segmentIndex} className="flight-segment">
                                                    {segment.legs.map((leg, legIndex) => {
                                                        if (!leg) return null;

                                                        const firstLegOrigin = segment.legs[0].originStationCode;
                                                        const lastLegDestination = segment.legs[segment.legs.length - 1].destinationStationCode;

                                                        return (
                                                            <div key={legIndex} className="flight-leg">

                                                                {/* display the first and last leg's origin and destination */}
                                                                {legIndex === 0 && (
                                                                    <div className="leg-info">
                                                                        <p className="leg-origin-destination">
                                                                            <strong>{firstLegOrigin}</strong> to{" "}
                                                                            <strong>{lastLegDestination}</strong>
                                                                        </p>
                                                                        <p className="leg-times">
                                                                            <strong>
                                                                                {new Date(segment.legs[0].departureDateTime).toLocaleTimeString()}
                                                                            </strong>{" "}
                                                                            -{" "}
                                                                            <strong>
                                                                                {new Date(segment.legs[segment.legs.length - 1].arrivalDateTime).toLocaleTimeString()}
                                                                            </strong>
                                                                        </p>
                                                                        <p className="leg-dates">
                                                                            <strong>
                                                                                {new Date(segment.legs[0].departureDateTime).toLocaleDateString()}
                                                                            </strong>{" "}
                                                                            -{" "}
                                                                            <strong>
                                                                                {new Date(segment.legs[segment.legs.length - 1].arrivalDateTime).toLocaleDateString()}
                                                                            </strong>
                                                                        </p>
                                                                        
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}

                                            <a
                                                href={`${flight.purchaseLinks[0].url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flight-booking-link"
                                            >
                                                Book on {flight.purchaseLinks[0].providerId}
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-flights">No Flights Found</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>

    </div>

    );
};

export default FlightsComponent;