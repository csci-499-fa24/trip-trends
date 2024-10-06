const SharedTrip = require('../models/SharedTrip');

// POST new shared trip for user
const createSharedTrip = async (req, res) => {
    const userId = req.params.userId;
    const tripId = req.params.tripId;
    console.log("userId:", userId); // Debugging line
    console.log("tripId:", tripId); // Debugging line

    try {
        if (!userId || !tripId) {
            return res.status(400).json({ message: "userId, tripId required" });
        }
        // create new model instance 
        const newSharedTrip = await SharedTrip.create({ user_id: userId, trip_id: tripId });
        res.status(201).json({ data: newSharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET all shared trips
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
    const userId = req.params.userId;
    try {
        const sharedTrip = await SharedTrip.findAll({ where: { user_id: userId } });
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
    const tripId = req.params.tripId;
    try {
        const sharedTrip = await SharedTrip.findAll({ where: { trip_id: tripId } });
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
    const { userId, tripId } = req.params;
    try {
        const sharedTrip = await SharedTrip.findByPk({ where: { user_id: userId, trip_id: tripId } });
        if (!sharedTrip) {
            return res.status(404).json({ message: "Shared trip not found" });
        }
        const updatedSharedTrip = await sharedTrip.update({ userId, tripId });
        res.json({ data: updatedSharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE shared trip data
const deleteSharedTrip = async (req, res) => {
    const { userId, tripId } = req.params;
    try {
        const deletedCount = await SharedTrip.destroy({ where: { user_id: userId, trip_id: tripId } });
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
    deleteSharedTrip
};