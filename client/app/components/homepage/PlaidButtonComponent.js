import { useEffect, useState, useCallback } from "react";
import { PlaidLink } from "react-plaid-link";
import axios from "axios";
import dayjs from "dayjs";
import Fuse from "fuse.js";
import LoadingPageComponent from "../LoadingPageComponent";
import "../../css/plaid.css";
import { toast } from "react-toastify";

const PlaidLinkComponent = ({ onSuccess }) => {
    const [linkToken, setLinkToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    const fetchLinkToken = useCallback(async () => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/link-token`,
                {
                    client_user_id: "user-id",
                }
            );
            setLinkToken(response.data.link_token);
            setIsLoading(false);
        } catch (err) {
            console.error("Link Token Error:", err);
            toast.error("Failed to connect to bank account");
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const savedAccessToken = localStorage.getItem("access_token");
        if (savedAccessToken) {
            setAccessToken(savedAccessToken);
            setIsLoading(false);
        } else {
            fetchLinkToken();
        }
    }, [fetchLinkToken]);

    const handleOnSuccess = useCallback(async (public_token) => {
        try {
            // exchange public token for access token
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/exchange-public-token`,
                {
                    public_token,
                }
            );

            if (data.access_token) {
                setAccessToken(data.access_token);
                await fetchTransactions(data.access_token);
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("plaid_connected", "true");
            }
        } catch (err) {
            console.error("Token Exchange Error:", err);
            toast.error("Failed to connect to bank account");
            localStorage.setItem("plaid_connected", "false");
        }
    }, []);

    const fetchTransactions = useCallback(
        async (token) => {
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/transactions`,
                    {
                        access_token: token,
                        start_date: dayjs()
                            .subtract(90, "days")
                            .format("YYYY-MM-DD"),
                        end_date: dayjs().format("YYYY-MM-DD"),
                        count: 100,
                        offset: 0,
                    }
                );

                const transactions = response.data.transactions;
                console.log("Transactions:", transactions);

                onSuccess?.(transactions);
            } catch (err) {
                console.error("Transactions Fetch Error:", err);
                toast.error("Failed to fetch transactions");
            }
        },
        [onSuccess]
    );

    const expenseCategories = [
        "Flights",
        "Accommodations",
        "Food/Drink",
        "Transport",
        "Activities",
        "Shopping",
        "Phone/Internet",
        "Health/Safety",
        "Other",
    ];

    const categoryMap = {
        grocery: "Food/Drink",
        taxi: "Transport",
        fuel: "Transport",
        hardware: "Shopping",
        "online shopping": "Shopping",
        restaurant: "Food/Drink",
        utilities: "Phone/Internet",
        hotel: "Accommodations",
        "fast food": "Food/Drink",
        "department store": "Shopping",
        convenience: "Food/Drink",
        "general contractor": "Other",
        food: "Food/Drink",
        "car repair": "Transport",
        coffee: "Food/Drink",
        parking: "Transport",
        "drugstore / pharmacy": "Health/Safety",
        airlines: "Flights",
        "nurseries & gardening": "Shopping",
        "auto parts": "Transport",
        bakery: "Food/Drink",
        transportation: "Transport",
        health: "Health/Safety",
        "building supplies": "Shopping",
        "office equipment": "Shopping",
        airline: "Flights",
        uber: "Transport",
        hiking: "Activities",
        museum: "Activities",
        park: "Activities",
        gym: "Activities",
    };

    const saveTransactionsAsExpenses = async (transactions) => {
        try {
            for (let transaction of transactions) {
                const matchedCategory = transaction.category
                    ? getMatchedCategory(
                          transaction.category,
                          expenseCategories
                      )
                    : "Other";
                const expenseData = {
                    name: transaction.name?.trim() || "Untitled Transaction",
                    amount: Math.abs(Number(transaction.amount) || 0),
                    category: matchedCategory || "Other",
                    currency: transaction.iso_currency_code || "USD",
                    posted: transaction.date || dayjs().format("YYYY-MM-DD"),
                    notes:
                        transaction.merchant_name ||
                        transaction.payment_channel ||
                        transaction.location?.city ||
                        "No additional notes",
                };
                if (expenseData.amount > 0) {
                    try {
                        const response = await axios.post(
                            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/-1`,
                            expenseData
                        );

                        console.log("Expense saved:", {
                            name: expenseData.name,
                            amount: expenseData.amount,
                            category: expenseData.category,
                        });
                    } catch (postError) {
                        console.error("Failed to save individual expense:", {
                            transaction: expenseData,
                            error:
                                postError.response?.data || postError.message,
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Error processing transactions:", {
                error: err.message,
                stack: err.stack,
            });
        }
    };

    const getMatchedCategory = (transactionCategories, expenseCategories) => {
        const options = {
            includeScore: true,
            threshold: 0.4,
            keys: ["category"],
        };

        const fuse = new Fuse(expenseCategories, options);
        let bestCategory = "Other";

        for (let category of transactionCategories) {
            const normalizedCategory = category.toLowerCase().trim();
            const mappedCategory = categoryMap[normalizedCategory];
            if (mappedCategory) {
                return mappedCategory;
            }

            const matchedCategory = fuse.search(normalizedCategory);
            if (matchedCategory.length > 0) {
                bestCategory = matchedCategory[0].item;
                break;
            }
        }

        return bestCategory;
    };

    const handleOnExit = (error, metadata) => {
        console.log("Plaid Link Exit:", error, metadata);
        if (error) {
            setError(error.display_message || "Connection interrupted");
        }
    };

    const resetPlaidConnection = () => {
        setAccessToken(null);
        setLinkToken(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("plaid_connected");
        fetchLinkToken();
        toast.success("Bank account disconnected.");
    };

    return (
        <div className="plaid-link-container">
            {isLoading ? (
                <LoadingPageComponent />
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : accessToken ? (
                <div className="plaid-link-button-wrapper">
                    <button
                        className="plaid-link-button"
                        onClick={resetPlaidConnection}
                    >
                        
                        <div style={{ display: 'inline-flex', marginRight: '5px', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 25" strokeWidth="1.5" stroke="currentColor" className="size-6" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.181 8.68a4.503 4.503 0 0 1 1.903 6.405m-9.768-2.782L3.56 14.06a4.5 4.5 0 0 0 6.364 6.365l3.129-3.129m5.614-5.615 1.757-1.757a4.5 4.5 0 0 0-6.364-6.365l-4.5 4.5c-.258.26-.479.541-.661.84m1.903 6.405a4.495 4.495 0 0 1-1.242-.88 4.483 4.483 0 0 1-1.062-1.683m6.587 2.345 5.907 5.907m-5.907-5.907L8.898 8.898M2.991 2.99 8.898 8.9" />
                            </svg> 
                        </div>
                        Unlink Bank
                    </button>
                </div>
            ) : linkToken ? (
                <div className="plaid-link-button-wrapper">
                    <PlaidLink
                        className="plaid-link-button"
                        token={linkToken}
                        onSuccess={handleOnSuccess}
                        onExit={(error, metadata) =>
                            console.log("Plaid Link Exit:", error, metadata)
                        }
                    >
                        <div style={{ display: 'inline-flex', marginRight: '5px', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 25" strokeWidth="1.3" stroke="currentColor" className="size-6" width="20" height="20">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                        </div>
                        Link Bank
                    </PlaidLink>
                </div>
            ) : (
                <p>...</p>
            )}
        </div>
    );
    
};

export default PlaidLinkComponent;
