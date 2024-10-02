const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');

// POST new trip data into the db
const createTrip = async (req, res) => {
    const userId = req.params['userId']; 
    const { name, start_date, end_date, budget, image } = req.body;
    try {
        // create new model isntance
        const newTrip = await Trip.create({ name, start_date, end_date, budget, image });
        // create relationship b/w user and trip
        await SharedTrip.create({ user_id: userId, trip_id: newTrip.trip_id });
        res.status(201).json({ data: newTrip });
    } catch (err) {
        console.error("Error creating trip:", err);
        if (err.name === 'SequelizeValidationError') {
            res.status(400).json({ message: "Validation Error", errors: err.errors.map(e => e.message) });
        } else {
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
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

// GET specific trip data by UserId
const getTripsByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const sharedTrips = await SharedTrip.findAll({ where: { user_id: userId } });
        if (!sharedTrips || sharedTrips.length === 0) {
            return res.status(404).json({ message: "Trip not found" });
        }
        const tripIds = sharedTrips.map(trip => trip.trip_id);
        const trips = await Trip.findAll({ where: { trip_id: tripIds } });
        res.json({ data: trips });
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
    getTripsByUserId,
    getTripById,
    updateTrip,
    deleteTrip
};

