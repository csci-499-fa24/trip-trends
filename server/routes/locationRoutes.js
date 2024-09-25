const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');

router.post("/create-location", LocationController.createLocation);
router.get("/get-locations", LocationController.getLocations);

module.exports = router;