import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TripImageComponent = ({ tripId }) => {
    const [error, setError] = useState(null);
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');



    const handleAddImageClick = () => {
        // Trigger the hidden file input
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            const formData = new FormData();
            let validFiles = true;

            // Validate file types
            Array.from(files).forEach((file) => {
                const fileType = file.type;
                if (fileType !== 'image/png' && fileType !== 'image/jpeg') {
                    validFiles = false;
                    toast.error(`Invalid file type: ${file.name}. Only PNG and JPEG formats are allowed.`);
                } else {
                    formData.append('images', file);
                }
            });

            // If there are no valid files, stop the upload
            if (!validFiles) {
                return;
            }

            try {
                setUploading(true);
                // Reset any previous notifications
                toast.dismiss();

                const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}/images`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Show success toast
                toast.success('Images uploaded successfully!');
                console.log('Images uploaded successfully:', response.data);
            } catch (error) {
                console.error('Error uploading images:', error);
                // Show error toast
                toast.error('Failed to upload images. Please try again.');
            } finally {
                setUploading(false); // Reset uploading state
            }
        }
    };

    return (
        <div>
          <div>
                {/* Add Image Button */}
                <div className="icon-div" onClick={handleAddImageClick} tooltip="Add Image" tabIndex="0">
                    <div className="icon-SVG">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="icon-text">Add Image</span>
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple // Allow multiple file selection
                    style={{ display: 'none' }} // Hide the input
                />

                {/* Uploading state
                {uploading && <p>Uploading images...</p>} */}
            </div>

            {/* Toast Container */}
            <ToastContainer />

        </div>
    );
};

export default TripImageComponent;
