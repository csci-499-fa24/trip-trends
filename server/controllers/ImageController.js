const Image = require('../models/Image');
const TripLocation = require('../models/TripLocation')

// POST new image data
const createImage = async (req, res) => {
    const tripId = req.params.tripId;
    const { image_url } = req.body;
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
            return res.status(404).json({ data: image, message: "Image not found" });
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
            return res.status(200).json({ data: images, message: "Images not found" });
        }
        res.status(200).json({ data: images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE all image data with specified TripId
const deleteTripImages = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        if (!tripId) {
            return res.status(400).json({ message: "Trip ID is required" });
        }
        
        const deletedImagesCount = await Image.destroy({
            where: {
                trip_id: tripId,
            },
        });

        if (deletedImagesCount === 0) {
            return res.status(404).json({ message: "No images found for the specified tripId" });
        }

        res.status(200).json({ message: `${deletedImagesCount} images deleted successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
// DELETE image by location position within a trip
const deleteImageByLocationPosition = async (req, res) => {
    const tripId = req.params.tripId;
    const position = parseInt(req.params.position, 10);

    try {
        // Fetch all locations for the given trip
        const tripLocations = await TripLocation.findAll({
            where: { trip_id: tripId },
        });

        // Check if the position is within the bounds of the locations array
        if (position < 0 || position >= tripLocations.length) {
            return res.status(400).json({ message: "Invalid location position" });
        }

        // Fetch all images for the given trip
        const tripImages = await Image.findAll({
            where: { trip_id: tripId }
        });

        // Check if there is an image at the specified position
        if (position >= tripImages.length) {
            return res.status(404).json({ message: "No image found for the specified location position" });
        }

        // Delete the image at the specified position
        const imageToDelete = tripImages[position];
        await imageToDelete.destroy();

        res.status(200).json({ message: "Image deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


module.exports = {
    createImage,
    getImages,
    getImageById,
    getImagesByTripId, 
    deleteTripImages,
    deleteImageByLocationPosition
};