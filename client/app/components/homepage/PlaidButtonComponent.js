import { useEffect, useState, useCallback } from "react";
import { PlaidLink } from "react-plaid-link";
import axios from "axios";
import dayjs from "dayjs";
import Fuse from "fuse.js";
import LoadingPageComponent from "../LoadingPageComponent";
import "../../css/plaid.css";

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
            setError("Failed to initialize bank connection");
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLinkToken();
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
            }
        } catch (err) {
            console.error("Token Exchange Error:", err);
            setError("Failed to connect bank account");
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
                        count: 10,
                        offset: 0,
                    }
                );

                const transactions = response.data.transactions;
                console.log("Transactions:", transactions);

                await saveTransactionsAsExpenses(transactions);
                onSuccess?.(transactions);
            } catch (err) {
                console.error("Transactions Fetch Error:", err);
                setError("Failed to retrieve transactions");
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
        "Other" 
    ];

    const categoryMap = {
        "grocery": "Food/Drink", 
        "taxi": "Transport", 
        "fuel": "Transport", 
        "hardware": "Shopping", 
        "online shopping": "Shopping", 
        "restaurant": "Food/Drink", 
        "utilities": "Phone/Internet", 
        "hotel": "Accommodations", 
        "fast food": "Food/Drink", 
        "department store": "Shopping", 
        "convenience": "Food/Drink", 
        "general contractor": "Other", 
        "food": "Food/Drink", 
        "car repair": "Transport", 
        "coffee": "Food/Drink", 
        "parking": "Transport", 
        "drugstore / pharmacy": "Health/Safety", 
        "airlines": "Flights", 
        "nurseries & gardening": "Shopping", 
        "auto parts": "Transport", 
        "bakery": "Food/Drink", 
        "transportation": "Transport", 
        "health": "Health/Safety", 
        "building supplies": "Shopping", 
        "office equipment": "Shopping",
        "airline": "Flights",
        "uber": "Transport",
        "hiking": "Activities",
        "museum": "Activities",
        "park": "Activities",
        "gym": "Activities"
    };

    const saveTransactionsAsExpenses = async (transactions) => {
        try {
            for (let transaction of transactions) {
                const matchedCategory = transaction.category 
                ? getMatchedCategory(transaction.category, expenseCategories)
                : "Other";
                const expenseData = {
                    name: transaction.name?.trim() || "Untitled Transaction",
                    amount: Math.abs(Number(transaction.amount) || 0),
                    category: matchedCategory || "Other",
                    currency: transaction.iso_currency_code || "USD",
                    posted: transaction.date || dayjs().format("YYYY-MM-DD"),
                    notes: transaction.merchant_name || 
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
                            error: postError.response?.data || postError.message
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Error processing transactions:", {
                error: err.message,
                stack: err.stack
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

    return (
        <div className="plaid-link-container">
            {isLoading ? (
                <LoadingPageComponent />
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : linkToken ? (
                <PlaidLink
                    className="plaid-link-button"
                    token={linkToken}
                    onSuccess={handleOnSuccess}
                    onExit={(error, metadata) =>
                        console.log("Plaid Link Exit:", error, metadata)
                    }
                >
                    Link Bank Account
                </PlaidLink>
            ) : (
                <p>
                    Something went wrong... Please try again.
                </p>
            )}
        </div>
    );
};

export default PlaidLinkComponent;
