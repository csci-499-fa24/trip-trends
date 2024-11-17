import React, { useState, useEffect } from "react";
import Switch from "react-switch";

const CurrencyToggleComponent = ({ homeCurrency, otherCurrencies }) => {
  const [selectedToggleCurrency, setSelectedToggleCurrency] = useState(homeCurrency);

  // defaulted toggle switch to home currency
  useEffect(() => {
    setSelectedToggleCurrency(homeCurrency);
  }, [homeCurrency]);

  const allCurrencies = [homeCurrency, ...otherCurrencies];

  const handleToggle = (currency) => {
    setSelectedToggleCurrency(currency);
  };

  return (
    <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      padding: "10px",
      width: "100%",
      marginRight: "20px"
    }}>
      {allCurrencies.length > 2 ? (
        // each currency has its own toggle switch
        allCurrencies.map((currency) => (
          <div key={currency} style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "10px", 
              marginRight: "10px",}}>
            <Switch
              onChange={() => handleToggle(currency)}
              checked={selectedToggleCurrency === currency} // the currency checked
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
        ))
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>

            {allCurrencies.length > 1 && (
                <>
                    {/* currency on the left (home currency) */}
                    <span style={{ marginRight: "10px" }}>{allCurrencies[0]}</span>

                    {/* Currency Switch */}
                    <Switch
                        onChange={() =>
                            handleToggle(
                                selectedToggleCurrency === allCurrencies[0]
                                    ? allCurrencies[1] // if home currency is selected, toggle to the other currency
                                    : allCurrencies[0]  // toggle back to home currency
                            )
                        }
                        checked={selectedToggleCurrency !== allCurrencies[0]} // checked means the selected currency is not home currency
                        offColor="#f0f0f0"
                        onColor="#4CAF50"
                        offHandleColor="#ccc"
                        onHandleColor="#fff"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={48}
                    />

                    {/* Currency on the right (Other Currency) */}
                    <span style={{ marginLeft: "10px" }}>{allCurrencies[1]}</span>
                </>
            )}
        </div>


        )}
    </div>
  );
};

export default CurrencyToggleComponent;
