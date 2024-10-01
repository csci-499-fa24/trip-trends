const express = require('express');
const router = express.Router();
const TripLocationController = require('../controllers/TripLocationController');

router.post("/create-trip-location", TripLocationController.createTripLocation);
router.get("/get-trip-locations", TripLocationController.getTripLocations);
router.get("/get-trip-location/:id", TripLocationController.getTripLocationByTripId);
router.put("/update-trip-location/:id", TripLocationController.updateTripLocation);
router.delete("/delete-trip-location/:id", TripLocationController.deleteTripLocation);

module.exports = router;