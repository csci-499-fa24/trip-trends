const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');

router.post("/:userId", TripController.createTrip);
router.get("/", TripController.getTrips);
router.get("/users/:userId", TripController.getTripsByUserId);
router.get("/:tripId", TripController.getTripById);
router.put("/:tripId", TripController.updateTrip);
router.delete("/:tripId", TripController.deleteTrip);

module.exports = router;