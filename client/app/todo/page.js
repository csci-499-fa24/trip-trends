'use client';

import React, { useEffect, useState } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import '../css/todolist.css';

function TodoList() {
    const [tripId, setTripId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const [checked, setChecked] = React.useState([]);
    const [purchaseList, setPurchaseList] = useState([]);
    const [sightseeingList, setSightseeingList] = useState([]);

    const handleToggle = (list_id) => () => {
        const currentIndex = checked.indexOf(list_id);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(list_id);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const getUserId = () => {
        const user_id = localStorage.getItem("user_id");
        if (user_id) {
            setUserId(user_id);
        } else {
            console.error("User ID not found.");
        }
    }

    const fetchUserName = async () => {
        const userId = localStorage.getItem("user_id");
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userId}`);
            if (response.data && response.data.data) {
                const userData = response.data.data;
                setUserName(userData.fname);
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('tripId');
        setTripId(tripId);

        if (tripId) {
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/get-purchaseList/${tripId}`)
                .then(response => {
                    console.log(response.data)
                    setPurchaseList(response.data.data);
                    const initialChecked = response.data.data
                        .filter((item) => item.is_completed)
                        .map((item) => item.list_id);
                    setChecked((prevChecked) => [...prevChecked, ...initialChecked]);
                })
                .catch(error => {
                    console.error('Error fetching purchase list data:', error);
                });

            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/get-sightseeingList/${tripId}`)
                .then(response => {
                    console.log(response.data)
                    setSightseeingList(response.data.data);
                    const initialChecked = response.data.data
                        .filter((item) => item.is_completed)
                        .map((item) => item.list_id);
                    setChecked((prevChecked) => [...prevChecked, ...initialChecked]);
                })
                .catch(error => {
                    console.error('Error fetching purchase list data:', error);
                });
        }

        getUserId();
        fetchUserName();
    }, []);

    return (
        <div className='container'>
            <HeaderComponent
                headerTitle="To-Do List"
                setUserName={setUserName}
                userId={userId}
            />
            <div className="icon-div" onClick={() => window.location.href = `/singletrip?tripId=${tripId}`} tooltip="Back" tabIndex="0" style={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}>
                <div className="icon-SVG">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                    </svg>
                </div>
                <span className="icon-text">Back</span>
            </div>
            
            <div className='list-container'>
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="col" style={{ flex: 1, marginRight: '20px' }}>
                        <h3>Your Purchase List</h3>
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            {purchaseList.map((item) => {
                                const labelId = `checkbox-list-label-${item.list_id}`;
                                return (
                                    <ListItem key={item.list_id} disablePadding>
                                        <ListItemButton role={undefined} onClick={handleToggle(item.list_id)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={checked.includes(item.list_id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText id={labelId} primary={item.name} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </div>

                    <div className="col" style={{ flex: 1 }}>
                        <h3>Your Sightseeing List</h3>
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            {sightseeingList.map((item) => {
                                const labelId = `checkbox-list-label-${item.list_id}`;
                                return (
                                    <ListItem key={item.list_id} disablePadding>
                                        <ListItemButton role={undefined} onClick={handleToggle(item.list_id)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={checked.includes(item.list_id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText id={labelId} primary={item.name} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TodoList;