import React, { useState, useEffect } from 'react';
import ReactSpeedometer, { Transition } from 'react-d3-speedometer';
import currencySymbolMap from 'currency-symbol-map';
import LoadingPageComponent from '../LoadingPageComponent';

const BudgetMeterComponent = ({ tripData, convertedBudget, expensesToDisplay, totalExpenses, currency }) => {
    const currencySymbol = currencySymbolMap(currency);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!expensesToDisplay) {
            setLoading(false);
        }
        if (expensesToDisplay && convertedBudget && totalExpenses) {
            setLoading(false); 
        }
    }, [expensesToDisplay, convertedBudget, totalExpenses]);

    if (loading) {
        return <LoadingPageComponent />;
    }

    return (
        <div>
            <p id='budgetTitle'> Budget Meter</p>
            {expensesToDisplay && totalExpenses === 0 ? (
                <p>Loading your budget data...</p>
            ) : (
                <div style={{
                    marginTop: "10px",
                    width: "350px",
                    height: "200px",
                    marginLeft: "50px",
                }}>
                    <ReactSpeedometer
                        key={`${convertedBudget}-${totalExpenses}`} // to force rerender
                        width={300}
                        minValue={0}
                        maxValue={convertedBudget}
                        value={Math.min(totalExpenses, convertedBudget)} 
                        needleColor="steelblue"
                        needleTransitionDuration={2500}
                        needleTransition={Transition.easeBounceOut}
                        segments={4}
                        segmentColors={["#a3be8c", "#ebcb8b", "#d08770", "#bf616a"]}
                    />
                </div>
            )}
            {expensesToDisplay && totalExpenses === 0 ? (
                <p>Loading your budget data...</p>
            ) : (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    {totalExpenses > convertedBudget ? (
                        <p 
                            id='budget-text' 
                            style={{
                                color: '#e63946', 
                                fontSize: '0.9em', 
                                fontWeight: 'bold', 
                                animation: 'fadeIn 0.5s ease-in-out',
                                border: '2px solid #e63946',
                                borderRadius: '8px',
                                padding: '5px',
                                display: 'inline-block',
                                backgroundColor: '#ffe6e6',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                        >
                            <strong>{currencySymbol}{(totalExpenses - convertedBudget).toFixed(2)}</strong> over budget!
                        </p>
                    ) : (
                        <p 
                            style={{
                                color: '#2a9d8f', 
                                fontSize: '0.9em', 
                                fontWeight: 'bold', 
                                animation: 'fadeIn 0.5s ease-in-out',
                                border: '2px solid #2a9d8f',
                                borderRadius: '8px',
                                padding: '5px',
                                display: 'inline-block',
                                backgroundColor: '#e6f7f1',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                        >
                            Within budget!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BudgetMeterComponent;
