const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');
const Expense = require('../models/Expense');
const TripImages = require('../models/TripImages');
const { parse } = require('json2csv');
const PDFDocument = require('pdfkit');
const xml2js = require('xml2js');

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
        const sharedTrips = await SharedTrip.findAll({
            where: { user_id: userId },
            order: [['favorite', 'DESC']]
        });
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
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// DOWNLOAD trip data in various formats (CSV, PDF, XML)
const downloadTripData = async (req, res) => {
    const tripId = req.params.tripId;
    const format = req.query.format;

    try {
        // Fetch trip and expense data
        const trip = await Trip.findByPk(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const expenses = await Expense.findAll({ where: { trip_id: tripId } });
        const tripData = {
            name: trip.name,
            start_date: trip.start_date,
            end_date: trip.end_date,
            budget: trip.budget,
        };

        const expenseData = expenses.map(expense => ({
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            currency: expense.currency,
            posted: expense.posted,
            notes: expense.notes
        }));

        const filename = tripData.name.replace(/[^a-zA-Z0-9.]/g, '');

        // Handle CSV format
        if (format === 'csv') {
            const tripFields = ['name', 'start_date', 'end_date', 'budget'];
            const expenseFields = ['name', 'amount', 'category', 'currency', 'posted', 'notes'];

            const csvTrip = parse(tripData, { fields: tripFields });
            const csvExpenses = parse(expenseData, { fields: expenseFields });
            const combinedCSV = `${csvTrip}\n\nExpense Data:\n${csvExpenses}`;

            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            res.setHeader('Content-Type', 'text/csv');
            return res.status(200).send(combinedCSV);
        }

        // Handle PDF format
        if (format === 'pdf') {
            const doc = new PDFDocument();
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');

            doc.pipe(res);
            doc.fontSize(18).font('Helvetica-Bold').text(`${filename}`, { align: 'center', underline: true });
            doc.fontSize(16).font('Helvetica').text(`Trip Duration: ${tripData.start_date} to ${tripData.end_date}`, { align: 'center' });
            doc.text(`Budget: ${tripData.budget}`, { align: 'center' });
            doc.moveDown().text('Your Expenses:', { align: 'center', underline: true });

            expenseData.forEach((expense, index) => {
                doc.fontSize(14).text(`${index + 1}) ${expense.name}`);
                doc.text(`     Category: ${expense.category}`);
                doc.text(`     Price: ${expense.amount} ${expense.currency}`);
                doc.text(`     Date: ${expense.posted}`);
                doc.moveDown();
            });

            doc.end();
            res.status(200).send();
            return;
        }

        // Handle XML format
        if (format === 'xml') {
            const xmlData = {
                trip: tripData,
                expenses: { expense: expenseData }
            };

            const builder = new xml2js.Builder();
            const xml = builder.buildObject(xmlData);

            res.setHeader('Content-Disposition', `attachment; filename=${filename}.xml`);
            res.setHeader('Content-Type', 'application/xml');
            return res.status(200).send(xml);
        }

        // Invalid format
        res.status(400).json({ message: "Invalid format requested" });
    } catch (err) {
        console.error('Error generating download:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const createTripImage = async (req, res) => {
    const tripId = req.params.tripId;

    try {
        // Check if any files were uploaded
        if (!req.files || !req.files.images) {
            return res.status(400).json({ message: "No image files uploaded" });
        }

        let imageFile = req.files.images;
        // Convert to array if single file
        if (!Array.isArray(imageFile)) {
            imageFile = [imageFile];
        }

        const newTripImages = [];

        // Process each image
        for (const file of imageFile) {
            // Convert the file data to a buffer
            const imageBuffer = file.data;

            // Create a new record in the trip_images table
            const newTripImage = await TripImages.create({
                trip_id: tripId,
                image: imageBuffer
            });

            newTripImages.push(newTripImage);
        }

        res.status(201).json({
            success: true,
            message: 'Images uploaded successfully',
            data: newTripImages
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// GET trip image using image ID
const getTripImage = async (req, res) => {
    const imageId = req.params.imageId; // Extract image ID from request parameters

    try {
        // Check if imageId is provided
        if (!imageId) {
            return res.status(400).json({ message: "Image ID is required" });
        }

        // Find the trip image by its ID
        const tripImage = await TripImages.findByPk(imageId);

        // Check if the image exists
        if (!tripImage) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Check if the image buffer exists
        if (!tripImage.image) {
            return res.status(200).json({ message: "Trip image not added" });
        }

        const imageBuffer = tripImage.image; // Buffer in BYTEA format

        // Set the response type and send the image buffer
        res.type("image/png"); // Set content type to PNG
        res.status(200).send(imageBuffer); // Send the image buffer

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const getImagesByTripId = async (req, res) => {
    const tripId = req.params.tripId; // Extract trip ID from request parameters

    try {
        // Check if tripId is provided
        if (!tripId) {
            return res.status(400).json({ message: "Trip ID is required" });
        }

        // Find all images associated with the trip ID
        const tripImages = await TripImages.findAll({
            where: { trip_id: tripId }
        });

        // Check if any images were found
        if (tripImages.length === 0) {
            return res.status(404).json({ message: "No images found for this trip" });
        }

        // Create an array to hold image information
        const imageInfo = tripImages.map((tripImage) => {
            return {
                image_id: tripImage.image_id,
                trip_id: tripImage.trip_id,
                image_url: `/api/trips/trip-images/${tripImage.image_id}` // URL to fetch the image
            };
        });

        // Return the array of image information
        res.status(200).json(imageInfo);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const deleteTripImage = async (req, res) => {
    const imageId = req.params.imageId; // Extract the image ID from request parameters

    try {
        // Find the image by its ID
        const image = await TripImages.findByPk(imageId);

        // Check if the image exists
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Delete the image
        await image.destroy();

        res.status(200).json({ message: "Image deleted successfully" });
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
    deleteTrip,
    downloadTripData,
    createTripImage,
    getTripImage,
    getImagesByTripId,
    deleteTripImage
};
