const SharedTrip = require('../models/SharedTrip');

// post new shared trip to db
const createSharedTrip = async (req, res) => {
    const { user_id, trip_id } = req.body;
    try {
        // create a model instance 
        const newSharedTrip = await SharedTrip.create({ user_id, trip_id });
        res.status(201).json({ data: newSharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// get all shared trips from db
const getSharedTrips = async (req, res) => {
    try {
        const allSharedTrips = await SharedTrip.findAll();
        res.json({ data: allSharedTrips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createSharedTrip,
    getSharedTrips,
};