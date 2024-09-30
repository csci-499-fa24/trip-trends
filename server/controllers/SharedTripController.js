const SharedTrip = require('../models/SharedTrip');

// POST new shared trip to db
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

// GET all shared trips from db
const getSharedTrips = async (req, res) => {
    try {
        const allSharedTrips = await SharedTrip.findAll();
        res.json({ data: allSharedTrips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific shared trip data by userId
const getSharedTripByUserId = async (req, res) => {
    const id = req.params.id;
    try {
        const sharedTrip = await SharedTrip.findAll({ where: { user_id: id } });
        if (!sharedTrip) {
            return res.status(404).json({ message: "Shared Trip not found" });
        }
        res.json({ data: sharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific shared trip data by tripId
const getSharedTripByTripId = async (req, res) => {
    const id = req.params.id;
    try {
        const sharedTrip = await SharedTrip.findAll({ where: { trip_id: id } });
        if (!sharedTrip) {
            return res.status(404).json({ message: "Shared Trip not found" });
        }
        res.json({ data: sharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update shared trip data
const updateSharedTrip = async (req, res) => {
    const id = req.params.id;
    const { user_id, trip_id } = req.body;
    try {
        const sharedTrip = await SharedTrip.findByPk(id);
        if (!sharedTrip) {
            return res.status(404).json({ message: "Shared trip not found" });
        }
        const updatedSharedTrip = await sharedTrip.update({ user_id, trip_id });
        res.json({ data: updatedSharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE shared trip data
const deleteSharedTrip = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedCount = await SharedTrip.destroy({ where: { id } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Shared trip not found" });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createSharedTrip,
    getSharedTrips,
    getSharedTripByUserId,
    getSharedTripByTripId,
    updateSharedTrip,
    deleteSharedTrip,
};