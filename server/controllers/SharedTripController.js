const SharedTrip = require('../models/SharedTrip');
const User = require('../models/User');

// POST new trip for user
const createSharedTrip = async (req, res) => {
    const userId = req.params.userId;
    const tripId = req.params.tripId;
    const { email, role } = req.body;

    try {
        if (!userId || !tripId) {
            return res.status(400).json({ message: "userId, tripId required" });
        }
        if (role == 'owner') {
            const { email, role } = req.body;
            if (!userId || !tripId) {
                return res.status(400).json({ message: "userId, tripId required" });
            }
            // check if user is owner of trip
            const sharedTrip = await SharedTrip.findOne({ where: { user_id: userId, trip_id: tripId } });
            if (!sharedTrip || sharedTrip.role !== 'owner') {
                return res.status(403).json({ message: "You do not have permission to share this trip" });
            }
            // check if user with email exists
            const newPartipant = await User.findOne({ where: { email } });
            if (!newPartipant) {
                return res.status(404).json({ message: "User with this email not found" });
            }
            // create new model instance 
            const newSharedTrip = await SharedTrip.create({
                user_id: newPartipant.user_id,
                trip_id: tripId,
                role: role
            });
            res.status(201).json({ data: newSharedTrip });
        } else {
            // create new model instance 
            const newSharedTrip = await SharedTrip.create({ user_id: userId, trip_id: tripId, role: 'owner' });
            res.status(201).json({ data: newSharedTrip });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// POST new shared trip for user
const addSharedTrip = async (req, res) => {
    const userId = req.params.userId; // owner
    const tripId = req.params.tripId; 
    const { email, role } = req.body;
    try {
        if (!userId || !tripId) {
            return res.status(400).json({ message: "userId, tripId required" });
        }
        // check if user is owner of trip
        const sharedTrip = await SharedTrip.findOne({ where: { user_id: userId, trip_id: tripId } });
        if (!sharedTrip || sharedTrip.role !== 'owner') {
            return res.status(403).json({ message: "You do not have permission to share this trip" });
        }
        // check if user with email exists
        const newPartipant = await User.findOne({ where: { email } });
        if (!newPartipant) {
            return res.status(404).json({ message: "User with this email not found" });
        }
        // create new model instance 
        const newSharedTrip = await SharedTrip.create({
            user_id: newPartipant.user_id,
            trip_id: tripId,
            role: role
        });
        res.status(201).json({ data: newSharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

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
const getSharedTripsByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const sharedTrips = await SharedTrip.findAll({ where: { user_id: userId } });
        if (sharedTrips.length === 0) {
            return res.status(404).json({ message: "Shared Trip not found" });
        }
        res.json({ data: sharedTrips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific shared trip data by tripId
const getSharedTripsByTripId = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        const sharedTrips = await SharedTrip.findAll({ where: { trip_id: tripId } });
        if (sharedTrips.length === 0) {
            return res.status(404).json({ message: "Shared Trip not found" });
        }
        res.json({ data: sharedTrips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update shared trip data
// const updateSharedTrip = async (req, res) => {
//     const { userId, tripId } = req.params;
//     const updatedData = req.body;
//     try {
//         const sharedTrip = await SharedTrip.findOne({ where: { user_id: userId, trip_id: tripId } });
//         if (!sharedTrip) {
//             return res.status(404).json({ message: "Shared trip not found" });
//         }
//         const updatedSharedTrip = await sharedTrip.update(updatedData);
//         res.json({ data: updatedSharedTrip });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };

// DELETE shared trip data
const deleteSharedTrip = async (req, res) => {
    const userId = req.params.userId;
    const tripId = req.params.tripId;
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
    addSharedTrip,
    getSharedTrips,
    getSharedTripsByUserId,
    getSharedTripsByTripId,
    deleteSharedTrip
};