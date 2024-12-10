import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/uploadImage.css';

const TripImageComponent = ({ tripId, onUpload }) => {
    const [error, setError] = useState(null);
    const fileInputRef = useRef();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            const formData = new FormData();
            let allValidFiles = true;

            setIsLoading(true); // Show loader

            for (const file of files) {
                const isValid = await processFile(file, formData);
                if (!isValid) {
                    allValidFiles = false;
                }
            }

            if (allValidFiles) {
                await uploadImages(tripId, formData);
            }

            setIsLoading(false); // Hide loader after upload
        }
    };


    const isValidFileType = (fileType) => {
        return fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/heic' || fileType === 'image/webp';
    };

    const convertHeicToJpeg = async (file) => {
        const heic2any = (await import('heic2any')).default;
        return await heic2any({
            blob: file,
            toType: 'image/jpeg',
        });
    };


    const processFile = async (file, formData) => {
        const fileType = file.type;

        if (!isValidFileType(fileType)) {
            toast.error(`Invalid file type: ${file.name}. Only PNG, JPEG, and HEIC formats are allowed.`, {
                autoClose: 3000,
            });
            return false;
        }

        if (fileType === 'image/heic') {
            try {
                const convertedBlob = await convertHeicToJpeg(file);
                formData.append('images', convertedBlob, `${file.name}.jpeg`);
            } catch (error) {
                toast.error(`Failed to convert HEIC file: ${file.name}.`, { autoClose: 3000 });
                return false;
            }
        } else {
            formData.append('images', file);
        }
        return true;
    };


    const uploadImages = async (tripId, formData) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Images uploaded successfully!', { autoClose: 3000 });
            console.log('Images uploaded successfully:', response.data);
            onUpload();
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images. Please try again.', { autoClose: 3000 });
        }
    };

    return (
        <div>
            <div>
                {/* Add Image Upload Button */}
                <div className="icon-div" onClick={handleAddImageClick} tooltip="Add Image" tabIndex="0">
                    <div className="icon-SVG">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                        </svg>
                        <span className="icon-text">Upload Image</span>
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    style={{ display: 'none' }}
                />
            </div>
            {/* Toast Container */}
            <ToastContainer />

            {isLoading && (
                <div className="loader">
                    <p>Uploading images...</p>
                    <div className="spinner"></div> {/* Add spinner animation here */}
                </div>
            )}

        </div>
    );
};

export default TripImageComponent;
