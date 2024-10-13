require('dotenv').config({ path: 'server/.env' });
const User = require('../models/User');
const request = require('supertest');
const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser, createGoogleUser } = require('../controllers/UserController');
const jwt = require('jsonwebtoken');

// mock User model
jest.mock('../models/User');
console.error = jest.fn(); // suppress error logs

const app = express();
app.use(express.json());
app.get('/users', getUsers);
app.get('/users/:userId', getUserById);
app.put('/users/:userId', updateUser);
app.delete('/users/:userId', deleteUser);
app.post('/users/google', createGoogleUser);

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /users should return all users', async () => {
        const mockUsers = [{ user_id: 1, fname: 'John', lname: 'Doe' }];
        User.findAll.mockResolvedValue(mockUsers);

        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: mockUsers });
    });

    test('GET /users/:userId should return a specific user', async () => {
        const mockUser = { user_id: 1, fname: 'John', lname: 'Doe' };
        User.findByPk.mockResolvedValue(mockUser);

        const response = await request(app).get('/users/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: mockUser });
    });

    test('GET /users/:userId should return 404 if user not found', async () => {
        User.findByPk.mockResolvedValue(null);

        const response = await request(app).get('/users/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "User not found" });
    });

    test('DELETE /users/:userId should delete a user', async () => {
        User.destroy.mockResolvedValue(1); // Mock user deletion

        const response = await request(app).delete('/users/1');

        expect(response.status).toBe(204);
    });

    test('DELETE /users/:userId should return 404 if user not found', async () => {
        User.destroy.mockResolvedValue(0); // No user deleted

        const response = await request(app).delete('/users/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "User not found" });
    });

    test('POST /users/google should return existing user if already present', async () => {
        // Mocking the decoded token data
        const mockDecodedToken = {
            email: 'john.doe@example.com',
            name: 'John Doe',
            picture: 'http://example.com/pic.jpg',
        };

        // Mocking jwt.decode to return the mock decoded token
        jest.spyOn(jwt, 'decode').mockReturnValue(mockDecodedToken);

        // Mocking the existing user in the database
        const mockExistingUser = { user_id: 1, fname: 'John', lname: 'Doe', email: 'john.doe@example.com', image: mockDecodedToken.picture };
        User.findOne.mockResolvedValue(mockExistingUser); // Simulating an existing user

        // Create a valid token for testing
        const token = 'your_test_token'; // Replace with actual token string used in production

        // Send the request with the token
        const response = await request(app).post('/users/google').send({ token });

        // Assert the response status and body
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'User Already Exists', user: mockExistingUser });
    });

    test('POST /users/google should create a new user if not present', async () => {
        // Mocking the decoded token data
        const mockDecodedToken = {
            email: 'jane.doe@example.com',
            name: 'Jane Doe',
            picture: 'http://example.com/jane-pic.jpg',
        };

        // Mocking jwt.decode to return the mock decoded token
        jest.spyOn(jwt, 'decode').mockReturnValue(mockDecodedToken);

        // Mocking User.findOne to return null to simulate user not found
        User.findOne.mockResolvedValue(null); // Simulating no existing user

        // Mocking User.create to simulate user creation
        const mockNewUser = { user_id: 2, fname: 'Jane', lname: 'Doe', email: 'jane.doe@example.com', image: mockDecodedToken.picture };
        User.create.mockResolvedValue(mockNewUser); // Simulating a new user being created

        // Create a valid token for testing
        const token = 'your_test_token'; // Replace with actual token string used in production

        // Send the request with the token
        const response = await request(app).post('/users/google').send({ token });

        // Assert the response status and body
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'User created successfully', user: mockNewUser });
    });

    test('POST /users/google should handle errors', async () => {
        User.findOne.mockRejectedValue(new Error('Database error')); // Simulate database error

        const response = await request(app).post('/users/google').send({ token: 'token' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error processing request' });
    });
});