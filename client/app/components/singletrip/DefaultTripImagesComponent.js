import React, { useEffect, useState, useRef } from 'react';
import { createApi } from 'unsplash-js';
import Carousel from 'react-bootstrap/Carousel';
import axios from 'axios';
import '../../css/defaultTripImages.css';

const DefaultTripImagesComponent = ({ tripId, tripLocations }) => {
  const [image_URLS, setImages] = useState([]);
  const [img_error, setImgError] = useState('');
  const hasFetchedImages = useRef(false); 

  const unsplash = createApi({
    accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  });

  // Uses the Unsplash API to fetch one pgoto based on a single trip location
  const getImageURL = async (trip_location) => {
    console.log('Querying Unsplash with:', trip_location);

    try {
      const response = await unsplash.search.getPhotos({
        query: trip_location,
        page: 1,
        perPage: 10,
        orientation: 'landscape'
      });

      console.log("Unsplash API response", response);
      if (response.response && response.response.results.length > 0) {
        const images = response.response.results.map(image => image.urls.regular); // array of 10 images

        const random_index = Math.floor(Math.random() * response.response.results.length); // random index img to set as image url
        const imageURL = images[random_index]
        console.log(`Image URL for ${trip_location}:`, imageURL);
        // console.log(images); // Array of image URLs
        return imageURL;
        } 
        else {
          console.log(`No images found for location: ${trip_location}`);
          return null;
        }
      } catch (error) {
        console.error('Error finding images:', error.message, error.response?.data);

      }
  };

  const populateWithImageURLs = async () => {
    try {  
      const imageURLs = await Promise.all(tripLocations.map(async (location) => {
        const a_image_url = await getImageURL(location); 
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/trips/${tripId}`, { image_url: a_image_url });
        console.log('Axios response:', response);
        // console.log(response); 
        console.log(a_image_url);
        return a_image_url; // accumulate imageURLs
      }));
  
      // Set the images after all promises resolve
      setImages(imageURLs);
      
    } catch (error) {
      console.error('Error posting image URLs:', error);
      setImgError('Error creating image URLs.');
    }
  };

  // API already called on trip, fetch imgs, otherwise call API on all trip locations
  const fetchImages = async () => {
    try {
      // do not fetch if images have already been fetched
      if (hasFetchedImages.current) {
        return;  
      }
      hasFetchedImages.current = true;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/trips/${tripId}`);
      console.log(response);
      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        // map over the data to extract the image URLs
        const imageURLs = response.data.data.map(item => item.image_url);
        setImages(imageURLs); 
    } else {
        console.log("No images found");
        await populateWithImageURLs();
    }
    } catch (error) {
        console.error('Error fetching images:', error);
        setImgError('Error fetching images.');
      };

    }

  useEffect(() => {
    if (tripLocations.length > 0) {
      // console.log("Fetching images based on tripLocations:", tripLocations);
      fetchImages(); // when trip locations are available
    }
  }, [tripLocations]);

  return (
    <div className="carousel-container">
      {img_error && <p style={{ color: 'red' }}>{img_error}</p>}
      {image_URLS.length > 0 ? (
        <Carousel fade controls={image_URLS.length > 1}>
          {image_URLS.map((image_URL, index) => (
            <Carousel.Item key={index}>
              <div className="image-wrapper">
                <img
                  src={image_URL}
                  alt={`Slide ${index}`}
                  className="trip-img"
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>No images found for this trip.</p>
      )}
    </div>
  );
  
  

}; 

export default DefaultTripImagesComponent; 