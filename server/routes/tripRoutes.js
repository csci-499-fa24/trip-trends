const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');

router.post("/create-trip", TripController.createTrip);
router.get("/get-trips", TripController.getTrips);

module.exports = router;