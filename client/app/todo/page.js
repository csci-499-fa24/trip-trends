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
                    toast.success("Successful added a new item to your list!");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
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
                    toast.success("Successful added a new item to your list!");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
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
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                    </svg>
                    <span className="icon-text">Back</span>
                </div>
            </div>

            <div className='list-container'>
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
                        <h3>Your Purchase List</h3>
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
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
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
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
                        <h3>Your Sightseeing List</h3>
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
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                                    </svg>
                                                                    <span className="icon-text">Edit Item</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    disablePadding sx={{ width: "28vw", alignItems: 'center', justifyContent: 'center' }}>
                                                    <div className="icon-div" tooltip="Delete Item" tabIndex="0">
                                                        <div className="icon-SVG">
                                                            <div onClick={() => deleteItem(item)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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