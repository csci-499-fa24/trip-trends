const express = require('express');
const router = express.Router();
const TripController = require('../controllers/TripController');



router.post("/users/:userId", TripController.createTrip);
router.get("/", TripController.getTrips);
router.get("/users/:userId", TripController.getTripsByUserId);
router.get("/:tripId", TripController.getTripById);
router.put("/:tripId", TripController.updateTrip);
router.delete("/:tripId", TripController.deleteTrip);
router.get('/download/:tripId', TripController.downloadTripData);
router.post('/:tripId/images', TripController.createTripImage);
router.get('/trip-images/:imageId', TripController.getTripImage);
router.get('/:tripId/images', TripController.getImagesByTripId);
router.delete('/delete-images/:imageId', TripController.deleteTripImage);


module.exports = router;