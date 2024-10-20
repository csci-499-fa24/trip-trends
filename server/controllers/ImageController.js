const Image = require('../models/Image');

// POST new image data
const createImage = async (req, res) => {
    const tripId = req.params.tripId;
    const { image_url } = req.body;
    console.log(image_url);
    try {
        // create a model instance 
        const newImage = await Image.create({ trip_id: tripId, image_url });
        res.status(201).json({ data: newImage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET all image data
const getImages = async (req, res) => {
    try {
        const allImages = await Image.findAll();
        res.status(200).json({ data: allImages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific image data by imageId
const getImageById = async (req, res) => {
    const imageId = req.params.imageId;
    try {
        const image = await Image.findByPk(imageId);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        res.status(200).json({ data: image });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific image data by TripId
const getImagesByTripId = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        if (!tripId) {
            return res.status(400).json({ message: "Trip ID is required" });
        }
        const images = await Image.findAll({ where: { trip_id: tripId } });
        if (!images || images.length === 0) {
            return res.status(404).json({ message: "Images not found" });
        }
        res.status(200).json({ data: images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createImage,
    getImages,
    getImageById,
    getImagesByTripId
};