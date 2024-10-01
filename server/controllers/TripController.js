const Trip = require('../models/Trip');

// POST new trip data into the db
const createTrip = async (req, res) => {
    const { user_id } = req.params
    const { name, start_date, end_date, budget, image } = req.body;
    try {
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // create a model instance 
        const newTrip = await Trip.create({ user_id, name, start_date, end_date, budget, image });
        res.status(201).json({ data: newTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });

    }
};

// GET all trip data in the db
const getTrips = async (req, res) => {
    try {
        const allTrips = await Trip.findAll();
        res.json({ data: allTrips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific trip data by tripId
const getTripByUserId = async (req, res) => {
    const { user_id } = req.params;
    const id = req.params.id;
    try {
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        const trip = await Trip.findAll({ where: { user_id: id } });
        res.json({ data: trip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific trip data by tripId
const getTripById = async (req, res) => {
    const id = req.params.id;
    try {
        const trip = await Trip.findByPk(id);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        res.json({ data: trip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update trip data
const updateTrip = async (req, res) => {
    const id = req.params.id;
    const { trip_id, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // find trip by id
        const trip = await Trip.findByPk(id);
        if (!trip) {
            return res.status(404).json();
        }
        // update trip data
        const updatedTrip = await trip.update({ trip_id, name, amount, category, currency, posted, notes, image });
        res.json({ data: updatedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE trip data
const deleteTrip = async (req, res) => {
    const id = req.params.id;
    try {
        // delete trip by id
        const deletedCount = await Trip.destroy({ where: { trip_id: id } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Trip not found" });
        }
        res.status(204).json();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createTrip,
    getTrips,
    getTripByUserId,
    getTripById,
    updateTrip,
    deleteTrip
};

