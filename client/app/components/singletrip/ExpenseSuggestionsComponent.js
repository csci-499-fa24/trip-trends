import React, { useState, useEffect } from "react";
import axios from "axios";

const ExpenseSuggestionsComponent = ({
    userId,
    currentTripId,
    onTransferSuccess,
}) => {
    const [suggestedExpenses, setSuggestedExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseId}`,
                {
                    fromTripId: -1,
                    toTripId: currentTripId,
                }
            );

            setSuggestedExpenses((prev) =>
                prev.filter((expense) => expense.id !== expenseId)
            );

            if (onTransferSuccess) {
                onTransferSuccess();
            }
        } catch (err) {
            console.error("Error transferring expense:", err);
            alert("Failed to transfer expense");
        }
    };

    if (loading) return <div>Loading suggested expenses...</div>;
    if (error) return <div>{error}</div>;
    if (suggestedExpenses.length === 0) return null;

    return (
        <div className="expense-suggestions-container">
            <h3>Suggested Expenses</h3>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {suggestedExpenses.map((expense) => (
                        <tr key={expense.id}>
                            <td>{expense.name}</td>
                            <td>
                                {expense.amount} {expense.currency}
                            </td>
                            <td>{expense.category}</td>
                            <td>
                                {new Date(expense.posted).toLocaleDateString()}
                            </td>
                            <td>
                                <div
                                            className="icon-div"
                                            tooltip="Add Expense"
                                            tabIndex="0"
                                        >
                                            <div className="icon-SVG">
                                                <svg
                                                    onClick={() => transferExpense(expense.id)}  
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExpenseSuggestionsComponent;
