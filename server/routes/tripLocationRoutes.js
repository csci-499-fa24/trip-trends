const express = require('express');
const router = express.Router();
const TripLocationController = require('../controllers/TripLocationController');

router.post("/", TripLocationController.createTripLocation);
router.get("/", TripLocationController.getTripLocations);
router.get("/trips/:tripId", TripLocationController.getTripLocationByTripId);
router.put("/trips/:tripId/:tripLocationId", TripLocationController.updateTripLocation);
router.delete("/trips/:tripId/:tripLocationId", TripLocationController.deleteTripLocation);

module.exports = router;