const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');

router.post("/create-trip", TripController.createTrip);
router.get("/get-trips", TripController.getTrips);
router.get("/get-trip/:id", TripController.getTripById);
router.put("/update-trip/:id", TripController.updateTrip);
router.delete("/delete-trip/:id", TripController.deleteTrip);

module.exports = router;