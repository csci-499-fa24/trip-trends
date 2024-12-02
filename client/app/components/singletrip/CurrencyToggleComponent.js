// CurrencyToggle
import React, { useState, useEffect } from "react";
import Switch from "react-switch";
import "../../css/navbar.css";

const CurrencyToggleComponent = ({ homeCurrency, otherCurrencies, toggleChange }) => {
  const [selectedToggleCurrency, setSelectedToggleCurrency] = useState("");
  const allCurrencies = [...new Set([homeCurrency, ...otherCurrencies].filter(Boolean))]; // unique currencies that removes undefined values

  const handleToggle = (currency) => {
    const newCurrency = selectedToggleCurrency === currency ? "" : currency; // if currency is already selected, allow unchecking it to reset
    setSelectedToggleCurrency(newCurrency); 

    if (newCurrency === "") {
        // check if all toggles are in the off state
        const allUnchecked = allCurrencies.every(
          (curr) => curr !== selectedToggleCurrency
        );
        if (allUnchecked) {
          setSelectedToggleCurrency(""); // reset to empty currency
        }
      }
  
      toggleChange(newCurrency); // inform parent (single trip) of the toggle change
  };

  return (
    <div
    className="currency-toggle"
    style={{
        position: "absolute",
        right: "5%",
        display: "flex",
        gap: "5px",
        padding: "0px", 
        flexWrap: "wrap",
        marginBottom: "10px",
        marginTop: "15px"
    }}
    >
      {allCurrencies.map((currency) => (
        <div
          key={currency}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
            marginRight: "10px",
          }}
        >
          <Switch
            onChange={() => handleToggle(currency)}
            checked={selectedToggleCurrency === currency} // on state if that currency is selected
            offColor="#f0f0f0"
            onColor="#4CAF50"
            offHandleColor="#ccc"
            onHandleColor="#fff"
            uncheckedIcon={false}
            checkedIcon={false}
            height={20}
            width={48}
          />
          <span style={{ marginLeft: "10px" }}>{currency}</span>
        </div>
      ))}
    </div>
  );
};

export default CurrencyToggleComponent;
