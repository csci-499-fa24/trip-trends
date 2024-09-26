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

module.exports = {
    createTripLocation,
    getTripLocations,
};