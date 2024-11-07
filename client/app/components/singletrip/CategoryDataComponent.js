import React from 'react';
import { Pie } from 'react-chartjs-2';

const CategoryDataComponent = ({ categoryData }) => {
    return (
        <div>
             <p id='expenseTitle'>Expenses by Category</p>
            {categoryData && categoryData.datasets && categoryData.datasets.length > 0 ? (
                <div className="pie-chart-container">
                    <Pie data={categoryData} />
                </div>
            ) : (
                <p>No expense data available to display.</p>
            )}
        </div>
    );
};

export default CategoryDataComponent;
