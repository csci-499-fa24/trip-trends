const express = require('express');
const router = express.Router();
const SharedTripController = require('../controllers/SharedTripController');

router.post('/users/:userId/trips/:tripId', SharedTripController.createSharedTrip);
router.get('/', SharedTripController.getSharedTrips);
router.get('/users/:userId', SharedTripController.getSharedTripsByUserId);
router.get('/trips/:tripId', SharedTripController.getSharedTripsByTripId);
router.put('/users/:userId/trips/:tripId', SharedTripController.updateSharedTrip);
router.delete('/users/:userId/trips/:tripId', SharedTripController.deleteSharedTrip);

module.exports = router;
