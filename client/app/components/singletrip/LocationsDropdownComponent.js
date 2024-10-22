import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/dropdown.css'

const LocationsDropdownComponent = ({ tripLocations }) => {
    return (
        <div className='dropdown-container'>
            <div className='row'>
                <div className='col'>
                    <div className="btn-group" style={{ marginBottom: "0" }}>
                        <button
                            type="button"
                            className="btn dropdown-button dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                            Trip Locations
                        </button>
                        <div className="dropdown-menu">
                            {tripLocations.map((location, index) => (
                                <div key={index} className="dropdown-item">
                                    {location}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationsDropdownComponent;