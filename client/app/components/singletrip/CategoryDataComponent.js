import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';
import currencySymbolMap from 'currency-symbol-map';
import LoadingPageComponent from '../LoadingPageComponent';


// Register Chart.js components
ChartJS.register(Tooltip, Legend, ArcElement);

const CategoryDataComponent = ({ categoryData, currency }) => {
    const currencySymbol = currencySymbolMap(currency);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        if (categoryData.datasets.length == 0) {
            setLoading(false);
        }
        if (categoryData && categoryData.datasets.length > 0) {
            setLoading(false); 
        }
    }, [categoryData]);

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = ` Total in ${currency}` || '';
                        const value = context.raw.toFixed(2) || '';
                        return `${label}: ${currencySymbol}${value}`;
                    },
                },
            },
        },
    };

    if (loading) {
        return <LoadingPageComponent />;
    }

    return (
        <div>
            <p id="expenseTitle">Expenses by Category</p>
            {categoryData && categoryData.datasets && categoryData.datasets.length > 0 ? (
                <div className="pie-chart-container">
                    <Pie data={categoryData} options={options} />
                </div>
            ) : (
                <p>No expense data available to display.</p>
            )}
        </div>
    );
};

export default CategoryDataComponent;
