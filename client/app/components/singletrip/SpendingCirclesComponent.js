import React from 'react';
import currencySymbolMap from 'currency-symbol-map';

const SpendingCirclesComponent = ({ totalExpenses, tripData, convertedBudget, currency }) => {
    const startDate = new Date(tripData.data.start_date);
    const endDate = new Date(tripData.data.end_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const avgDailySpending = totalDays > 0 ? (totalExpenses / totalDays).toFixed(2) : 0;
    const totalSpending = totalExpenses.toFixed(2);
    const remainingDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    const forecastedSpending = remainingDays > 0 ? (avgDailySpending * remainingDays).toFixed(2) : 0;
    const exceedsBudget = totalExpenses > convertedBudget;
    const currencySymbol = currencySymbolMap(currency);

    return (
        <div className="spending-circles-container">
            <div className="circle-card">
                <div className="circle-card-spending">{currencySymbol}{avgDailySpending}</div>
                <p>Avg. Daily Spending</p>
            </div>
            <div className={`circle-card ${exceedsBudget ? 'above-budget' : 'below-budget'}`}>
                <div className="circle-card-spending">{currencySymbol}{totalSpending}</div>
                <p>Total Spending</p>
            </div>
            <div className="circle-card">
                <div className="circle-card-spending">{currencySymbol}{forecastedSpending}</div>
                <p>Forecasted Spending</p>
            </div>
        </div>
    );
};

export default SpendingCirclesComponent;
