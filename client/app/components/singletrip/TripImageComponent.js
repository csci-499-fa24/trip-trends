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
            {/* Add Image Button */}
            <div className="icon-div" tooltip="Add Image" tabIndex="0">
                <div className="icon-SVG">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="icon-text">Add Image</span>
                </div>
            </div>

            <h2>Images for Trip ID: {tripId}</h2>
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
