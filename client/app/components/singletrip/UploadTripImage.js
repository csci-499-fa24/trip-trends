import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
            // Append all selected files to the FormData object
            Array.from(files).forEach((file) => {
                formData.append('images', file);
            });

            try {
                setUploading(true);
                setError(null); // Reset error state
                setSuccessMessage(''); // Reset success message

                const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}/images`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Handle successful upload
                setSuccessMessage('Images uploaded successfully!');
                console.log('Images uploaded successfully:', response.data);
            } catch (error) {
                console.error('Error uploading images:', error);
                setError('Failed to upload images. Please try again.'); // Set error message
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

            {/* Uploading state */}
            {uploading && <p>Uploading images...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>

        </div>
    );
};

export default TripImageComponent;
