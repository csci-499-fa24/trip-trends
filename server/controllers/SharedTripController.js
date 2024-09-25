const SharedTrip = require('../models/SharedTrip');

// post new shared trip to db
const createSharedTrip = async (req, res) => {
    const { user_id, trip_id } = req.body;
    try {
        // create a model instance 
        const newSharedTrip = await SharedTrip.create({ user_id, trip_id });
        res.json({ data: newSharedTrip });
    } catch (err) {
        console.error(err);
    }
};

// get all shared trips from db
const getSharedTrips = async (req, res) => {
    try {
        const allSharedTrips = await SharedTrip.findAll();
        res.json({ data: allSharedTrips });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    createSharedTrip,
    getSharedTrips,
};