import React from 'react';
import ReactSpeedometer, { Transition } from 'react-d3-speedometer';

const BudgetMeterComponent = ({ tripData, expenseData, totalUSDExpenses}) => {
    return(
        <div>
            <p id='budgetTitle'>Your Budget Meter:</p>
            {expenseData && expenseData.data && totalUSDExpenses === 0 ? (
                <p>Loading your budget data...</p>
            ) : totalUSDExpenses > tripData.data.budget ? (
                <div style={{
                    marginTop: "10px",
                    width: "350px",
                    height: "200px",
                    marginLeft: "50px"
                }}>
                    <ReactSpeedometer
                        width={300}
                        minValue={0}
                        maxValue={tripData.data.budget}
                        value={tripData.data.budget}
                        needleColor="steelblue"
                        needleTransitionDuration={2500}
                        needleTransition={Transition.easeBounceOut}
                        segments={4}
                        segmentColors={["#a3be8c", "#ebcb8b", "#d08770", "#bf616a"]}
                    />
                </div>
            ) : (
                <div style={{
                    marginTop: "10px",
                    width: "350px",
                    height: "200px",
                    marginLeft: "50px",
                }}>
                    <ReactSpeedometer
                        width={300}
                        minValue={0}
                        maxValue={tripData.data.budget}
                        value={totalUSDExpenses.toFixed(2)}
                        needleColor="steelblue"
                        needleTransitionDuration={2500}
                        needleTransition={Transition.easeBounceOut}
                        segments={4}
                        segmentColors={["#a3be8c", "#ebcb8b", "#d08770", "#bf616a"]}
                    />
                </div>
            )}
            <p id='budgetTitle'>Your Budget Data:</p>
            {expenseData && expenseData.data && totalUSDExpenses === 0 ? (
                <p>Loading your budget data...</p>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ textDecoration: "underline", display: "inline" }}>Total Expenses in USD:</p>
                    <span>  ${totalUSDExpenses.toFixed(2)}</span>
                    {totalUSDExpenses > tripData.data.budget ? (
                        <p id='budget-text'>You are <strong>${(totalUSDExpenses - tripData.data.budget).toFixed(2)}</strong> over your budget.</p>
                    ) : (
                        <p>You are within your budget.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BudgetMeterComponent;