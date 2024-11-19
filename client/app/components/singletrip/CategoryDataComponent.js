import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';
import currencySymbolMap from 'currency-symbol-map';

// Register Chart.js components
ChartJS.register(Tooltip, Legend, ArcElement);

const CategoryDataComponent = ({ categoryData, currency }) => {
    const currencySymbol = currencySymbolMap(currency);

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = ` Total in ${currency}` || '';
                        const value = context.raw || '';
                        return `${label}: ${currencySymbol}${value}`;
                    },
                },
            },
        },
    };

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
