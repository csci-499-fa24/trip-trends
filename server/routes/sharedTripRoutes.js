const express = require('express');
const router = express.Router();
const SharedTripController = require('../controllers/SharedTripController');

router.post('/create-shared-trip', SharedTripController.createSharedTrip);
router.get('/get-shared-trips', SharedTripController.getSharedTrips);
router.get('/get-shared-trip-by-user-id/:id', SharedTripController.getSharedTripByUserId);
router.get('/get-shared-trip-by-trip-id/:id', SharedTripController.getSharedTripByTripId);
router.put('/update-shared-trip/:id', SharedTripController.updateSharedTrip);
router.delete('/delete-shared-trip/:id', SharedTripController.deleteSharedTrip);

module.exports = router;
