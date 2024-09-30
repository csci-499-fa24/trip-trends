require('dotenv').config();
const User = require('../models/User');
const { createUser } = require('../controllers/UserController');

// mock User model
jest.mock('../models/user');

describe('createUser', () => {
    let mockRequest;
    let mockResponse;
    
    // set up fresh mock reques and response objects before each test
    beforeEach(() => {
        mockRequest = {
            body: {}
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

    test('should create new user and return 201 status', async () => {
        // mock request body
        const inputUser = { 
            fname: 'Baby', 
            lname: 'Doe', 
            email: 'baby.doe@example.com', 
            image: 'image.jpg' 
        };
        const createdUser = { user_id: '155', ...inputUser };
        mockRequest.body = inputUser;
        // mock User.create method to resolve with createdUser
        User.create.mockResolvedValue(createdUser);

        await createUser(mockRequest, mockResponse);

        expect(User.create).toHaveBeenCalledWith(inputUser);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: createdUser });
    });

    test('should handle errors and return 500 status', async () => {
        const error = new Error('Validation error');
        User.create.mockRejectedValue(error);

        await createUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Internal Server Error',
            error: error.message
        });
    });
});
