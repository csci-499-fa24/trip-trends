require('dotenv').config({ path: 'server/.env' });
const User = require('../models/User');
const { getUsers, getUserById, updateUser, deleteUser, createGoogleUser } = require('../controllers/UserController');
const jwt = require('jsonwebtoken');

// Mock User model
jest.mock('../models/User');
console.error = jest.fn(); // Suppress error logs

describe('User Controller', () => {
    let mockRequest, mockResponse;
    
    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
        console.error = jest.fn(); // suppress error logs
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all users on GET /users', async () => {
        const mockUsers = [{ user_id: 1, fname: 'Santa', lname: 'Claus' }];
        User.findAll.mockResolvedValue(mockUsers);

        await getUsers(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUsers });
    });

    it('should return a specific user on GET /users/:userId', async () => {
        const mockUser = { user_id: 1, fname: 'Santa', lname: 'Claus' };
        User.findByPk.mockResolvedValue(mockUser);
        mockRequest.params.userId = '1'; // Set the userId parameter

        await getUserById(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUser });
    });

    it('should return 404 if user not found on GET /users/:userId', async () => {
        User.findByPk.mockResolvedValue(null);
        mockRequest.params.userId = '1'; // Set the userId parameter

        await getUserById(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it('should update user and return the updated user data', async () => {
        const userId = '1';
        const mockUpdatedUser = { user_id: userId, fname: 'Santa', lname: 'Claus', email: 'santa.claus@example.com', image: 'http://example.com/pic.jpg' };
    
        // Mock request and response
        mockRequest.params.userId = userId; // Set userId parameter
        mockRequest.body = { fname: 'Santa', lname: 'Claus', email: 'santa.claus@example.com', image: 'http://example.com/pic.jpg' };
    
        User.findByPk.mockResolvedValue({
            update: jest.fn().mockResolvedValue(mockUpdatedUser) // Mock the update method
        });
    
        await updateUser(mockRequest, mockResponse);
    
        expect(User.findByPk).toHaveBeenCalledWith(userId); // Check if the user was found by ID
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockUpdatedUser }); // Check if the response is correct
    });
    
    it('should return 404 if user not found', async () => {
        const userId = '1';
        mockRequest.params.userId = userId; // Set userId parameter
    
        User.findByPk.mockResolvedValue(null); // Simulate user not found
    
        await updateUser(mockRequest, mockResponse);
    
        expect(mockResponse.status).toHaveBeenCalledWith(404); // Check if the correct status is returned
        expect(mockResponse.json).not.toHaveBeenCalled(); // Ensure no JSON response is sent
    });
    
    it('should return 500 if there is an error', async () => {
        const userId = '1';
        mockRequest.params.userId = userId; // Set userId parameter
        mockRequest.body = { fname: 'Santa', lname: 'Claus', email: 'santa.claus@example.com', image: 'http://example.com/pic.jpg' };
    
        User.findByPk.mockResolvedValue({
            update: jest.fn().mockRejectedValue(new Error('Database error')) // Simulate an error during update
        });
    
        await updateUser(mockRequest, mockResponse);
    
        expect(mockResponse.status).toHaveBeenCalledWith(500); // Check if the correct status is returned
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Internal Server Error", error: 'Database error' }); // Ensure correct error response
    });    

    it('should delete a user on DELETE /users/:userId', async () => {
        User.destroy.mockResolvedValue(1); // Mock user deletion
        mockRequest.params.userId = '1'; // Set the userId parameter

        await deleteUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if user not found on DELETE /users/:userId', async () => {
        User.destroy.mockResolvedValue(0); // No user deleted
        mockRequest.params.userId = '1'; // Set the userId parameter

        await deleteUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it('should return existing user if already present on POST /users/google', async () => {
        const mockDecodedToken = {
            email: 'santa.claus@example.com',
            name: 'Santa Claus',
            picture: 'http://example.com/pic.jpg',
        };

        jest.spyOn(jwt, 'decode').mockReturnValue(mockDecodedToken);
        const mockExistingUser = { user_id: 1, fname: 'Santa', lname: 'Claus', email: 'santa.claus@example.com', image: mockDecodedToken.picture };
        User.findOne.mockResolvedValue(mockExistingUser); // Simulating an existing user

        mockRequest.body.token = 'your_test_token'; // Set token in request body

        await createGoogleUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User Already Exists', user: mockExistingUser });
    });

    it('should create a new user if not present on POST /users/google', async () => {
        const mockDecodedToken = {
            email: 'mrs.claus@example.com',
            name: 'Mrs Claus',
            picture: 'http://example.com/mrsclaus-pic.jpg',
        };

        jest.spyOn(jwt, 'decode').mockReturnValue(mockDecodedToken);
        User.findOne.mockResolvedValue(null); // Simulating no existing user

        const mockNewUser = { user_id: 2, fname: 'Mrs', lname: 'Claus', email: 'mrs.claus@example.com', image: mockDecodedToken.picture };
        User.create.mockResolvedValue(mockNewUser); // Simulating a new user being created

        mockRequest.body.token = 'your_test_token'; // Set token in request body

        await createGoogleUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User created successfully', user: mockNewUser });
    });

    it('should handle errors on POST /users/google', async () => {
        User.findOne.mockRejectedValue(new Error('Database error')); // Simulate database error

        mockRequest.body.token = 'token'; // Set token in request body

        await createGoogleUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error processing request' });
    });
});