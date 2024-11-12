import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import stringSimilarity from 'string-similarity';
import '../../css/receiptImage.css';

const ReceiptImageComponent = ({ tripId, handleFormData, updateIsUploadHidden }) => {
    // const [uploadedExpenseId, setUploadedExpenseId] = useState(null); // for receipt img retrieval
    const fileInput = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [isHidden, setIsHidden] = useState(true); // for image upload section
    const progressBarRef = useRef(null);

    if (typeof window !== 'undefined') {
        useEffect(() => {
            if (typeof window !== 'undefined') {
              import('progressbar.js').then((ProgressBar) => {
                if (!progressBarRef.current) {
                    progressBarRef.current = new ProgressBar.Line('#progress-container', {
                        strokeWidth: 5, 
                        easing: 'easeInOut',
                        duration: 1400,
                        color: '#4CAF50',
                        trailColor: '#eee',
                        trailWidth: 1,
                        svgStyle: { 
                            width: '100%', 
                            height: '100%',
                            'stroke-linecap': 'round',
                        },
                        containerStyle: { 
                            borderRadius: '2px',
                            overflow: 'hidden',
                        },
            
                        text: {
                            style: {
                                color: '#555',
                                position: 'relative',
                                bottom: '-3px', 
                                textAlign: 'center',
                                fontSize: '14px',
                                padding: 0,
                                margin: 0,
                                transform: null,
                                width: '100%',
                            },
                            autoStyleContainer: false,
                        },
            
                        from: { color: '#81C784' }, 
                        to: { color: '#388E3C' },
            
                        step: (state, bar) => {
                            bar.setText(`${Math.round(bar.value() * 100)} %`);
                        },
                    });
                }
              });
            }
        }, []);
    }

    const handleHidingImgUploadUpdate = () => {
        // call the parent's function and pass the new state
        updateIsUploadHidden(isHidden);
    };

    const saveExpenseDetails = async (responseData, formData) => {
        const expense_name = responseData.data?.vendor?.name || responseData.data?.vendor?.raw_name;
        const amount = responseData.data.total ?? 0; // default to 0
        const currency = responseData.data.currency_code;
        const date_of_receipt = responseData.data.date ? responseData.data.date.split(' ')[0] : new Date().toISOString().split('T')[0]; // extract timestamp
        const captured_category = responseData.data.category;
        const vendor_category = responseData.data?.vendor?.category || "";

        const expenseCategories = [
            "Flights",
            "Accommodations",
            "Food/Drink",
            "Transport",
            "Activities",
            "Shopping",
            "Phone/Internet",
            "Health/Safety",
            "Other"
        ];

        // vendor category list from Veryfi
        const categoryMap = {
            "grocery": "Food/Drink",
            "taxi": "Transport",
            "fuel": "Transport",
            "hardware": "Shopping",
            "online shopping": "Shopping",
            "restaurant": "Food/Drink",
            "utilities": "Phone/Internet",
            "hotel": "Accommodations",
            "fast food": "Food/Drink",
            "department store": "Shopping",
            "convenience": "Food/Drink", 
            "general contractor": "Other",
            "food": "Food/Drink",
            "car repair": "Transport",
            "coffee": "Food/Drink",
            "parking": "Transport",
            "drugstore / pharmacy": "Health/Safety",
            "airlines": "Flights",
            "nurseries & gardening": "Shopping", 
            "auto parts": "Transport",
            "bakery": "Food/Drink",
            "transportation": "Transport",
            "health": "Health/Safety",
            "building supplies": "Shopping",
            "office equipment": "Shopping"
        };

        let best_category;
        const itemTypes = new Set(); // will remove duplicates
        const categoryCounts = {};
        const allItems = responseData.data.line_items;

        // gather all the item category types in receipt
        allItems.forEach(item => {
            if (item.type) {
                itemTypes.add(item.type.toLowerCase()); // Normalize to lowercase to ensure uniform matching
            }
        });

        // match the type to the types in the category map, storing the count for the ones found
        itemTypes.forEach(type => {
            const mappedCategory = categoryMap[type];
            if (mappedCategory) {
                // increment the count for that category
                categoryCounts[mappedCategory] = (categoryCounts[mappedCategory] || 0) + 1;
            }
        });

        const mostFrequentCategory = Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b, null);

        if (mostFrequentCategory) {
            best_category = mostFrequentCategory;
        }
        else {
            // check if vendor category is in the list
            if (categoryMap[vendor_category].toLowerCase()) {
                best_category = categoryMap[vendor_category];
            } 
            else {
                // similarity search if not found on general category
                const { bestMatch } = stringSimilarity.findBestMatch(captured_category, expenseCategories);
                const threshold = 0.5; 

                if (bestMatch.rating >= threshold) {
                    best_category = bestMatch.target;
                } 
                else {
                    // no good match found
                    best_category = "Other";
                }
            }

        }

        formData.append('name', expense_name);
        formData.append('amount', amount);
        formData.append('currency', currency);
        formData.append('posted', date_of_receipt);
        formData.append('category', best_category);

        handleFormData(formData);
    }

    const sendReceiptForExtraction = async () => {
        if (fileInput.current && fileInput.current.files.length > 0) {
            const imageFile = fileInput.current.files[0];

            // file type validation
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(imageFile.type)) {
                // toast.error("Invalid file type. Please upload a JPEG or PNG image.");
                return;
            }

            const formData = new FormData();
            formData.append('file', imageFile); // 'file' key
    
            try {
                // initializeProgressBar();
                setIsHidden(false);
                handleHidingImgUploadUpdate();

                progressBarRef.current.animate(0.5); // start progress at 50%

                // process receipt image to extract expense data
                const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/process-receipt`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
    
                console.log("Extracted receipt data:", response.data);
                saveExpenseDetails(response.data, formData);

                progressBarRef.current.animate(1.0, () => {
                    setTimeout(() => {
                        setIsHidden(true); 
                        handleHidingImgUploadUpdate();
                    }, 500);
                });
                // toast.success("Receipt processed successfully!");

            } catch (error) {
                console.error("Error uploading receipt to backend: ", error);
                progressBarRef.current.set(0); // reset progress bar
                // toast.error("Failed to process the receipt.");
            }
        }
        else {
            console.error("No file selected for receipt processing.");
            // toast.error("Please choose a file to upload.");
        }
    };

    const toggleHideBar = () => {
        setIsHidden(!isHidden);
        handleHidingImgUploadUpdate()
    }

    const handleReceiptUpload = async (event) => {
        event.preventDefault();
        if (fileInput.current && fileInput.current.files.length > 0) {
            const imageFile = fileInput.current.files[0]; // get the first file chosen

            if (imageFile) { 
                // const formData = new FormData();
                // formData.append('image', imageFile); // 'image' key
                // handleFormData(formData); // passed to expense form component

                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageSrc(reader.result); // base64 data URL
                };
                reader.readAsDataURL(imageFile);

                // toast.success("Receipt uploaded successfully!");
            }
        }
        else {
            console.error('No file chosen');
            toast.error("Please choose a file to upload.");
        }
    };

    return (
        <div className="receipt-upload-container">
            {/* Icon to open up receipt upload container */}
            <button 
                onClick={toggleHideBar} 
                className="receipt-upload-button">
                <svg 
                    fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"/>
                </svg>
            </button>
            <div className={`receipt-upload-form ${isHidden ? 'hidden' : ''}`}>
                <h6 className="receipt-upload-title">Upload a Receipt</h6>
                <form encType="multipart/form-data" className="receipt-upload-form-content">
                    <input
                        type="file"
                        name="image"
                        ref={fileInput}
                        required
                        className="file-input"
                    />
                    {/* Preview receipt */}
                    <div className="icon-buttons-container">
                        <button
                            type="button"
                            onClick={handleReceiptUpload}
                            className="icon-button"
                            aria-label="Preview receipt">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>

                        <button 
                            type="button" 
                            onClick={sendReceiptForExtraction}
                            className="icon-button" 
                            aria-label="Process receipt">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </form>

                <div className="receipt-preview-container">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="Receipt"
                            className="receipt-preview-image"
                        />
                    ) : (
                        <p>No receipt preview available.</p>
                    )}
                </div>
                {/* Progress Bar */}
                <div id="progress-container" className="progress-bar-container"></div>
            </div>
        </div>
    
    );

};

export default ReceiptImageComponent;