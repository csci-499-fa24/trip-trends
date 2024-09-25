const Trip = require('../models/Trip');

// post new trip data into the db
const createTrip = async (req, res) => {
    const { name, start_date, end_date, budget, image } = req.body;
    try {
        // create a model instance 
        const newTrip = await Trip.create({ name, start_date, end_date, budget, image });
        res.status(201).json({ data: newTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });

    }
};

// get all trip data in the db
const getTrips = async (req, res) => {
    try {
        const allTrips = await Trip.findAll();
        res.json({ data: allTrips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createTrip,
    getTrips,
};

