const TripLocation = require("../models/TripLocation");

// post a trip location in db
const createTripLocation = async (req, res) => {
    const { trip_id, location } = req.body;
    try {
        // create a model instance 
        const newTripLocation = await TripLocation.create({ trip_id, location });
        res.status(201).json({ data: newTripLocation });
    } catch (err) {
        console.error(err);
    }
};

// get all trip locations from db
const getTripLocations = async (req, res) => {
    try {
        const allTripLocations = await TripLocation.findAll();
        res.json({ data: allTripLocations });
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
        if (!tripLocation) {
            return res.status(404).json({ message: "Trip Location not found" });
        }
        res.json({ data: tripLocation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update trip location data
const updateTripLocation = async (req, res) => {
    const tripId = req.params.tripId;
    const { trip_id, location } = req.body;
    try {
        const tripLocation = await TripLocation.findAll({ where: { trip_id: tripId } });
        if (!tripLocation) {
            return res.status(404).json({ message: "Trip location not found" });
        }
        const updatedTripLocation = await tripLocation.update({ trip_id, location });
        res.json({ data: updatedTripLocation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE trip location data
const deleteTripLocation = async (req, res) => {
    const id = req.params.id;
    try {
        // delete trip by id
        const deletedCount = await TripLocation.destroy({ where: { trip_id: id } });
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
    updateTripLocation,
    deleteTripLocation
};