// require('dotenv').config();
require('dotenv').config({ path: 'server/.env' });

const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { createUser, getUsers } = require('../controllers/UserController');

// mock User model
jest.mock('../models/User');

describe('getUsers', () => {
    let mockRequest, mockResponse;
    
    // set up fresh mock request and response objects before each test
    beforeEach(() => {
        mockRequest = {};
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

    it('should return a list of users and return 200 status', async () => {
        const mockUsers = [
            { user_id: uuidv4(), 
                fname: 'Baby', 
                lname: 'Doe', 
                email: 'babydoe99@aol.com', 
                image: null },
            { user_id: uuidv4(), 
                fname: 'Babe', 
                lname: 'Doe', 
                email: 'babedoe99@aol.com', 
                image: null },
        ];

        // arrange
        User.findAll.mockResolvedValue(mockUsers); // mock User.findAll method to return mock users

        // act
        await getUsers(mockRequest, mockResponse); // call getUsers function

        // assert
        expect(User.findAll).toHaveBeenCalled(); // check Users.findAll called
        expect(mockResponse.status).toHaveBeenCalledWith(200); // check for status 200
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUsers }); // check response data
    });
    
    it('should return 500 status on error', async () => {
        const error = new Error('Database error');

        // arrange
        User.findAll.mockRejectedValue(error); // mock User.findAll to reject with error

        // act
        await getUsers(mockRequest, mockResponse); // call getUsers function 

        // assert
        expect(User.findAll).toHaveBeenCalled(); // ensure User.findAll was called
        expect(mockResponse.status).toHaveBeenCalledWith(500); // check for status 500
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Internal Server Error',
            error: error.message,
        }); // check error response data
    });
});