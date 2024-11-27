import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    return (
        <div>
            {error && (
                <div className="error-container">
                    <p>{error}</p>
                </div>
            )}
            {/* Conditional rendering for empty images */}
            {images.length === 0 && !error ? (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>No images to display...</p>
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
                </div>
            )}
        </div>
    );
};

export default TripImageComponent;