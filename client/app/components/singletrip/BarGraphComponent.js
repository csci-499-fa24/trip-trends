// BarGraph
import React, { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';
import currencySymbolMap from 'currency-symbol-map';
import LoadingPageComponent from '../LoadingPageComponent';
import { load } from 'ol/Image';
import "../../css/barChart.css";

const BarGraphComponent = ({ tripData, expensesToDisplay, categoryData, currency }) => {
    const [loading, setLoading] = React.useState(true);
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoadingTimedOut(true); 
            }
        }, 5000); // 5 seconds

        return () => clearTimeout(timeoutId);
    }, [loading]);

    useEffect(() => {
        if (categoryData.datasets.length == 0) {
            setLoading(false);
        }
        if (expensesToDisplay && categoryData && categoryData.datasets.length > 0) {
            setLoading(false); 
        }
    }, [expensesToDisplay, categoryData]);

    const currencySymbol = currencySymbolMap(currency);

    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(
            new Date(year, month - 1, day)
        );
        
        return formattedDate;
    }

    const generateDateArray = (startDate, endDate) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const datesArray = [];

        // loop through the dates from the start to the end date and add each date in between (inclusive)
        for (let date = start; date.isBefore(end.add(1, 'day')); date = date.add(1, 'day')) {
            datesArray.push(formatDate(date.format('YYYY-MM-DD')));
        }

        return datesArray;
    };

    const tripDates = generateDateArray(tripData.data.start_date, tripData.data.end_date);
    const allExpenseDates = new Set(tripDates); // Make a set of the unique expense dates in case there's outlying expenses

    // put together all the total expenses for each category for each day
    const expensesByCategory = {};
    // make 3 different stacks with 3 categories each
    const categoryStackMap = {
        'Phone/Internet': 'essential',
        'Health/Safety': 'essential',
        'Food/Drink': 'essential',
        'Flights': 'travel',
        'Accommodations': 'travel',
        'Transport': 'travel',
        'Activities': 'leisure',
        'Shopping': 'leisure',
        'Other': 'leisure',
    };
    expensesToDisplay.forEach(expense => {
        const date = formatDate(dayjs(expense.posted).format('YYYY-MM-DD'));
        const category = expense.category;
        const amount = parseFloat(expense.amount);

        // Initialize if the date doesn't exist
        if (!expensesByCategory[date]) {
            expensesByCategory[date] = {};
        }

        // Initialize the category for the date
        if (!expensesByCategory[date][category]) {
            expensesByCategory[date][category] = 0;
        }

        // Accumulate the amount for that category on that date
        expensesByCategory[date][category] += amount;
        allExpenseDates.add(date); // Add to set of unique dates
    });

    // create the data series for the bar graph so there are arrays for each category
    // and the indices are the total of that category on a particular day
    const series = categoryData.labels.map((category) => {
        const categoryDataPoints = [];
        const sortedDates = Array.from(allExpenseDates).sort((a, b) => new Date(a) - new Date(b));

        sortedDates.forEach(date => {
            const amount = expensesByCategory[date]?.[category] || 0;
            // categoryDataPoints.push(`${currencySymbol}${amount.toFixed(2)}`);
            categoryDataPoints.push(amount.toFixed(2));
        });

        return {
            id: category,
            label: category,
            data: categoryDataPoints,
            stack: categoryStackMap[category],
        };
    });
    
    const chartColors = categoryData?.datasets?.[0]?.backgroundColor || ['#000'];

    if (loading && !loadingTimedOut) {
        return <LoadingPageComponent />;
    }

    if (loadingTimedOut && (expensesToDisplay?.length === 0 || !categoryData?.datasets?.length)) {
        return (
            <div>
                <p id="budgetTitle">Daily Expenses by Category</p>
                <p>No expense data available to display.</p>
            </div>
        );
    }

    return (
        <div className="bar-chart-container">
            <h3 style={{ textAlign: "center" }}>Daily Expenses by Category</h3>
            <BarChart
                xAxis={[{ scaleType: 'band', data: Array.from(allExpenseDates).sort() }]}
                series={series}
                // minWidth={1000}
                height={300}
                colors={chartColors}
                slotProps={{
                    legend: {
                        label: {
                            style: {
                                fontSize: '10px',
                                fontWeight: 'normal',
                            }
                        }
                    }
                }}
                style={{
                    maxWidth: '100%', 
                    display: 'block',
                }}
            />
        </div>
    );
};

export default BarGraphComponent;