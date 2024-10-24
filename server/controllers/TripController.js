const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');
const Expense = require('../models/Expense');
const { parse } = require('json2csv');

// POST new trip data
const createTrip = async (req, res) => {
    const userId = req.params['userId']; 
    const { name, start_date, end_date, budget } = req.body;
    try {
        // create new model isntance
        const newTrip = await Trip.create({ name, start_date, end_date, budget });
        // create relationship b/w user and trip
        await SharedTrip.create({ user_id: userId, trip_id: newTrip.trip_id });
        res.status(201).json({ data: newTrip });
    } catch (err) {
        console.error("Error creating trip:", err);
        if (err.name === 'SequelizeValidationError') {
            res.status(400).json({ message: "Validation Error", error: err.message });
        } else {
            res.status(500).json({ message: "Internal Server Error", error: err.message });
        }
    }
};

// GET all trips data
const getTrips = async (req, res) => {
    try {
        const allTrips = await Trip.findAll();
        res.status(200).json({ data: allTrips });
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
        res.status(200).json({ data: trips });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific trip data by tripId
const getTripById = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        res.status(200).json({ data: trip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update trip data
const updateTrip = async (req, res) => {
    const tripId = req.params.tripId;
    const { name, startDate, endDate, budget } = req.body;
    try {
        // find trip by tripId
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
            return res.status(404).json();
        }
        // update trip data
        const updatedTrip = await trip.update({ name, startDate, endDate, budget });
        res.status(200).json({ data: updatedTrip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE trip data
const deleteTrip = async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const deletedCount = await Trip.destroy({ where: { trip_id: tripId } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Trip not found" });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error"});
    }
};

// DOWNLOAD trip data as CSV
const downloadTripData = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Fetch expenses associated with the trip
        const expenses = await Expense.findAll({ where: { trip_id: tripId } });

        // Prepare trip data for CSV
        const tripData = {
            name: trip.name,
            start_date: trip.start_date,
            end_date: trip.end_date,
            budget: trip.budget,
        };

        // Define fields for trip data
        const tripFields = ['name', 'start_date', 'end_date', 'budget'];
        const csvTrip = parse(tripData, { fields: tripFields });

        // Prepare expenses data for CSV
        const expenseData = expenses.map(expense => ({
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            currency: expense.currency,
            posted: expense.posted,
            notes: expense.notes
        }));

        // Define fields for expense data
        const expenseFields = ['name', 'amount', 'category', 'currency', 'posted', 'notes'];
        const csvExpenses = parse(expenseData, { fields: expenseFields });

        // Combine both trip and expense CSV
        const combinedCSV = `${csvTrip}\n\nExpense Data:\n${csvExpenses}`;

        // Send CSV file
        res.setHeader('Content-Disposition', `attachment; filename=trip_${tripId}.csv`);
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(combinedCSV);
    } catch (err) {
        console.error('Error generating CSV:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    createTrip,
    getTrips,
    getTripsByUserId,
    getTripById,
    updateTrip,
    deleteTrip,
    downloadTripData
};
