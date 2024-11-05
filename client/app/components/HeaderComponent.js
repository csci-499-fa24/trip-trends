import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../img/newlogo.png';
import '../globals.css';
import '../css/header.css'
import useHeader from '../hooks/useHeader';
import HomeCurrencyPopupComponent from './homepage/HomeCurrencyPopupComponent';

// const HeaderComponent = ({ headerTitle, profileImageUrl, toggleProfileDropdown, profileDropdownVisible, handleLogout, handleChangeDisplayName }) => {
const HeaderComponent = ({ headerTitle, setUserName, userId }) => {
    const {
        profileImageUrl,
        profileDropdownVisible,
        toggleProfileDropdown,
        handleLogout,
        handleChangeDisplayName,
    } = useHeader(userId, setUserName);

    const [currencyPopupVisible, setCurrencyPopupVisible] = useState(false);
    const openCurrencyPopup = () => setCurrencyPopupVisible(true);
    const closeCurrencyPopup = () => setCurrencyPopupVisible(false);

    return (
        <header className="header">
            {/* Logo on left */}
            <div onClick={() => window.location.href = '/homepage'}>
                <div className="logo-container">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={120} 
                        height={120}
                        priority
                    />
                </div>
            </div>
            <div className="header-title">
                {headerTitle}
            </div>
            {/* Profile icon on right*/}
            <div className="profile-container">
                {profileImageUrl? (
                    <Image
                        className="profile-icon"
                        src={profileImageUrl} // User's Google profile image
                        alt="Profile"
                        width={60}
                        height={60}
                        onClick={toggleProfileDropdown} // Toggle dropdown on click
                    />
                ) : (
                    // default profile icon while loading
                    <Image
                        className="profile-icon"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" // User's Google profile image
                        alt="Profile"
                        width={60}
                        height={60}
                        onClick={toggleProfileDropdown} // Toggle dropdown on click
                    />
                )}
                {profileDropdownVisible && (
                    <div className="dropdown">
                        <div className="dropdown-item" onClick={handleLogout}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                            Logout
                        </div>
                        <div className="dropdown-item" onClick={handleChangeDisplayName}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            Change Name
                        </div>
                        {/* Currency selection button */}
                        <div className="dropdown-item" onClick={openCurrencyPopup}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                                Select Home Currency
                        </div>
                    </div>
                )}
                
            </div>
            <HomeCurrencyPopupComponent isOpen={currencyPopupVisible} onClose={closeCurrencyPopup} userId={userId} />
        </header>
    );
};  

export default HeaderComponent;