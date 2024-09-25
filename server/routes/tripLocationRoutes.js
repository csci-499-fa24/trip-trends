const express = require('express');
const router = express.Router();
const TripLocationController = require('../controllers/TripLocationController');

router.post("/create-trip-location", TripLocationController.createTripLocation);
router.get("/get-trip-locations", TripLocationController.getTripLocations);

module.exports = router;