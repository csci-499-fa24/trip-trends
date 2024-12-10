import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExpenseSuggestionsComponent = ({
    userId,
    currentTripId,
    onTransferSuccess,
    tripData,
}) => {
    const [suggestedExpenses, setSuggestedExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPlaidConnected, setIsPlaidConnected] = useState(false);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const cardsPerPage = 2;

    const fetchTransactions = useCallback(async (token, startDate, endDate) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/transactions`,
                {
                    access_token: token,
                    start_date: startDate,
                    end_date: endDate,
                    count: 100,
                    offset: 0,
                }
            );

            const transactions = response.data.transactions || [];
            console.log("Fetched Transactions:", transactions);

            if (transactions.length === 0) {
                console.log(
                    "No transactions found in Plaid for the specified range."
                );
            }

            return transactions;
        } catch (err) {
            console.error("Transactions Fetch Error:", err);
            toast.error("Failed to fetch transactions from Plaid");
            return [];
        }
    }, []);

    const fetchSuggestedExpenses = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/-1?userId=${userId}&limit=10`
            );
            const fetchedExpenses = response.data.data || [];
            console.log("Fetched Expenses from Server:", fetchedExpenses);

            const startDate = dayjs(tripData?.data?.start_date).format(
                "YYYY-MM-DD"
            );
            const endDate = dayjs(tripData?.data?.end_date).format(
                "YYYY-MM-DD"
            );

            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.warn("Connect Plaid to get suggested expenses.");
                return;
            }

            const plaidTransactions = await fetchTransactions(
                token,
                startDate,
                endDate
            );

            console.log("Plaid Transactions:", plaidTransactions);

            const combinedExpenses = [...plaidTransactions, ...fetchedExpenses];
            console.log(
                "Combined Expenses (Plaid + Server):",
                combinedExpenses
            );

            setSuggestedExpenses(combinedExpenses.slice(0, 10));
        } catch (err) {
            console.error("Error fetching suggested expenses:", err);
            setError("Failed to load suggested expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId && tripData && isPlaidConnected) {
            fetchSuggestedExpenses();
        }
    }, [userId, tripData]);

    useEffect(() => {
        const plaidStatus = localStorage.getItem("plaid_connected");
        if (plaidStatus === "true") {
            setIsPlaidConnected(true);
            fetchSuggestedExpenses();
        } else {
            setIsPlaidConnected(false);
        }
    }, [userId]);

    const transferExpense = async (expenseId) => {
        try {
            console.log("Expense ID:", expenseId);
            // console.log("Suggested Expenses:", suggestedExpenses);

            if (!expenseId) {
                toast.error("Expense ID is undefined.");
                return;
            }

            const expense = suggestedExpenses.find(
                (expense) => expense.expense_id === expenseId
            );
            if (!expense) {
                toast.error("Expense not found.");
                return;
            }

            const createExpenseResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${currentTripId}`,
                {
                    name: expense.name,
                    amount: expense.amount,
                    category: expense.category,
                    currency: expense.currency,
                    posted: expense.posted,
                    notes: expense.notes,
                }
            );

            await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expense.expense_id}`
            );

            toast.success("Expense transferred successfully");

            console.log(
                "Expense transferred:",
                createExpenseResponse.data.data
            );
            setSuggestedExpenses((prev) =>
                prev.filter((expense) => expense.expense_id !== expenseId)
            );

            if (onTransferSuccess) {
                onTransferSuccess();
            }
            window.location.reload();
        } catch (err) {
            console.error("Error transferring expense:", err);
            toast.error("Failed to transfer expense");
        }
    };

    const handleNext = () => {
        setCurrentIndex(
            (prevIndex) => (prevIndex + 1) % suggestedExpenses.length
        );
    };

    const handlePrev = () => {
        setCurrentIndex(
            (prevIndex) =>
                (prevIndex - 1 + suggestedExpenses.length) %
                suggestedExpenses.length
        );
    };

    if (isPlaidConnected === false) {
        return (
            <div className="expense-suggestions-container">
                <br></br>
                <h2>Suggested Expenses</h2>
                {error || "Please connect your bank account using Plaid."}
            </div>
        );
    }

    if (suggestedExpenses.length === 0) {
        return (
            <div style={{ textAlign: "center", fontSize: "0.875rem" }}>
                <p>No recent transactions found.</p>
            </div>
        );
    }

    if (loading) return <div>Loading suggested expenses...</div>;
    if (error) return <div>{error}</div>;

    const currentCards = suggestedExpenses.slice(
        currentIndex,
        currentIndex + cardsPerPage
    );
    if (currentCards.length < cardsPerPage) {
        currentCards.push(
            ...suggestedExpenses.slice(0, cardsPerPage - currentCards.length)
        );
    }

    if (suggestedExpenses.length === 0) return null;

    return (
        <div className="expense-suggestions-container">
            <h2>Suggested Expenses</h2>
            <div className="expenses-suggestions-carousel">
                <div className="arrow">
                    <svg
                        onClick={handlePrev}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                    </svg>
                </div>

                <div className="cards-container">
                    {currentCards.map((expense) => (
                        <div
                            className="suggestion-card"
                            key={expense.expense_id}
                        >
                            <div className="add-suggestion-div">
                                <svg
                                    onClick={() =>
                                        transferExpense(expense.expense_id)
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
                            </div>
                            <h4 className="expense-name">{expense.name}</h4>
                            <div className="expense-details">
                                <p className="expense-detail">
                                    Amount: {expense.amount} {expense.currency}
                                </p>
                                <p className="expense-detail">
                                    Category: {expense.category}
                                </p>
                                <p className="expense-detail">
                                    Date:{" "}
                                    {new Date(
                                        expense.posted
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="arrow">
                    <svg
                        onClick={handleNext}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSuggestionsComponent;
