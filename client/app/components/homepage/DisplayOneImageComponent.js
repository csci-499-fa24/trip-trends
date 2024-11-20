import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/displayOneImage.css';
import DefaultTripImagesComponent from '../singletrip/DefaultTripImagesComponent';

const DisplayOneImageComponent = ({ tripId, size}) => {
    const [aTripImage, setTripImage] = useState('');
    const defaultImageURL = 'https://www.state.gov/wp-content/uploads/2020/11/shutterstock_186964970-scaled.jpg' // when images are not found

    // images stored in the db from Unsplash
    const fetchImages = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/trips/${tripId}`);
          if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            // map over the data to extract the image URLs
            const imageURLs = response.data.data.map(item => item.image_url);
            setTripImage(imageURLs[0]); 
        } else {
            console.log("No images found");
            setTripImage(defaultImageURL)
        }
        } catch (error) {
            console.error('Error fetching images:', error);
            setTripImage(defaultImageURL);
          };
    
        }
    useEffect(() => {
        if (tripId != null) {
            fetchImages();
        }
    }, [tripId]);

    //  dynamic size class
    const wrapperClass = `display-one-image-wrapper ${size}`;

    return (
        <div className={wrapperClass}>
            <img src={aTripImage} alt="Trip Image"/>
        </div>
    );

    // return (
    //     <div className="display-one-image-wrapper">
    //         {aTripImage && aTripImage !== "No image found" && aTripImage !== "Error fetching image" ? (
    //             <img src={aTripImage} alt="Trip Image"/>
    //         ) : (
    //             <div>{aTripImage}</div> // display message
    //         )}
    //     </div>
    // );


};

export default DisplayOneImageComponent;

