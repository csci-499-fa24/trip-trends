'use client';

import React, { useEffect, useState } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import NavBarComponent from '../components/singletrip/NavBarComponent';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import '../css/todolist.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

function TodoList() {
    const [tripId, setTripId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [tripName, setTripName] = useState('');
    const isOwner = userRole === 'owner';
    const [checked, setChecked] = React.useState([]);
    const [purchaseList, setPurchaseList] = useState([]);
    const [sightseeingList, setSightseeingList] = useState([]);
    const [newPurchaseItem, setNewPurchaseItem] = useState("");
    const [newSightItem, setNewSightItem] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [updatedName, setUpdatedName] = useState("");

    const handleToggle = (item) => () => {
        const currentIndex = checked.indexOf(item.list_id);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(item.list_id);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);

        const completion = {
            isCompleted: (currentIndex === -1)
        }
        axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/update-completion/${tripId}/${item.list_id}`, completion)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                console.error('Error updating item completion:', error);
            });
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

    const handlePurchaseInputChange = (event) => {
        setNewPurchaseItem(event.target.value);
    };

    const handleSightInputChange = (event) => {
        setNewSightItem(event.target.value);
    };

    const handleAddPurchaseItemClick = () => {
        if (newPurchaseItem === "") {
            toast.error("Please enter what you'd like to add to your list.")
        } else {
            console.log("Calling Purchase API with ", newPurchaseItem);
            const itemBody = {
                name: newPurchaseItem,
                list_type: "purchase",
                is_completed: false
            }

            axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/create-item/${tripId}`, itemBody)
                .then(response => {
                    console.log(response.data)
                    toast.success("Successfully added a new item to your list!");
                    setPurchaseList(prevList => [...prevList, response.data.data]);
                    setNewPurchaseItem("");
                })
                .catch(error => {
                    console.error('Error posting new purchase item:', error);
                });
        }
    };

    const handleAddSightItemClick = () => {
        if (newSightItem === "") {
            toast.error("Please enter what you'd like to add to your list.")
        } else {
            console.log("Calling Sight API with ", newSightItem);
            const itemBody = {
                name: newSightItem,
                list_type: "sightseeing",
                is_completed: false
            }

            axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/create-item/${tripId}`, itemBody)
                .then(response => {
                    console.log(response.data)
                    toast.success("Successfully added a new item to your list!");
                    setSightseeingList(prevList => [...prevList, response.data.data]);
                    setNewSightItem("");
                })
                .catch(error => {
                    console.error('Error posting new sight item:', error);
                });
        }
    };

    const deleteItem = (item) => {
        console.log("CLICKED HERE")
        console.log(item)

        axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/delete-item/${item.trip_id}/${item.list_id}`)
            .then(response => {
                console.log(response.data)
                toast.success("Successful removed an item from your list!");
                if (item.list_type === "sightseeing") {
                    setSightseeingList(prevList => prevList.filter(sightItem => sightItem.list_id !== item.list_id));
                }
                else {
                    setPurchaseList(prevList => prevList.filter(purchaseItem => purchaseItem.list_id !== item.list_id));
                }
            })
            .catch(error => {
                console.error('Error posting new sight item:', error);
            });
    }

    const openEditModal = (item) => {
        setCurrentItem(item);
        setUpdatedName(item.name);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setUpdatedName("");
    };

    const handleUpdateItem = () => {
        if (updatedName === "") {
            toast.error("Please enter a new name for the item.");
        }
        else {
            const updatedItem = { ...currentItem, name: updatedName };

            console.log("SETTING ITEM: ", updatedItem);

            const itemBody = {
                name: updatedItem.name
            }

            axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/lists/update-name/${tripId}/${updatedItem.list_id}/`, itemBody)
                .then(response => {
                    console.log(response);
                    toast.success("Item name updated successfully!");
                    if (updatedItem.list_type === "sightseeing") {
                        setSightseeingList(prevList => prevList.map(item =>
                            item.list_id === updatedItem.list_id ? { ...item, name: updatedName } : item
                        ));
                    }
                    else {
                        setPurchaseList(prevList => prevList.map(item =>
                            item.list_id === updatedItem.list_id ? { ...item, name: updatedName } : item
                        ));
                    }
                    closeEditModal();
                })
                .catch(error => {
                    console.error('Error updating item name:', error);
                });
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

        const fetchTripName = () => {
            if (tripId) {
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}`)
                    .then(response => {
                        setTripName(`${response.data.data.name}`);
                    })
                    .catch(error => {
                        console.error('Error fetching trip data:', error);
                    })
            }
        };

        getUserId();
        fetchUserName();
        fetchTripName()
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (tripId && userId) {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shared-trips/trips/${tripId}`);
                    const sharedTrips = response.data.data;
                    const userRole = sharedTrips.find(trip => trip.user_id === userId)?.role;
                    if (userRole) {
                        setUserRole(userRole);
                    } else {
                        console.log("User does not have a role for this trip.");
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    // setError('Error fetching user role. Please try again later.');
                }
            } else {
                console.log("tripId or userId is missing.");
            }
        };
        fetchUserRole();

    }, [tripId]);

    return (
        <div className='container'>
            <HeaderComponent
                headerTitle="To-Do List"
                setUserName={setUserName}
                userId={userId}
            />
          
            <NavBarComponent tripId={tripId} userRole={userRole} tripName={tripName} pointerDisabled={true} />
            <div className='whole-todo-list-container'>
            <div className='list-container' style={{ marginTop: '25px' }}>
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="col list-display" style={{ flex: 1 }}>
                        {/* Add Purchase Item */}
                        <div className='add-list-item' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box
                                component="form"
                                sx={{ '& .MuiTextField-root': { m: 1, width: '29ch' } }}
                                noValidate
                                autoComplete="off"
                            >
                                <div>
                                    <TextField
                                        id="outlined-required"
                                        label="New Purchase Item"
                                        value={newPurchaseItem}
                                        onChange={handlePurchaseInputChange}
                                    />
                                </div>
                            </Box>
                            <div className="icon-div" tooltip="Add Item" tabIndex="0" onClick={handleAddPurchaseItemClick}>
                                <div className="icon-SVG">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span className="icon-text">Add Item</span>
                                </div>
                            </div>
                        </div>
                        <br></br>
                        {/* Purchase List */}
                        <h3>Purchase List</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                {purchaseList.length === 0 ? (
                                    <ListItem>
                                        <ListItemText sx={{ textAlign: 'center' }} primary="Add some items to your list!" />
                                    </ListItem>
                                ) : (
                                    purchaseList.map((item) => {
                                        const labelId = `checkbox-list-label-${item.list_id}`;
                                        return (
                                            <ListItem key={item.list_id}
                                                secondaryAction={
                                                    <div className="icon-div" tooltip="Edit Item" tabIndex="0">
                                                        <div className="icon-SVG">
                                                            <div onClick={() => openEditModal(item)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                                </svg>
                                                                <span className="icon-text">Edit Item</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                disablePadding>
                                                <div className="icon-div" tooltip="Delete Item" tabIndex="0">
                                                    <div className="icon-SVG">
                                                        <div onClick={() => deleteItem(item)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                            </svg>
                                                            <span className="icon-text">Delete Item</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ListItemButton role={undefined} onClick={handleToggle(item)} dense>
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
                                    })
                                )}
                            </List>
                        </div>
                    </div>
                    <div className="col list-display" style={{ flex: 1 }}>
                        {/* Add Sight Seeing Item */}
                        <div className='add-list-item' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box
                                component="form"
                                sx={{ '& .MuiTextField-root': { m: 1, width: '29ch' } }}
                                noValidate
                                autoComplete="off"
                            >
                                <div>
                                    <TextField
                                        id="outlined-required"
                                        label="New Sightsee Item"
                                        value={newSightItem}
                                        onChange={handleSightInputChange}
                                    />
                                </div>
                            </Box>
                            <div className="icon-div" tooltip="Add Item" tabIndex="0" onClick={handleAddSightItemClick}>
                                <div className="icon-SVG">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span className="icon-text">Add Item</span>
                                </div>
                            </div>
                        </div>
                        <br></br>
                        {/* Sightseeing List */}
                        <h3>Sightseeing List</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                {
                                    sightseeingList.length === 0 ? (
                                        <ListItem>
                                            <ListItemText sx={{ textAlign: 'center' }} primary="Add some items to your list!" />
                                        </ListItem>
                                    ) : (
                                        sightseeingList.map((item) => {
                                            const labelId = `checkbox-list-label-${item.list_id}`;
                                            return (
                                                <ListItem key={item.list_id}
                                                    secondaryAction={
                                                        <div className="icon-div" tooltip="Edit Item" tabIndex="0">
                                                            <div className="icon-SVG">
                                                                <div onClick={() => openEditModal(item)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                                    </svg>
                                                                    <span className="icon-text">Edit Item</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    disablePadding sx={{ width: "115%", alignItems: 'center', justifyContent: 'center' }}>
                                                    <div className="icon-div" tooltip="Delete Item" tabIndex="0">
                                                        <div className="icon-SVG">
                                                            <div onClick={() => deleteItem(item)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                                <span className="icon-text">Delete Item</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ListItemButton role={undefined} onClick={handleToggle(item)} dense>
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
                                        })
                                    )}
                            </List>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <br></br>
            <br></br>

            <Dialog open={editModalOpen} onClose={closeEditModal}
                sx={{
                    '& .MuiDialog-paper': {
                        width: '500px',
                    }
                }}>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Item Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={updatedName}
                        onChange={(e) => setUpdatedName(e.target.value)}
                        sx={{ justifyContent: 'center' }}
                    />
                </DialogContent>
                <DialogActions style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button onClick={closeEditModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateItem} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default TodoList;
