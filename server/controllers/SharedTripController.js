const SharedTrip = require('../models/SharedTrip');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// needs to be further implemented
// POST new trip for user
const createSharedTrip = async (req, res) => {
    const userId = req.params.userId;
    const tripId = req.params.tripId;
    const { email, role } = req.body; // destructure role and email from req.body

    try {
        // validate userId and tripId
        if (!userId || !tripId) {
            return res.status(400).json({ message: "userId and tripId are required" });
        }
        // check if current user is the owner of the trip
        const sharedTrip = await SharedTrip.findOne({ 
            where: { 
                user_id: userId, 
                trip_id: tripId 
            }
        });
        if (!sharedTrip || sharedTrip.role !== 'owner') {
            return res.status(403).json({ message: "You do not have permission to share this trip" });
        }
        // find user by email
        const newParticipant = await User.findOne({ where: { email } });
        if (!newParticipant) {
            return res.status(404).json({ message: "User with email not found" });
        }
        // check if user is already participant in trip
        const existingSharedTrip = await SharedTrip.findOne({
            where: {
                user_id: newParticipant.user_id,
                trip_id: tripId
            }
        });
        if (existingSharedTrip) {
            // update role if the user is already participant
            await SharedTrip.update({ role }, {
                where: {
                    user_id: newParticipant.user_id,
                    trip_id: tripId
                }
            });
            return res.status(200).json({ message: "User role updated" });
        }
        // create new shared trip for new participant
        const newSharedTrip = await SharedTrip.create({
            user_id: newParticipant.user_id,
            trip_id: tripId,
            role: role
        });
        return res.status(201).json({ data: newSharedTrip });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
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

const getSharedTripsByTripId = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        const sharedTrips = await SharedTrip.findAll({
            where: { trip_id: req.params.tripId },
            include: [{
                model: User,
                attributes: ['user_id', 'fname', 'lname', 'email', 'image'],
                as: 'user'
            }]
        });     
        
        if (sharedTrips.length === 0) {
            return res.status(404).json({ message: "Shared Trip not found" });
        }
        const result = sharedTrips
        // .filter(sharedTrip => sharedTrip.role !== 'owner')
        .map(sharedTrip => ({
            user_id: sharedTrip.user ? sharedTrip.user.user_id : null,
            fname: sharedTrip.user ? sharedTrip.user.fname : null,
            lname: sharedTrip.user ? sharedTrip.user.lname : null,
            email: sharedTrip.user ? sharedTrip.user.email : null,
            image: sharedTrip.user ? sharedTrip.user.image : null,
            role: sharedTrip.role
        }));
        return res.json({ data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update shared trip data
const updateSharedTrip = async (req, res) => {
    const { userId, tripId } = req.params;
    const updatedData = req.body;
    try {
        const sharedTrip = await SharedTrip.findOne({ where: { user_id: userId, trip_id: tripId } });
        if (!sharedTrip) {
            return res.status(404).json({ message: "Shared trip not found" });
        }
        const updatedSharedTrip = await sharedTrip.update(updatedData);
        res.json({ data: updatedSharedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

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
    getSharedTrips,
    getSharedTripsByUserId,
    getSharedTripsByTripId,
    deleteSharedTrip,
    updateSharedTrip
};