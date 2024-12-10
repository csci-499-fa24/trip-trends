import React, { useState } from 'react';
import ReceiptImageComponent from './ReceiptImageComponent';
import currencySymbolMap from 'currency-symbol-map';
import '../../css/singletrip.css';

const ExpenseFormComponent = ({ 
    tripId, 
    newExpenseData, 
    setNewExpenseData, 
    selectedCurrency, 
    setSelectedCurrency, 
    submitNewExpense, 
    isPopUpVisible, 
    setPopUpVisible,
    otherCurrencies,
    currencyCodes,
    expenseCategories
}) => {
    const newExpenseInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'currency') {
            setSelectedCurrency(value); // Update selected currency
        }
        setNewExpenseData({ ...newExpenseData, [name]: value });
    };

    const handleFormData = (formData) => {
        // set form data from receipt component
        const name = formData.get('name');
        const amount = formData.get('amount');
        const category = formData.get('category');
        const currency = formData.get('currency');
        const posted = formData.get('posted'); // posted date
        const image_file = formData.get('file')

        setSelectedCurrency(currency);
        setNewExpenseData((prevData) => ({ ...prevData, name: name, amount: amount, category: category, currency: currency, posted: posted, image: image_file }));
        // console.log("Received form data from child:", file);
    };

    const [isUploadHidden, setIsUploadHidden] = useState(false);

    const updateIsUploadHidden = (newState) => {
        setIsUploadHidden(newState);
    };

    const currencySymbol = currencySymbolMap(selectedCurrency);

    return (
        <div className="expense-form">
            {isPopUpVisible && (
                <div className={`new-expense-modal ${isUploadHidden ? 'wide-form' : ''}`}>
                    <div className="modal-content">
                        <span className="close" onClick={() => setPopUpVisible(false)}>&times;</span>
                        <h2 className="new-expense-title">New Expense</h2>
                        <br></br>
                        <div className="expense-row-container">
                            <br></br>

                            {/* Expense Form */}
                            <form onSubmit={submitNewExpense}>
                                <label className="new-expense-field-label">
                                    Expense Name:
                                    <input
                                        type="text"
                                        name="name"
                                        value={newExpenseData.name}
                                        onChange={newExpenseInputChange}
                                        required
                                    />
                                </label>

                                <div className="field-pair">
                                <label className="new-expense-field-label half-width" style={{ position: 'relative' }}>
                                    Amount:
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newExpenseData.amount}
                                        onChange={newExpenseInputChange}
                                        required
                                        style={{
                                            paddingLeft: '35px',
                                            paddingRight: '10px',
                                            width: '100%',
                                            textAlign: 'left',
                                        }}
                                    />
                                    {/* currency symbol */}
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '15px',
                                            top: '70%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        {currencySymbol}
                                    </span>
                                    </label>

                                    <label className="new-expense-field-label half-width">
                                        Currency:
                                        <select
                                            name="currency"
                                            value={selectedCurrency}
                                            onChange={(e) => {
                                                setSelectedCurrency(e.target.value); // Update selected currency state
                                                newExpenseInputChange(e); // Call your input change handler
                                            }}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select Currency
                                            </option>

                                            {/* Display the selected currency at the top if it exists and it's not USD */}
                                            {selectedCurrency && selectedCurrency !== "USD" && (
                                                <option value={selectedCurrency}>{selectedCurrency}</option>
                                            )}

                                            {/* Recommended currencies section */}
                                            {otherCurrencies
                                                .filter(code => code !== selectedCurrency) // Exclude selected currency
                                                .length > 0 && (
                                                    <optgroup label="Recommended">
                                                        {otherCurrencies
                                                            .filter(code => code !== selectedCurrency) // Exclude selected currency
                                                            .map((code, index) => (
                                                                <option key={`other-${index}`} value={code}>{code}</option>
                                                            ))}
                                                    </optgroup>
                                                )}

                                            {/* Always place USD after other currencies */}
                                            <optgroup label="Other">
                                                <option value="USD">USD</option>

                                                {/* Display remaining currency codes, excluding selectedCurrency and other currencies */}
                                                {currencyCodes
                                                    .filter(code => code !== selectedCurrency && code !== "USD" && !otherCurrencies.includes(code))
                                                    .map((code) => (
                                                        <option key={code} value={code}>{code}</option>
                                                    ))}
                                            </optgroup>
                                        </select>
                                    </label>

                                </div>

                                <div className="field-pair">
                                    <label className="new-expense-field-label half-width">
                                        Category:
                                        <select
                                            name="category"
                                            value={newExpenseData.category}
                                            onChange={newExpenseInputChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {expenseCategories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="new-expense-field-label half-width">
                                        Date:
                                        <input
                                            type="date"
                                            name="posted"
                                            value={newExpenseData.posted}
                                            onChange={newExpenseInputChange}
                                            required
                                        />
                                    </label>
                                </div>

                                <label className="new-expense-field-label">
                                    Notes:
                                    <input
                                        type="text"
                                        name="notes"
                                        value={newExpenseData.notes}
                                        onChange={newExpenseInputChange}
                                    />
                                </label>
                                <button type="submit" className="submit-new-expense-button">Create</button>
                            </form>
                            <div className="upload-section">
                                <ReceiptImageComponent tripId={tripId} handleFormData={handleFormData} updateIsUploadHidden={updateIsUploadHidden} />
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseFormComponent;
