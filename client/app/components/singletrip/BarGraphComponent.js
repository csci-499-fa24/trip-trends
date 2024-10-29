import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';

const BarGraphComponent = ({ tripData, expenseData, categoryData }) => {
    if (!tripData || !expenseData || !categoryData || expenseData.length === 0 || categoryData.labels.length === 0) {
        return <div>No expense data available to display....</div>;
    }

    // console.log(expenseData)

    const generateDateArray = (startDate, endDate) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const datesArray = [];

        // loop through the dates from the start to the end date and add each date in between (inclusive)
        for (let date = start; date.isBefore(end.add(1, 'day')); date = date.add(1, 'day')) {
            datesArray.push(date.format('YYYY-MM-DD'));
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
    expenseData.forEach(expense => {
        const date = dayjs(expense.posted).format('YYYY-MM-DD');
        const category = expense.category;
        const amount = parseFloat(expense.amountInHomeCurrency);

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
            categoryDataPoints.push(amount);
        });

        return {
            id: category,
            label: category,
            data: categoryDataPoints,
            stack: categoryStackMap[category],
        };
    });

    // console.log("EBC: ", expensesByCategory)
    // console.log("Series: ", series)

    return (
        <div>
            <h3 style={{ textAlign: "center" }}>Daily Expenses by Category</h3>
            <BarChart
                xAxis={[{ scaleType: 'band', data: Array.from(allExpenseDates).sort() }]}
                series={series}
                width={1050}
                height={300}
                colors={categoryData.datasets[0].backgroundColor}
            />
        </div>
    );
};

export default BarGraphComponent;