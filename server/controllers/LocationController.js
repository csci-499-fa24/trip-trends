const Location = require("../models/Location");

// post a trip location in db
const createLocation = async (req, res) => {
    const { trip_id, location } = req.body;
    try {
        // create a model instance 
        const newLocation = await Location.create({ trip_id, location });
        res.json({ data: newLocation });
    } catch (err) {
        console.error(err);
    }
};

// get all trip locations from db
const getLocations = async (req, res) => {
    try {
        const allLocations = await Location.findAll();
        res.json({ data: allLocations });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    createLocation,
    getLocations,
};