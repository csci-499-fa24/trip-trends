import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import '../../css/ExpenseTableComponent.css';
import currencySymbolMap from 'currency-symbol-map';
import LoadingPageComponent from '../LoadingPageComponent';

const ExpenseTableComponent = ({ tripData, tripId, tripLocations, expensesToDisplay, currencyCodes, expenseCategories, categoryData, selectedCurrency, setSelectedCurrency, otherCurrencies}) => {
    const [isEditPopupVisible, setEditPopupVisible] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [localFormCurrency, setLocalFormCurrency] = useState(selectedCurrency);
    const [loading, setLoading] = useState(true);
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    const [expensesWithReceipt, setExpensesWithReceipt] = useState({});
    const [modalImage, setModalImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoadingTimedOut(true); 
            }
        }, 5000); // 5 seconds

        return () => clearTimeout(timeoutId);
    }, [loading]);

    useEffect(() => {
        if (expensesToDisplay && categoryData && categoryData.datasets && categoryData.datasets.length > 0) {
            setLoading(false); 
        }
    }, [expensesToDisplay, categoryData]);

    useEffect(() => {
        if (Array.isArray(expensesToDisplay)) {
            expensesToDisplay.forEach(async (expense) => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expense.expense_id}/check-receipt`);
                    if (response.status === 200) {
                        setExpensesWithReceipt((prev) => ({
                            ...prev,
                            [expense.expense_id]: response.data.receiptExists,
                        }));
                    }
                } catch (error) {
                    console.error('Error checking receipt:', error);
                }
            });
        }
    }, [expensesToDisplay]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedExpense((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCurrencyChange = (e) => {
        setLocalFormCurrency(e.target.value);
    };

    const handleEditClick = (expense) => {
        setEditPopupVisible(true);
        setSelectedExpense(expense);
        setLocalFormCurrency(expense.currency);
    };

    const submitEditExpense = async (expenseID) => {
        const updatedExpense = { ...selectedExpense, currency: localFormCurrency };

        // update global currency if it is different
        if (selectedExpense.currency !== localFormCurrency) {
            // update global currency
            setSelectedCurrency(localFormCurrency);
        }
        axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseID}`, updatedExpense)
            .then(response => {
                console.log(response)
                window.location.reload();
                setEditPopupVisible(false);
            })
            .catch(error => {
                console.error('Error editing expense:', error);
            });
    };

    const deleteExpense = async (expenseID) => {
        if (window.confirm('Confirm expense deletion. This action cannot be undone.')) {
            axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseID}`)
                .then(response => {
                    console.log(response);
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error deleting expense:', error);
                });
            setEditPopupVisible(false);
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Flights':
                return '✈️';
            case 'Accommodations':
                return '🏨';
            case 'Food/Drink':
                return '🍽️';
            case 'Transport':
                return '🚗';
            case 'Activities':
                return '🎢';
            case 'Shopping':
                return '🛍️';
            case 'Phone/Internet':
                return '📱';
            case 'Health/Safety':
                return '🚑';
            case 'Other':
                return '🌈';
        }
    };

    const memoizedExpenses = useMemo(() => {
        if (!expensesToDisplay || expensesToDisplay.length === 0) return [];
        return expensesToDisplay.map((expense) => {
            const categoryIndex = categoryData?.labels?.indexOf(expense.category) || -1;

            const tagColor = categoryData?.datasets?.[0]?.backgroundColor?.[categoryIndex] || '#000'; // Fallback to black if not found
            const currencySymbol = currencySymbolMap(expense.currency);

            return {
                ...expense,
                tagColor,
                currencySymbol
            };
        });
    }, [expensesToDisplay, categoryData]);

    const handleReceiptClick = async (expenseId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseId}/image`, {
                responseType: 'blob', // Ensure you get the image data
            });
            const imageUrl = URL.createObjectURL(response.data);
            setModalImage(imageUrl); // Set the image for the modal
            setIsModalOpen(true); // Open the modal
        } catch (error) {
            console.error('Error fetching receipt image:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Close the modal
        setModalImage(null); // Clear the image
    };

    if (loading && !loadingTimedOut) {
        return <LoadingPageComponent />;
    }

    if (loadingTimedOut && (expensesToDisplay && expensesToDisplay.length === 0)) {
        return <p>No expenses yet...</p>;
    }

    return (
        <div>
            {expensesToDisplay && categoryData.datasets && categoryData.datasets.length > 0 ? (
                <div>
                    <div className="expense-table-container">
                        <Table hover size="sm" responsive="sm" className="expense-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Currency</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                    <th>Receipt</th> {/* New Receipt Column */}
                                    <th>Edit</th>
                                </tr>
                            </thead>
                            <tbody> 
                                {expensesToDisplay.map((expense) => {
                                    const categoryIndex = categoryData.labels.indexOf(expense.category);
                                    const tagColor = categoryData.datasets[0].backgroundColor[categoryIndex];
                                    return (
                                        <tr key={expense.expense_id}>
                                            <td>{expense.name}</td>
                                            <td>
                                                {currencySymbolMap(expense.currency)}
                                                {expense.amount}
                                            </td>
                                            <td>{expense.currency}</td>
                                            <td>
                                                <span
                                                    className="category-tag"
                                                    style={{
                                                        backgroundColor: tagColor,
                                                        color: 'white',
                                                        padding: '5px 10px',
                                                        borderRadius: '20px',
                                                        textTransform: 'capitalize',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {getCategoryIcon(expense.category)} {expense.category}
                                                </span>
                                            </td>
                                            <td>{expense.posted.split('-')[1]}/{expense.posted.split('-')[2]}/{expense.posted.split('-')[0]}</td>
                                            <td>{expense.notes}</td>
                                            <td>
                                            {/* Display Receipt SVG */}
                                            {expensesWithReceipt[expense.expense_id] ? (
                                                <button 
                                                onClick={() => handleReceiptClick(expense.expense_id)} 
                                                aria-label="View Receipt"
                                                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }} // Makes the background transparent
                                                >
                                                <svg 
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
                                                    d="m9 14.25 6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
                                                    />
                                                </svg>
                                                </button>
                                            ) : (
                                                <span>No Receipt</span>
                                            )}
                                            </td>
                                            <td>
                                                <div className="icon-div" tooltip="Edit Trip" tabIndex="0">
                                                    <div className="icon-SVG">
                                                        <svg
                                                            onClick={() => handleEditClick(expense)}
                                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                        <span className="icon-text">Edit Expense</span>
                                                    </div>
                                                </div>
                                                <div className="expense-form">
                                                    {isEditPopupVisible && selectedExpense && (
                                                        <div className="edit-expense-modal">
                                                            <div className="edit-expense-modal-content">
                                                                <span className="close" onClick={() => setEditPopupVisible(false)}>&times;</span>
                                                                <h2 className="edit-expense-title">Edit or Delete Expense</h2>
                                                                <form onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    submitEditExpense(selectedExpense.expense_id);
                                                                }}>
                                                                    <label className="edit-expense-field-label">
                                                                        Expense Name:
                                                                        <input
                                                                            type="text"
                                                                            name="name"
                                                                            value={selectedExpense.name}
                                                                            onChange={handleEditChange}
                                                                            required
                                                                        />
                                                                    </label>
                                                                    <div className="field-pair">
                                                                        <label className="edit-expense-field-label">
                                                                            Amount:
                                                                            <input
                                                                                type="number"
                                                                                name="amount"
                                                                                value={selectedExpense.amount}
                                                                                onChange={handleEditChange}
                                                                                required
                                                                                style={{
                                                                                    paddingLeft: '35px',
                                                                                    paddingRight: '10px',
                                                                                    width: '100%',
                                                                                    textAlign: 'left'
                                                                                }}
                                                                            />
                                                                            {/* currency symbol */}
                                                                            <span
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    left: '43px',
                                                                                    top: '40%',
                                                                                    transform: 'translateY(-50%)',
                                                                                    pointerEvents: 'none',
                                                                                }}
                                                                            >
                                                                                {currencySymbolMap(localFormCurrency)}
                                                                            </span>
                                                                        </label>
                                                                        <label className="edit-expense-field-label">
                                                                            Currency:
                                                                            <select
                                                                                name="currency"
                                                                                value={localFormCurrency}
                                                                                onChange={handleCurrencyChange}
                                                                                required
                                                                            >
                                                                                <option value="USD">USD</option>
                                                                                {otherCurrencies.map((currency) => (
                                                                                    <option key={currency} value={currency}>
                                                                                        {currency}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </label>
                                                                    </div>
                                                                    <div className="field-pair">
                                                                    <label className="edit-expense-field-label">
                                                                        Category:
                                                                        <select
                                                                            name="category"
                                                                            value={selectedExpense.category}
                                                                            onChange={handleEditChange}
                                                                            required
                                                                        >
                                                                            {expenseCategories.map((category, idx) => (
                                                                                <option key={idx} value={category}>
                                                                                    {category}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </label>
                                                                    <label className="edit-expense-field-label">
                                                                        Date:
                                                                        <input
                                                                            type="date"
                                                                            name="posted"
                                                                            value={selectedExpense.posted}
                                                                            onChange={handleEditChange}
                                                                            required
                                                                        />
                                                                    </label>
                                                                    </div>
                                                                    <label className="new-expense-field-label">
                                                                        Notes:
                                                                        <input
                                                                            type="text"
                                                                            name="notes"
                                                                            value={selectedExpense.notes}
                                                                            onChange={handleEditChange}
                                                                        />
                                                                    </label>
                                                                   <div className='container'>
                                                                        <div className='row'>
                                                                            <div className='col'>
                                                                                <button type="submit" className="submit-edit-expense-button">Edit</button>
                                                                            </div>
                                                                            <div className='col'>
                                                                                <button type="button" onClick={() => deleteExpense(selectedExpense.expense_id)} className="delete-expense-button">Delete</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                    
                    {/* Modal for displaying the receipt */}
                    {isModalOpen && (
                        <div className="receipt-modal-overlay">
                            <div className="receipt-modal">
                                <button className="close-modal-button" onClick={handleCloseModal}>X</button>
                                <img src={modalImage} alt="Receipt" className="receipt-image" />
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                <p>No expense data available...</p>
            )}
        </div>
    );
};

export default ExpenseTableComponent;
