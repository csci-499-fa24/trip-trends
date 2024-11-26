"use client";

// Import packages
import React, { useEffect, useState } from "react";
import "../css/singletrip.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-calendar/dist/Calendar.css";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Import components
import DownloadTripComponent from "../components/singletrip/DownloadTripComponent";
import CategoryDataComponent from "../components/singletrip/CategoryDataComponent";
import ExpenseFormComponent from "../components/singletrip/ExpenseFormComponent";
import GeneralTripInfoComponent from "../components/singletrip/GeneralTripInfoComponent";
import ExpenseTableComponent from "../components/singletrip/ExpenseTableComponent";
import BudgetMeterComponent from "../components/singletrip/BudgetMeterComponent";
import ExchangeRateTableComponent from "../components/singletrip/ExchangeRateTableComponent";
import HeaderComponent from "../components/HeaderComponent";
import TripIconBarComponent from "../components/singletrip/TripIconBarComponent";
import BarGraphComponent from "../components/singletrip/BarGraphComponent";
import SpendingCirclesComponent from "../components/singletrip/SpendingCirclesComponent";
import TripImageComponent from "../components/singletrip/TripImageComponent";
import UploadTripImage from "../components/singletrip/UploadTripImage";
import CurrencyToggleComponent from "../components/singletrip/CurrencyToggleComponent";
import LoadingPageComponent from "../components/LoadingPageComponent";
import ExpenseSuggestionsComponent from "../components/singletrip/ExpenseSuggestionsComponent";
import NavBarComponent from '../components/singletrip/NavBarComponent';

Chart.register(ArcElement, Tooltip, Legend);

function Singletrip() {
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState({
        labels: [],
        datasets: [],
    });
    const [tripId, setTripId] = useState(null);
    const [tripData, setTripData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const [expenseData, setExpenseData] = useState([]);
    const [fetchedExpenseData, setFetchedExpenseData] = useState([]);
    const [
        convertedHomeCurrencyExpenseData,
        setConvertedHomeCurrencyExpenseData,
    ] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [otherCurrencies, setOtherCurrencies] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("");
    const [tripLocations, setTripLocations] = useState([]);
    const [expenseUSD, setExpenseUSD] = useState([]);
    const [tripName, setTripName] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [newExpenseData, setNewExpenseData] = useState({
        trip_id: "",
        name: "",
        amount: "",
        currency: "",
        category: "",
        posted: "",
        notes: "",
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
        "Other",
    ]);
    const isOwner = userRole === "owner";
    // const [userId, setUserId] = useState(null);
    const [homeCurrency, setHomeCurrency] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // currency toggle related states
    const [selectedToggleCurrency, setSelectedToggleCurrency] = useState(""); // from currency toggle component
    // callback function to update currency from toggle switch
    const handleCurrencyToggleChange = (currency) => {
        setSelectedToggleCurrency(currency);
    };

    const [expensesToDisplay, setExpensesToDisplay] = useState([]); // expenses based on toggle currency, either original expenses or converted expenses
    const [totalExpensesInToggleCurrency, setTotalExpensesInToggleCurrency] =
        useState(0);
    // const [convertedTripData, setConvertedTripData] = useState(null);
    const [convertedBudget, setConvertedBudget] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
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
                    setHomeCurrency(currency); // Only set if currency is valid
                }
            }
        };

        getHomeCurrency(); // Fetch home currency when userId is available
    }, [userId]);

    const fetchTripData = () => {
        setLoading(true);
        if (tripId) {
            axios
                .get(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`
                )
                .then((response) => {
                    setTripData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching trip data:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };
    const handleExpenseTransferSuccess = () => {
        fetchExpenseData();
      };

    useEffect(() => {
        const savedFilter = localStorage.getItem('selectedFilter');

        if (savedFilter && expenseUSD.length > 0) {
            //console.log(expenseData)
            applyFilter(savedFilter);
        }
    }, [expenseUSD, selectedFilter]);

    const fetchExpenseData = () => {
        setLoading(true);
        axios
            .get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}`
            )
            .then((response) => {
                setExpenseData(response.data);
                setOriginalData(response.data);
                setFetchedExpenseData(response.data.data);

                fetchCurrencyRates(fetchedExpenses);

                const savedFilter = localStorage.getItem("selectedFilter");
                if (savedFilter) {
                    // console.log(expensesToDisplay);
                    applyFilter(savedFilter);
                }
            })
            .catch((error) => {
                console.error("Error fetching trip data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchTripLocations = () => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trip-locations/trips/${tripId}`
            )
            .then((response) => {
                setSelectedCurrency(response.data.data[0].currency_code);
                const locations = response.data.data;
                setTripLocations(
                    locations.map((location) => location.location)
                );

                // get unique currency codes
                const currencyCodes = [
                    ...new Set(
                        locations.map((location) => location.currency_code)
                    ),
                ];

                setOtherCurrencies(currencyCodes);
            })
            .catch((error) => {
                console.error("Error fetching trip data:", error);
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
            await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}`,
                updatedExpenseData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // image purposes
                    },
                }
            );

            setNewExpenseData({
                trip_id: "",
                name: "",
                amount: "",
                currency: "",
                category: "",
                posted: "",
                notes: "",
                image: null,
            });

            window.location.reload();
            setPopUpVisible(false);
        } catch (error) {
            console.error("Error submitting new expense:", error);
        }
    };

    const handleFilterChange = (filterValue) => {
        applyFilter(filterValue);
        setFilterPopupVisible(false);
    };

    const handleAllCategoriesSelect = () => {
        setSelectedCategory("");
        setExpenseData({ data: expensesToDisplay });
        setIsDropdownVisible(false);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setIsDropdownVisible(false);
    };

    useEffect(() => {
        if (selectedCategory) {
            applyCategoryFilter();
        }
    }, [selectedCategory]);

    const applyCategoryFilter = () => {
        let filteredData = [];

        if (selectedCategory) {
            expensesToDisplay.forEach((expense) => {
                if (expense.category === selectedCategory) {
                    filteredData.push(expense);
                }
            });
        }
        setExpenseData({ data: filteredData });
    };

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const applyFilter = (filterOption, data = expenseUSD) => {
        console.log('hi');
        if (!Array.isArray(data)) {
            console.error("Data is not an array:", data);
            return;
        }
    
        let sortedExpenses;
        if (filterOption === "highest") {
            sortedExpenses = [...data].sort(
                (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
            );
        } else if (filterOption === "lowest") {
            sortedExpenses = [...data].sort(
                (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
            );
        } else if (filterOption === "recent") {
            sortedExpenses = [...data].sort(
                (a, b) => new Date(b.posted) - new Date(a.posted)
            );
        } else if (filterOption === "oldest") {
            sortedExpenses = [...data].sort(
                (a, b) => new Date(a.posted) - new Date(b.posted)
            );
        }
    
        // Find corresponding expenses in expensesToDisplay
        const sortedWithDisplay = sortedExpenses.map(sortedExpense => {
            return expensesToDisplay.find(exp => exp.expense_id === sortedExpense.expense_id);
        });
    
        // Only update if the sorted data has actually changed
        if (JSON.stringify(sortedWithDisplay) !== JSON.stringify(expenseData.data)) {
            setExpenseData({ data: sortedWithDisplay });
        }
    
        // Update filter and store in localStorage only if changed
        if (filterOption !== selectedFilter) {
            setSelectedFilter(filterOption);
            localStorage.setItem('selectedFilter', filterOption);
        }
    };

    const clearFilter = () => {
        setSelectedFilter("");
        setExpenseData(originalData); // Reset to the original list

        // Remove the filter from localStorage
        localStorage.removeItem("selectedFilter");
    };

    useEffect(() => {
        const loadBootstrap = async () => {
            await import("bootstrap/dist/js/bootstrap.bundle.min.js");
        };
        loadBootstrap();

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("tripId");
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
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`
                    );
                    const sharedTrips = response.data.data;
                    const userRole = sharedTrips.find(
                        (trip) => trip.user_id === userId
                    )?.role;
                    if (userRole) {
                        setUserRole(userRole);
                    } else {
                        console.log("User does not have a role for this trip.");
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    // setError('Error fetching user role. Please try again later.');
                }
            } else {
                console.log("tripId or userId is missing.");
            }
        };
        fetchUserRole();

        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url:
                "https://data.fixer.io/api/symbols?access_key=" +
                `${process.env.NEXT_PUBLIC_FIXER_KEY}`,
            headers: {},
        };

        axios
            .request(config)
            .then((response) => {
                if (response.data.success && response.data.symbols) {
                    const codes = Object.keys(response.data.symbols);
                    setCurrencyCodes(codes);
                } else {
                    console.error(
                        "Failed to fetch currency symbols or symbols is undefined:",
                        response
                    );
                }
            })
            .catch((error) => {
                console.error("Error fetching currency symbols:", error);
            });
    }, [tripId]);

    useEffect(() => {
        if (homeCurrency) {
            // Only call fetchCurrencyRates when homeCurrency is successfully fetched
            fetchCurrencyRates(fetchedExpenseData);
        } else {
            console.error(
                "Home currency not set. Unable to fetch exchange rates."
            );
        }
    }, [homeCurrency, fetchedExpenseData]); // Dependencies: re-run if homeCurrency or expenses change

    const fetchHomeCurrency = async (userId) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}/home-currency`
            );
            return response.data.home_currency;
        } catch (error) {
            console.error("Error fetching home currency:", error);
            return null; // Handle error as needed
        }
    };

    useEffect(() => {
        const getExchangeRates = async () => {
            const rates = {};

            try {
                for (let currency of otherCurrencies) {
                    const response = await axios.get(
                        `https://hexarate.paikama.co/api/rates/latest/${homeCurrency}`,
                        {
                            params: {
                                target: currency,
                            },
                        }
                    );

                    if (
                        response.data &&
                        response.data.data &&
                        response.data.data.mid
                    ) {
                        rates[currency] = response.data.data.mid;
                    } else {
                        console.error(
                            "Invalid response structure:",
                            response.data
                        );
                    }
                }
                setExchangeRates(rates);
            } catch (error) {
                console.error("Error fetching exchange rates:", error);
            }
        };

        getExchangeRates();
    }, [selectedCurrency]);

    const toggleVisibility = () => {
        setIsVisible((prevState) => !prevState);
    };

    const convertBudget = async (budget) => {
        if (selectedToggleCurrency !== "") {
            try {
                // Fetch conversion rate for the budget
                const response = await axios.get(
                    `https://hexarate.paikama.co/api/rates/latest/${homeCurrency}?target=${selectedToggleCurrency}`
                );
                const conversionRate = response.data.data.mid; // assuming correct response structure

                const convertedBudget = (
                    parseFloat(budget) * conversionRate
                ).toFixed(2);

                setConvertedBudget(convertedBudget);
            } catch (error) {
                console.error("Error fetching conversion rates:", error);
            }
        } else {
            setConvertedBudget(budget);
        }
    };

    const convertExpenses = async (
        expenses,
        targetCurrency,
        setConvertedExpenses,
        setTotalExpenses,
        setCategoryData
    ) => {
        if (!targetCurrency) {
            return;
        }


        try {
            const uniqueCurrencies = [
                ...new Set(expenses.map((exp) => exp.currency)),
            ].filter(Boolean);

            // conversion rates for each currency
            const currencyPromises = uniqueCurrencies.map((currency) =>
                axios.get(
                    `https://hexarate.paikama.co/api/rates/latest/${currency}?target=${targetCurrency}`
                )
            );


            const currencyResponses = await Promise.all(currencyPromises);

            const currencyRates = currencyResponses.reduce(
                (acc, response, index) => {
                    acc[uniqueCurrencies[index]] = response.data.data.mid; // assuming correct response structure
                    return acc;
                },
                {}
            );

            let totalExpensesInTargetCurrency = 0;
            const categoryTotals = {};


            // convert expenses and calculate totals
            const convertedData = expenses.map((expense) => {
                const rate = currencyRates[expense.currency] || 1; // fallback to 1 if no rate is available
                const convertedAmount = (
                    parseFloat(expense.amount) * rate
                ).toFixed(2);

                categoryTotals[expense.category] =
                    (categoryTotals[expense.category] || 0) +
                    parseFloat(convertedAmount);
                totalExpensesInTargetCurrency += parseFloat(convertedAmount);


                return {
                    ...expense,
                    amount: convertedAmount,
                    currency: targetCurrency,
                };
            });


            setConvertedExpenses(convertedData);
            setTotalExpenses(totalExpensesInTargetCurrency);
            setExpenseUSD(convertedData);

            let currency =
                selectedToggleCurrency !== ""
                    ? selectedToggleCurrency
                    : homeCurrency;

            // prepare data for pie chart
            setCategoryData({
                labels: Object.keys(categoryTotals),
                datasets: [
                    {
                        label: ` Total in ${currency}`,
                        data: Object.values(categoryTotals),
                        backgroundColor: [
                            "#2A9D8F",
                            "#e76f51",
                            "#E9C46A",
                            "#F4A261",
                            "#c476bf",
                            "#264653",
                            "#e5989b",
                            "#9d0208",
                            "#e4c1f9",
                            "#bc6c25",
                            "#fca311",
                            "#d62828",
                            "#003049",
                            "#00a896",
                            "#f77f00",
                            "#8338ec",
                            "#fb5607",
                        ],
                        hoverOffset: 4,
                    },
                ],
            });
        } catch (error) {
            console.error("Error fetching conversion rates:", error);
        } finally {
            setLoading(false);
        }
    };


    // for home currency
    const fetchCurrencyRates = async () => {
        convertExpenses(
            expenseData.data,
            homeCurrency,
            setConvertedHomeCurrencyExpenseData,
            setTotalExpenses,
            setCategoryData
        );
    };


    // for toggle currency (including home currency)
    const convertExpensesToToggleCurrency = async () => {
        if (selectedToggleCurrency) {
            convertExpenses(
                expenseData.data,
                selectedToggleCurrency,
                setExpensesToDisplay,
                setTotalExpensesInToggleCurrency,
                setCategoryData
            );
        } else {
            fetchCurrencyRates();
            setExpensesToDisplay(expenseData.data); // if no currency selected, just display the original data
        }
    };

    useEffect(() => {
        if (tripData) {
            convertBudget(tripData.data.budget);
            setTripName(tripData.data.name);
        }
    }, [selectedToggleCurrency, tripData]);

    useEffect(() => {
        if (expenseData) {
            convertExpensesToToggleCurrency();
        }
    }, [selectedToggleCurrency, expenseData]);

    if (loading) {
        return <LoadingPageComponent />;
        return <LoadingPageComponent />;
    }

    return (
        <div>
            {/* Header section */}
            <HeaderComponent
                headerTitle={tripData ? tripData.data.name : ""}
                setUserName={setUserName}
                userId={userId}
            />
            <div className="main-container">
                {tripData ? (
                    <div>
                        <NavBarComponent tripId={tripId} userRole={userRole} tripName={tripName}/>
                        <div className='container'>
                            {/* Icon Bar Above Trip Info */}
                            <TripIconBarComponent
                                tripId={tripId}
                                userId={userId}
                                isOwner={isOwner}
                                tripData={tripData}
                                tripLocations={tripLocations}
                                userRole={userRole}
                                fetchTripData={fetchTripData}
                                homeCurrency={homeCurrency} // budget is always set as home
                            />
                            <CurrencyToggleComponent
                                homeCurrency={homeCurrency}
                                otherCurrencies={otherCurrencies}
                                toggleChange={handleCurrencyToggleChange} />
                            {/* General Trip Info*/}
                            <GeneralTripInfoComponent
                                userId={userId}
                                tripData={tripData} // handles budget currency
                                convertedBudget={convertedBudget}
                                tripId={tripId}
                                tripLocations={tripLocations}
                                expenses={expenseUSD}
                                totalExpenses={selectedToggleCurrency !== "" ? totalExpensesInToggleCurrency : totalExpenses}
                                currency={selectedToggleCurrency !== "" ? selectedToggleCurrency : homeCurrency} />
                        </div>
                        <br></br>
                        <div className="container">
                            <div className="row">
                                <div
                                    className="col"
                                    style={{ flexDirection: "column" }}
                                >
                                    <h2
                                        style={{
                                            textAlign: "center",
                                            marginBottom: "20px",
                                            marginTop: "15px",
                                        }}
                                    >
                                        Exchange Rates
                                    </h2>
                                    {/* Exchange Rate Table */}
                                    <ExchangeRateTableComponent
                                        exchangeRates={exchangeRates}
                                        currencyCodes={currencyCodes}
                                        homeCurrency={homeCurrency}
                                    />
                                </div>
                                <div
                                    className="col"
                                    style={{ flexDirection: "column" }}
                                >
                                    <h2
                                        style={{
                                            textAlign: "center",
                                            marginTop: "30px",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        Expenses in{" "}
                                        {selectedToggleCurrency !== ""
                                            ? selectedToggleCurrency
                                            : homeCurrency}
                                    </h2>
                                    <SpendingCirclesComponent
                                        totalExpenses={
                                            selectedToggleCurrency !== ""
                                                ? totalExpensesInToggleCurrency
                                                : totalExpenses
                                        }
                                        tripData={tripData}
                                        convertedBudget={convertedBudget}
                                        currency={
                                            selectedToggleCurrency !== ""
                                                ? selectedToggleCurrency
                                                : homeCurrency
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Data Visualisations Toggle */}
                        <div className="toggle-container">
                            <div className="row justify-content-center">
                                <div className="col-auto">
                                    <div
                                        className="icon-div toggle-icon"
                                        tabIndex="0"
                                        onClick={toggleVisibility}
                                    >
                                        <div className="icon-SVG">
                                            {isVisible ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.3"
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m4.5 18.75 7.5-7.5 7.5 7.5"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m4.5 12.75 7.5-7.5 7.5 7.5"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.3"
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                                                    />
                                                </svg>
                                            )}
                                            <span className="icon-text">
                                                {isVisible
                                                    ? "Hide Visualizations"
                                                    : "Show Visualizations"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isVisible && (
                                <>
                                    <div className="row">
                                        {/* Budget Meter */}
                                        <div className="col">
                                            <div className="meter-container">
                                                <BudgetMeterComponent
                                                    tripData={tripData}
                                                    convertedBudget={
                                                        convertedBudget
                                                    }
                                                    expensesToDisplay={
                                                        expensesToDisplay
                                                    }
                                                    totalExpenses={
                                                        selectedToggleCurrency !==
                                                        ""
                                                            ? totalExpensesInToggleCurrency
                                                            : totalExpenses
                                                    }
                                                    currency={
                                                        selectedToggleCurrency !==
                                                        ""
                                                            ? selectedToggleCurrency
                                                            : homeCurrency
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {/* Pie Chart */}
                                        <div className="col">
                                            <div className="meter-container">
                                                <CategoryDataComponent
                                                    categoryData={categoryData}
                                                    currency={
                                                        selectedToggleCurrency !==
                                                        ""
                                                            ? selectedToggleCurrency
                                                            : homeCurrency
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Bar Graph */}
                                    <div className="meter-container">
                                        <BarGraphComponent
                                            tripData={tripData}
                                            expensesToDisplay={
                                                selectedToggleCurrency !== ""
                                                    ? expensesToDisplay
                                                    : convertedHomeCurrencyExpenseData
                                            }
                                            categoryData={categoryData}
                                            currency={
                                                selectedToggleCurrency !== ""
                                                    ? selectedToggleCurrency
                                                    : homeCurrency
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <ExpenseSuggestionsComponent 
                            userId={userId} 
                            currentTripId={tripId}
                            onTransferSuccess={handleExpenseTransferSuccess}
                        />
                        {/* Icon Bar Above Expenses */}
                        <div>
                            <header className="icon-bar-header">
                                <div class="icon-bar-left">
                                    {userRole == "owner" ||
                                    userRole == "editor" ? (
                                        // {/* Add Expense Button */}
                                        <div
                                            className="icon-div"
                                            tooltip="Add Expense"
                                            tabIndex="0"
                                        >
                                            <div className="icon-SVG">
                                                <svg
                                                    onClick={() =>
                                                        setPopUpVisible(true)
                                                    }
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.3"
                                                    stroke="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                    />
                                                </svg>
                                                <span className="icon-text">
                                                    Add Expense
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                    {/* Download Trip Button */}
                                    <DownloadTripComponent
                                        tripData={tripData}
                                        tripId={tripId}
                                    />
                                </div>
                                <div className="icon-bar-center">
                                    <h2>Expense History</h2>
                                </div>
                                <div class="icon-bar-right">
                                    {/* Filter Expenses Button */}
                                    <div
                                        className="icon-div"
                                        tooltip="Filter"
                                        tabIndex="0"
                                    >
                                        <div className="icon-SVG">
                                            <svg
                                                onClick={() =>
                                                    setFilterPopupVisible(true)
                                                }
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.3"
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                                                />
                                            </svg>
                                            <span className="icon-text">
                                                Filter
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="spacer"></div>
                                <div className="divider"></div> */}

                                {/* Applied filter popup */}
                                {selectedFilter && (
                                    <div className="applied-filter">
                                        <span>{`Filter: ${selectedFilter}`}</span>
                                        <button
                                            className="clear-filter-btn"
                                            onClick={clearFilter}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}
                            </header>
                        </div>
                        <div className="container">
                            <div
                                className="row"
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    textAlign: "center",
                                }}
                            >
                                {/* Expense Table */}
                                <ExpenseTableComponent tripData={tripData} tripId={tripId} tripLocations={tripLocations} expensesToDisplay={expensesToDisplay}
                                    currencyCodes={currencyCodes} expenseCategories={expenseCategories} userRole={userRole} categoryData={categoryData} 
                                    selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} otherCurrencies={otherCurrencies} />
                            </div>
                            <br></br>
                            <br></br>
                            <br></br>
                        </div>
                    </div>
                ) : (
                    <LoadingPageComponent />
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
                                <span
                                    className="filter-popup-close"
                                    onClick={() => setFilterPopupVisible(false)}
                                >
                                    &times;
                                </span>
                                <h2 className="filter-popup-title">
                                    Filter Expenses
                                </h2>
                                <div className="filter-options">
                                    <button
                                        className="filter-option-button"
                                        onClick={() =>
                                            handleFilterChange("highest")
                                        }
                                    >
                                        Highest to Lowest
                                    </button>
                                    <button
                                        className="filter-option-button"
                                        onClick={() =>
                                            handleFilterChange("lowest")
                                        }
                                    >
                                        Lowest to Highest
                                    </button>
                                    <button
                                        className="filter-option-button"
                                        onClick={() =>
                                            handleFilterChange("recent")
                                        }
                                    >
                                        Most Recent
                                    </button>
                                    <button
                                        className="filter-option-button"
                                        onClick={() =>
                                            handleFilterChange("oldest")
                                        }
                                    >
                                        Oldest
                                    </button>
                                    <div className="filter-option-button">
                                        <label
                                            htmlFor="category"
                                            onClick={toggleDropdown}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Select Category
                                        </label>
                                        {isDropdownVisible && (
                                            <div className="custom-dropdown">
                                                <div
                                                    className="dropdown-item"
                                                    onClick={
                                                        handleAllCategoriesSelect
                                                    }
                                                >
                                                    All Categories
                                                </div>
                                                {expenseCategories.map(
                                                    (category) => (
                                                        <div
                                                            key={category}
                                                            className="dropdown-item"
                                                            onClick={() =>
                                                                handleCategorySelect(
                                                                    category
                                                                )
                                                            }
                                                        >
                                                            {category}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div></div>
        </div>
    );
}

export default Singletrip;
