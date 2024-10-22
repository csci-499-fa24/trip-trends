const TripLocation = require("../models/TripLocation");
const SharedTrip = require('../models/SharedTrip');

// post a trip location in db
const createTripLocation = async (req, res) => {
    const { trip_id, location } = req.body;
    try {
        // create a model instance 
        const newTripLocation = await TripLocation.create({ trip_id, location });
        res.status(201).json({ data: newTripLocation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET all trip locations
const getTripLocations = async (req, res) => {
    try {
        const allTripLocations = await TripLocation.findAll();
        res.status(200).json({ data: allTripLocations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
// GET specific trip location data by tripId
const getTripLocationByTripId = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        const tripLocation = await TripLocation.findAll({ where: { trip_id: tripId } });
        if (tripLocation.length === 0) {
            return res.status(404).json({ message: "Trip Location not found" });
        }
        res.status(200).json({ data: tripLocation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET trip location data by userId
const getTripLocationByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const sharedTrips = await SharedTrip.findAll({ where: { user_id: userId } });
        if (!sharedTrips || sharedTrips.length === 0) {
            return res.status(404).json({ message: "Trip not found" });
        }
        const tripIds = sharedTrips.map(trip => trip.trip_id);
        const tripLocations = await TripLocation.findAll({ where: { trip_id: tripIds },});

        if (!tripLocations || tripLocations.length === 0) {
            return res.status(404).json({ message: "Trip locations not found" });
        }
        res.status(200).json({ data: tripLocations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update trip location data
const updateTripLocation = async (req, res) => {
    const tripId = req.params.tripId;
    const tripLocationId = req.params.tripLocationId;
    const { location, longitude, latitude, currency_code } = req.body;
    try {
        const tripLocation = await TripLocation.findOne({ where: { trip_id: tripId, location: tripLocationId} });
        if (!tripLocation) {
            return res.status(404).json({ message: "Trip location not found" });
        }
        const updatedTripLocation = await tripLocation.update({ location, longitude, latitude, currency_code });
        res.status(200).json({ data: updatedTripLocation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
    
// DELETE trip location data
const deleteTripLocation = async (req, res) => {
    const tripId = req.params.tripId;
    const tripLocationId = req.params.tripLocationId;
    try {
        // delete trip location by tripId
        const deletedCount = await TripLocation.destroy({ where: { trip_id: tripId, location: tripLocationId} });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Trip Location not found" });
        }
        res.status(204).json();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createTripLocation,
    getTripLocations,
    getTripLocationByTripId,
    getTripLocationByUserId,
    updateTripLocation,
    deleteTripLocation
};