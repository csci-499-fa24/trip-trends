import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TripImageComponent = ({ tripId }) => {
    const [error, setError] = useState(null);
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);

    const handleAddImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            const formData = new FormData();
            let allValidFiles = true;

            for (const file of files) {
                const isValid = await processFile(file, formData);
                if (!isValid) {
                    allValidFiles = false;
                }
            }

            if (allValidFiles) {
                await uploadImages(tripId, formData);
            }
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
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images. Please try again.', { autoClose: 3000 });
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

        </div>
    );
};

export default TripImageComponent;
