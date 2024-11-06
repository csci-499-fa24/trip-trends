import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../../css/receiptImage.css';

const ReceiptImageComponent = ({ tripId, handleFormData}) => {
    // const [uploadedExpenseId, setUploadedExpenseId] = useState(null); // for receipt img retrieval
    const fileInput = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [isHidden, setIsHidden] = useState(true);

    // IN PROGRESS for image processing, move to the backend due to CORS error
    const sendReceiptForExtraction = async (formData) => {
        if (fileInput.current && fileInput.current.files.length > 0) {
            const imageFile = fileInput.current.files[0]; // get the first file chosen

            const formData = new FormData();
            formData.append('file', imageFile); // 'img' key for display

            try {
                // Process file using multipart/form-data upload
                const response = axios.post('https://api.veryfi.com/api/v7/partner/documents/', formData, {
                headers: {
                    "Authorization": process.env.NEXT_PUBLIC_VERYFI_API_KEY,
                    "Client-Id": process.env.NEXT_PUBLIC_VERYFI_CLIENT_ID,
                    "Client-Secret": process.env.NEXT_PUBLIC_VERYFI_CLIENT_SECRET,
                }
                });

                // console.log(response.data);

            } catch (error) {
                console.error("Error uploading receipt to Veryfi: ", error);
            }
            
        }
    }

    const toggleHideBar = () => {
        setIsHidden(!isHidden);
    }

    const handleReceiptUpload = async (event) => {
        event.preventDefault();
        if (fileInput.current && fileInput.current.files.length > 0) {
            const imageFile = fileInput.current.files[0]; // get the first file chosen

            if (imageFile) { 
                const formData = new FormData();
                formData.append('image', imageFile);
                handleFormData(formData); // passed to expense form component

                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageSrc(reader.result); // base64 data URL
                };
                reader.readAsDataURL(imageFile);

                toast.success("Receipt uploaded successfully!");
            }
        }
        else {
            console.error('No file chosen');
            toast.error("Please choose a file to upload.");
        }
    };
    
    const fetchReceiptImage = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/${uploadedExpenseId}/img`, {
                responseType: 'arraybuffer' // binary data being received
            });

            // convert the image buffer to a base64 string
            const receiptImage = Buffer.from(response.data, 'binary').toString('base64');

            const mimeType = response.headers['content-type'];
            
            // data URL
            setImageSrc(`data:${mimeType};base64,${receiptImage}`); 

        } catch (error) {
            console.error('Error fetching receipt image:', error);
        }
    };

    // useEffect(() => {
    //     if (uploadedExpenseId) {
    //         fetchReceiptImage();
    //     }
    // }, [uploadedExpenseId]);


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
                            aria-label="Preview Receipt">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>

                        <button type="button" className="icon-button" aria-label="Process receipt">
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
            </div>
        </div>
    
    );

};

export default ReceiptImageComponent;