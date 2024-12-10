import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/gallery.css';

const TripImageComponent = ({ tripId }) => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                if (tripId) {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}/images`);
                    if (response.data.length === 0) {
                        setError("No images to display.");
                    } else {
                        setImages(response.data);
                    }
                } else {
                    console.error("Trip ID is not defined");
                }
            } catch (error) {
                console.error("Error fetching trip images:", error);
                setError("No images to display.");
            }
        };

        fetchImages();
    }, [tripId]);

    const openPopUp = (imageId) => {
        const image = images.find((img) => img.image_id === imageId);
        setSelectedImage(image);
    };

    const closePopUp = () => {
        setSelectedImage(null);
    };

    const handleDeleteImage = (imageID, event) => {
        event.stopPropagation();

        axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/delete-images/${imageID}`)
            .then(response => {
                console.log(response.data);
                toast.success("Successfully deleted your image.");
                setImages(prevImages => prevImages.filter(image => image.image_id !== imageID));
            })
            .catch(error => {
                toast.error("Couldn't deleted your image.");
                console.error('Error deleting your image:', error);
            });
    };

    return (
        <div>
            {error && (
                <div className="error-container">
                    <p>{error}</p>
                </div>
            )}
            {/* Conditional rendering for empty images */}
            {images.length === 0 && !error ? (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>No images to display.</p>
            ) : (
                <div className="gallery-grid">
                    {images.map(image => (
                        <div key={image.image_id} className="gallery-item">
                            <img
                                src={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/trip-images/${image.image_id}`}
                                alt={`Trip Image ${image.image_id}`}
                                className="gallery-image"
                                onClick={() => openPopUp(image.image_id)}
                            />
                        </div>
                    ))}
                </div>
            )}
            {selectedImage && (
                <div className='imgPopUp' onClick={closePopUp}>
                    <div className='imgBox' onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/trip-images/${selectedImage.image_id}`}
                            alt={`Selected Image ${selectedImage.image_id}`}
                        />
                    </div>
                    <div className="icon-div delete-image-icon" tooltip="Delete Image" tabIndex="0">
                        <div className="icon-SVG">
                            <svg
                                onClick={(e) => handleDeleteImage(selectedImage.image_id, e)}
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            <span className="icon-text">Delete</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripImageComponent;