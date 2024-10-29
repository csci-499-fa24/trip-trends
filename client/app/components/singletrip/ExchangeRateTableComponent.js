import React, { useState } from 'react';
import axios from 'axios';

const ExchangeRateTableComponent = ({ exchangeRates, currencyCodes, homeCurrency }) => {
    const [customCurrency, setCustomCurrency] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);

    const handleCurrencyChange = async (e) => {
        const currency = e.target.value;
        setCustomCurrency(currency);

        // Fetch the exchange rate relative to homeCurrency
        try {
            const response = await axios.get(`https://hexarate.paikama.co/api/rates/latest/${homeCurrency}`, {
                params: {
                    target: currency
                }
            });

            if (response.data && response.data.data.mid) {
                setExchangeRate(response.data.data.mid);
            } else {
                console.error("Invalid response format from the API");
            }
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
        }
    };

    return (
        <div className="exchange-rates-container">
            <table className="exchange-rates-table">
                <thead>
                    <tr>
                        <th>Currency</th>
                        <th>Rate (Relative to {homeCurrency})</th> {/* Updated header */}</tr>
                </thead>
                <tbody>
                    {Object.keys(exchangeRates).map((currency) => (
                        <tr key={currency}>
                            <td>{currency}</td>
                            <td>{exchangeRates[currency]}</td></tr>
                    ))}
                    {/* Last row for dropdown selection and its rate */}
                    <tr>
                        <td className="exchange-table-dropdown">
                            {/* Dropdown for currency codes */}
                            <label htmlFor="currency-select"></label>
                            <select
                                id="currency-select"
                                value={customCurrency}
                                onChange={handleCurrencyChange}
                            >
                                <option value="">Select Currency</option>
                                {currencyCodes.map((code) => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>{exchangeRate !== null ? exchangeRate : 'N/A'}</td></tr>
                </tbody>
            </table>
        </div>
    );
};

export default ExchangeRateTableComponent;