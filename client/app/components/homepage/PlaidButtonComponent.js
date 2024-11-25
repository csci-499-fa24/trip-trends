import { useEffect, useState, useCallback } from "react";
import { PlaidLink } from "react-plaid-link";
import axios from "axios";
import dayjs from "dayjs";
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
                // fetch transactions using access token
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
                        count: 100,
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

    const saveTransactionsAsExpenses = async (transactions) => {
        try {
            for (let transaction of transactions) {
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/`, {
                    name: transaction.name,
                    amount: transaction.amount,
                    category: transaction.category.join(", "), 
                    currency: transaction.iso_currency_code,
                    posted: transaction.date,
                });
            }
        } catch (err) {
            console.error("Error saving transactions as expenses:", err);
        }
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
                    Link Your Bank Account
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
