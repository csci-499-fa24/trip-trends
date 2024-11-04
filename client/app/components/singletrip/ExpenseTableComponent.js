import React, { useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { Card, CardContent, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const ExpenseTableComponent = ({ tripData, tripId, tripLocations , expenseData, currencyCodes, expenseCategories, userRole}) => {
    const [isEditPopupVisible, setEditPopupVisible] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedExpense((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const submitEditExpense = async (expenseID) => {
        axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${expenseID}`, selectedExpense)
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
    
    
    return (
        <div> 
            {expenseData && expenseData.data ? (
                <div>
                    <div className="expense-table-container">
                        <Table striped bordered hover size="sm" responsive="sm" className="expense-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Currency</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Notes</th>
                                    {userRole == 'owner' || userRole == 'editor' ? <th>Edit</th> : null}
                                </tr>
                            </thead>
                            <tbody>
                                {expenseData.data.map((expense) => (
                                    <tr key={expense.expense_id}>
                                        <td>{expense.name}</td>
                                        <td>{expense.amount}</td>
                                        <td>{expense.currency}</td>
                                        <td>{expense.category}</td>
                                        <td>
                                            {expense.posted.split('-')[0]}<br />
                                            {expense.posted.split('-')[1]}-{expense.posted.split('-')[2]}
                                        </td>
                                        <td>{expense.notes}</td>
                                        {(userRole == 'owner' || userRole == 'editor') && (
                                            <td>
                                                <div className="icon-div" tooltip="Edit Trip" tabIndex="0">
                                                    <div className="icon-SVG">
                                                        <svg
                                                            onClick={() => {
                                                                setEditPopupVisible(true);
                                                                setSelectedExpense(expense);
                                                            }}
                                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                        <span className="icon-text">Edit Expense</span>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="expense-form">
                        {isEditPopupVisible && selectedExpense && (
                            <div className="modal">
                                <div className="modal-content">
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
                                                />
                                            </label>
                                            <label className="edit-expense-field-label">
                                                Currency:
                                                <select
                                                    name="currency"
                                                    value={selectedExpense.currency}
                                                    onChange={handleEditChange}
                                                    required
                                                >
                                                    <option value="">Select Currency</option>
                                                    {currencyCodes.map((code) => (
                                                        <option key={code} value={code}>{code}</option>
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
                                                    <option value="">Select Category</option>
                                                    {expenseCategories.map((category) => (
                                                        <option key={category} value={category}>{category}</option>
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
                                        <label className="edit-expense-field-label">
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
                </div>
            ) : (
                <p>No expenses yet...</p>
            )}
        </div>
    );
};


export default ExpenseTableComponent;

