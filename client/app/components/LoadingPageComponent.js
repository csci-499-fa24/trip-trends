import React from 'react';
import '../css/loading.css';
import logo from '../img/Logo.png';

const LoadingPageComponent = ({ height = 'auto' }) => {
    return (
    <div className="loading-container">
      {/* <img src={logo} alt="Loading Logo" className="loading-logo" /> */}
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingPageComponent;