import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomeCurrencyPopupComponent = ({ isOpen, onClose, userId }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [currencies, setCurrencies] = useState([]);

    const fetchCurrencies = async () => {
        try {
            const response = await axios.get(
                `https://data.fixer.io/api/symbols?access_key=${process.env.NEXT_PUBLIC_FIXER_KEY}`
            );
            const currencyCodes = Object.keys(response.data.symbols); // Assuming symbols are in this format
            setCurrencies(currencyCodes);
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCurrencies();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newUserData = { home_currency: selectedCurrency }; // Ensure this structure
    
        try {
            // Call the updateUser API
            const response = await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`, newUserData);
            console.log('Home currency updated successfully:', response.data);
            onClose(); // Close the popup after selecting
        } catch (error) {
            console.error('Error updating home currency:', error);
            // You can also inspect the error response for more details
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
        }
    };    

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Select Your Home Currency</h2>
                    <form onSubmit={handleSubmit}>
                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            required
                        >
                            <option value="">Select Currency</option>
                            {currencies.map((currency, index) => (
                                <option key={index} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={onClose}>Close</button>
                    </form>
                </div>
            </div>
        )
    );
};

export default HomeCurrencyPopupComponent;
