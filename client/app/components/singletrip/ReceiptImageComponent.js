import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ReceiptImageComponent = ({ tripId }) => {
    const [uploadedExpenseId, setUploadedExpenseId] = useState(null); // for receipt img retrieval
    const fileInput = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);

    const uploadReceiptImage = async (formData) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/expenses/trips/${tripId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setUploadedExpenseId(response.data.data.expense_id);
            console.log(response.data.data.expense_id);
            // add toast message
        } catch (error) {
            console.error('Error uploading receipt:', error);
            
        }
    };

    const handleReceiptUpload = async (event) => {
        event.preventDefault();
        if (fileInput.current && fileInput.current.files.length > 0) {
            const imageFile = fileInput.current.files[0]; // get the first file chosen

            if (imageFile) {
                try {
                    const formData = new FormData();
                    formData.append('img', imageFile);
                    await uploadReceiptImage(formData);
                } catch (error) {
                    console.error('Error uploading receipt:', error);
                }
            }
        }
        else {
            console.error('No file chosen');
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

    useEffect(() => {
        if (uploadedExpenseId) {
            fetchReceiptImage();
        }
    }, [uploadedExpenseId]);


    return (
        <div>
            <h6>Upload a Receipt</h6>
            <form onSubmit={handleReceiptUpload} encType="multipart/form-data">
                <input type="file" name="img" ref={fileInput} required />
                <input type="submit" value="Upload"/>
            </form>
            <div>
                {imageSrc ? (
                    <img src={imageSrc} alt="Receipt" style={{ width: '100px', height: 'auto' }}/>
                    ) : (
                        <p></p>
                    )}
            </div>
        </div>
    );

};

export default ReceiptImageComponent;