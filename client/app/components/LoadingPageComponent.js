import React from 'react';
import '../css/loading.css';
import logo from '../img/Logo.png';

const LoadingPageComponent = () => {
    return (
    <div className="loading-container">
      {/* <img src={logo} alt="Loading Logo" className="loading-logo" /> */}
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default LoadingPageComponent;