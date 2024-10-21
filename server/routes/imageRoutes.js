const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/ImageController');

router.post("/trips/:tripId/", ImageController.createImage);
router.get("/", ImageController.getImages);
router.get("/:imageId", ImageController.getImageById);
router.get("/trips/:tripId/", ImageController.getImagesByTripId);

module.exports = router;