import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/defaultTripImages.css';

const TripImageComponent = ({ tripId }) => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                if (tripId) {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/${tripId}/images`);
                    setImages(response.data); // Assuming response.data contains an array of images
                } else {
                    console.error("Trip ID is not defined");
                }
            } catch (error) {
                console.error("Error fetching trip images:", error);
                setError("Error fetching images.");
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
            {error && <p>{error}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {images.map(image => (
                    <div key={image.image_id} style={{ margin: '10px' }}>
                        <img
                            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/trip-images/${image.image_id}`}
                            alt={`Trip Image ${image.image_id}`}
                            style={{ width: '200px', height: 'auto', cursor: 'pointer' }}
                            onClick={() => openPopUp(image.image_id)} 
                        />
                    </div>
                ))}
            </div>
            {selectedImage && (
                <div className='imgPopUp' onClick={closePopUp}>
                    <div className='imgBox' onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/trip-images/${selectedImage.image_id}`}
                            alt={`Selected Image ${selectedImage.image_id}`}
                            style={{ width: '40vw', height: 'auto' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripImageComponent;
