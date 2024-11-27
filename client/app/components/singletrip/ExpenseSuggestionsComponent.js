import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExpenseSuggestionsComponent = ({
    userId,
    currentTripId,
    onTransferSuccess,
}) => {
    const [suggestedExpenses, setSuggestedExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const cardsPerPage = 2;

    useEffect(() => {
        const fetchSuggestedExpenses = async () => {
            if (!userId) return;

            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/-1?userId=${userId}&limit=10`
                );
                setSuggestedExpenses(response.data.data || []);
            } catch (err) {
                console.error("Error fetching suggested expenses:", err);
                setError("Failed to load suggested expenses");
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestedExpenses();
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
            <h3>Suggested Expenses</h3>
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