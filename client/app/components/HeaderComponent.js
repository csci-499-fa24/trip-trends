import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../img/newlogo.png';
import '../globals.css';
import useHeader from '../hooks/useHeader';

// const HeaderComponent = ({ headerTitle, profileImageUrl, toggleProfileDropdown, profileDropdownVisible, handleLogout, handleChangeDisplayName }) => {
const HeaderComponent = ({ headerTitle, setUserName, userId }) => {
    const {
        profileImageUrl,
        profileDropdownVisible,
        toggleProfileDropdown,
        handleLogout,
        handleChangeDisplayName,
    } = useHeader(userId, setUserName);

    return (
        <header className="header">
            {/* Logo on left */}
            <Link href="/homepage">
                <div className="logo-container">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={120} 
                        height={120}
                    />
                </div>
            </Link>
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
                </div>
            )}

            </div>
        </header>
    );
};  

export default HeaderComponent;