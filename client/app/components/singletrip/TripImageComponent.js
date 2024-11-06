import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TripImageComponent = ({ tripId }) => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

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


    return (
        <div>
            <h2>Trip Gallery</h2>
            {error && <p>{error}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {images.map(image => (
                    <div key={image.image_id} style={{ margin: '10px' }}>
                        <img
                            src={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/trip-images/${image.image_id}`} // Using the correct URL to fetch the image
                            alt={`Trip Image ${image.image_id}`}
                            style={{ width: '200px', height: 'auto' }} // Optional: set image size
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripImageComponent;
