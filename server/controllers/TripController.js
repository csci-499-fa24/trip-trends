require('dotenv').config({ path: 'server/.env' });
const request = require('supertest');
const express = require('express');
const { Sequelize } = require('sequelize');
const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');
const Expense = require('../models/Expense');
const tripController = require('../controllers/TripController');

// Mock models
jest.mock('../models/Trip');
jest.mock('../models/SharedTrip');
jest.mock('../models/Expense');

const app = express();
app.use(express.json());

// Define routes for testing
app.post('/trips/:userId', tripController.createTrip);
app.get('/trips', tripController.getTrips);
app.get('/trips/user/:userId', tripController.getTripsByUserId);
app.get('/trips/:tripId', tripController.getTripById);
app.put('/trips/:tripId', tripController.updateTrip);
app.delete('/trips/:tripId', tripController.deleteTrip);
app.get('/trips/download/:tripId', tripController.downloadTripData);

const sequelize = new Sequelize('sqlite::memory:');

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Create tables for testing
});

beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
});

// Test for creating a new trip
test('POST /trips/:userId should create a new trip', async () => {
    const mockNewTrip = {
        trip_id: 1,
        name: 'Summer Vacation',
        start_date: '2024-07-01',
        end_date: '2024-07-10',
        budget: 1000,
        image: 'image_url',
    };

    Trip.create.mockResolvedValue(mockNewTrip);
    SharedTrip.create.mockResolvedValue({}); // Simulate successful relationship creation

    const userId = 1;
    const response = await request(app)
        .post(`/trips/${userId}`)
        .send(mockNewTrip);

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(mockNewTrip);
});

// Test for getting all trips
test('GET /trips should return all trips', async () => {
    const mockTrips = [
        { trip_id: 1, name: 'Trip 1' },
        { trip_id: 2, name: 'Trip 2' },
    ];

    Trip.findAll.mockResolvedValue(mockTrips);

    const response = await request(app).get('/trips');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockTrips);
});

// Test for getting trips by user ID
test('GET /trips/user/:userId should return trips for a specific user', async () => {
    const userId = 1;
    const mockSharedTrips = [
        { trip_id: 1, user_id: userId },
        { trip_id: 2, user_id: userId },
    ];
    const mockTrips = [
        { trip_id: 1, name: 'Trip 1' },
        { trip_id: 2, name: 'Trip 2' },
    ];

    SharedTrip.findAll.mockResolvedValue(mockSharedTrips);
    Trip.findAll.mockResolvedValue(mockTrips);

    const response = await request(app).get(`/trips/user/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockTrips);
});

// Test for getting a specific trip by trip ID
test('GET /trips/:tripId should return a specific trip', async () => {
    const tripId = 1;
    const mockTrip = { trip_id: tripId, name: 'Trip 1' };

    Trip.findByPk.mockResolvedValue(mockTrip);

    const response = await request(app).get(`/trips/${tripId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockTrip);
});

// Test for updating a trip
test('PUT /trips/:tripId should update a trip', async () => {
    const tripId = 1;
    const updatedTripData = {
        name: 'Updated Trip',
        start_date: '2024-07-01',
        end_date: '2024-07-10',
        budget: 1200,
        image: 'new_image_url',
    };
    const mockUpdatedTrip = { trip_id: tripId, ...updatedTripData };

    Trip.findByPk.mockResolvedValue({
        update: jest.fn().mockResolvedValue(mockUpdatedTrip),
    });

    const response = await request(app)
        .put(`/trips/${tripId}`)
        .send(updatedTripData);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockUpdatedTrip);
});

// Test for deleting a trip
test('DELETE /trips/:tripId should delete a trip', async () => {
    const tripId = 1;

    Trip.destroy.mockResolvedValue(1); // Simulate successful deletion

    const response = await request(app).delete(`/trips/${tripId}`);

    expect(response.status).toBe(204);
});

// Test for downloading trip data as CSV
test('GET /trips/download/:tripId should download trip data as CSV', async () => {
    const tripId = 1;
    const mockTrip = {
        trip_id: tripId,
        name: 'Trip 1',
        start_date: '2024-07-01',
        end_date: '2024-07-10',
        budget: 1000,
        image: 'image_url',
    };
    const mockExpenses = [
        { name: 'Expense 1', amount: 100, category: 'Food', currency: 'USD', posted: new Date(), notes: 'Dinner' },
        { name: 'Expense 2', amount: 50, category: 'Transport', currency: 'USD', posted: new Date(), notes: 'Taxi' },
    ];

    Trip.findByPk.mockResolvedValue(mockTrip);
    Expense.findAll.mockResolvedValue(mockExpenses);

    const response = await request(app).get(`/trips/download/${tripId}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toContain(`attachment; filename="${mockTrip.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv"`);
});

