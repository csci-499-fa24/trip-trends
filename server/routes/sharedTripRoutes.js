const express = require('express');
const router = express.Router();
const SharedTripController = require('../controllers/SharedTripController');

router.post('/create-shared-trip', SharedTripController.createSharedTrip);
router.get('/get-shared-trips', SharedTripController.getSharedTrips);

module.exports = router;
