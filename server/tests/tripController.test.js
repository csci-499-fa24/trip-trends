require('dotenv').config();
const { createTrip } = require('../controllers/TripController');
const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');

// mock Trip, SharedTrip models
jest.mock('../models/Trip');
jest.mock('../models/SharedTrip');


describe('createTrip', () => {
    let mockRequest, mockResponse;
    
    // set up fresh mock request and response objects before each test
    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        console.error = jest.fn(); // suppress error logs
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error.mockRestore();
    });

    it('should create new trip and return 201 status', async () => {
        const mockUserId = 'b3c249e7-26ae-4818-83de-ca8f5b4f4bb6';
        // mock request body
        const inputTrip = { 
            name: 'Paris', 
            start_date: '2024-08-01', 
            end_date: '2025-03-30', 
            budget: '123',
            image: 'image.jpg'
        };
        const createdTrip = { trip_id: '3333', ...inputTrip };
        mockRequest.body = inputTrip;
        mockRequest.params = { userId: mockUserId }; // set userId in request params

        // arrange
        Trip.create.mockResolvedValue(createdTrip); // mock Trip.create method to resolve with createdTrip
        SharedTrip.create.mockResolvedValue({ user_id: mockUserId, trip_id: createdTrip.trip_id }); // mock SharedTrip.create method to resolve with createdSharedTrip

        // act
        await createTrip(mockRequest, mockResponse); // call createTrip function

        // assert
        expect(Trip.create).toHaveBeenCalledWith(inputTrip); // check if Trip.create called with inputTrip
        expect(mockResponse.status).toHaveBeenCalledWith(201); // check for response 201
        expect(mockResponse.json).toHaveBeenCalledWith({ data: createdTrip }); // check reponse data
    });

    it('should handle errors and return 500 status', async () => {
        const error = new Error('Validation error');

        // arrange
        Trip.create.mockRejectedValue(error); // mock Trip.create to reject with error
    
        // act
        await createTrip(mockRequest, mockResponse); // call createTrip function

        // assert
        expect(Trip.create).toHaveBeenCalled(); // check Trip.create called
        expect(mockResponse.status).toHaveBeenCalledWith(500); // check for 500 status
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Internal Server Error',
            error: error.message
        }); // check for error response data
    });
});