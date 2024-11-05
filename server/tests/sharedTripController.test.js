require('dotenv').config({ path: 'server/.env' });
const { createSharedTrip, 
        getSharedTrips, 
        getSharedTripsByUserId, 
        getSharedTripsByTripId, 
        deleteSharedTrip } = require('../controllers/SharedTripController');
const SharedTrip = require('../models/SharedTrip');
const User = require('../models/User');

// Mock SharedTrip model
jest.mock('../models/SharedTrip');
jest.mock('../models/User');

describe('SharedTrip Controller', () => {
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

    it('should return 400 if userId or tripId is missing', async () => {
        await createSharedTrip(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "userId and tripId are required" });
    });

    it('should return 403 if the current user is not the owner', async () => {
        mockRequest.params = { userId: '1', tripId: '3' };
        mockRequest.body = { email: 'user@example.com', role: 'editor' };

        SharedTrip.findOne.mockResolvedValueOnce({ user_id: '1', trip_id: '3', role: 'editor' });
        User.findOne.mockResolvedValue({ user_id: '2', email: 'user@example.com' });

        await createSharedTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "You do not have permission to share this trip" });
    });
    
    it('should return 404 if user to be added does not have email in database', async () => {
        mockRequest.params = { userId: '1', tripId: '3' };
        mockRequest.body = { email: 'user@example.com', role: 'editor' };

        SharedTrip.findOne.mockResolvedValueOnce({ user_id: '1', trip_id: '3', role: 'owner' });
        User.findOne.mockResolvedValueOnce(null);

        await createSharedTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "User with email not found" });
    });

    it('should update user role and return 200 status', async () => {
        mockRequest.params = { userId: '1', tripId: '3' };
        mockRequest.body = { email: 'user@example.com', role: 'editor' };

        SharedTrip.findOne.mockResolvedValueOnce({ user_id: '1', trip_id: '3', role: 'owner' });
        User.findOne.mockResolvedValueOnce({ user_id: '2', email: 'user@example.com' });
        SharedTrip.findOne.mockResolvedValueOnce({ user_id: '2', email: 'user@example.com', role: 'viewer' });
        SharedTrip.create.mockResolvedValue({ user_id: '2', trip_id: '3', role: 'editor' });

        await createSharedTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "User role updated" });
    });

    it('should create a new shared trip and return 201 status', async () => {
        mockRequest.params = { userId: '1', tripId: '3' };
        mockRequest.body = { email: 'user@example.com', role: 'editor' };

        SharedTrip.findOne.mockResolvedValueOnce({ user_id: '1', trip_id: '3', role: 'owner' });
        User.findOne.mockResolvedValueOnce({ user_id: '2', email: 'user@example.com' });
        SharedTrip.findOne.mockResolvedValueOnce(null);
        SharedTrip.create.mockResolvedValue({ user_id: '2', trip_id: '3', role: 'editor' });

        await createSharedTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: { user_id: '2', trip_id: '3', role: 'editor' } });
    });

    it('should get all shared trips', async () => {
        const mockSharedTrips = [{ user_id: '1', trip_id: '2' }];
        SharedTrip.findAll.mockResolvedValue(mockSharedTrips);

        await getSharedTrips(mockRequest, mockResponse);

        expect(SharedTrip.findAll).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockSharedTrips });
    });

    it('should get shared trips by userId', async () => {
        const userId = '1';
        const mockSharedTrips = [{ user_id: userId, trip_id: '2' }];
        mockRequest.params.userId = userId;

        SharedTrip.findAll.mockResolvedValue(mockSharedTrips);

        await getSharedTripsByUserId(mockRequest, mockResponse);

        expect(SharedTrip.findAll).toHaveBeenCalledWith({ where: { user_id: userId } });
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockSharedTrips });
    });

    it('should return 404 if no shared trips found for userId', async () => {
        const userId = '1';
        mockRequest.params.userId = userId;

        SharedTrip.findAll.mockResolvedValue([]);

        await getSharedTripsByUserId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Shared Trip not found" });
    });

    it('should get shared trips by tripId', async () => {
        const tripId = '2';
        const mockSharedTrips = [{
            user_id: '1', 
            trip_id: tripId, 
            user: { 
                user_id: '1', 
                fname: 'John', 
                lname: 'Doe', 
                email: 'john@example.com', 
                image: 'user-image-url' 
            },
            role: 'collaborator' 
        }];
        
        mockRequest.params.tripId = tripId;
        SharedTrip.findAll.mockResolvedValue(mockSharedTrips);
    
        await getSharedTripsByTripId(mockRequest, mockResponse);
    
        expect(SharedTrip.findAll).toHaveBeenCalledWith({
            where: { trip_id: tripId },
            include: [{
                model: User,
                attributes: ['user_id', 'fname', 'lname', 'email', 'image'],
                as: 'user'
            }]
        });
        
        const expectedResult = mockSharedTrips.map(sharedTrip => ({
            user_id: sharedTrip.user.user_id,
            fname: sharedTrip.user.fname,
            lname: sharedTrip.user.lname,
            email: sharedTrip.user.email,
            image: sharedTrip.user.image,
            role: sharedTrip.role
        }));
    
        expect(mockResponse.json).toHaveBeenCalledWith({ data: expectedResult });
    });

    it('should return 404 if no shared trips found for tripId', async () => {
        const tripId = '2';
        mockRequest.params.tripId = tripId;

        SharedTrip.findAll.mockResolvedValue([]);

        await getSharedTripsByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Shared Trip not found" });
    });

    it('should delete a shared trip and return 204 status', async () => {
        const userId = '1';
        const tripId = '2';
        mockRequest.params.userId = userId;
        mockRequest.params.tripId = tripId;

        SharedTrip.destroy.mockResolvedValue(1); // Simulating successful deletion

        await deleteSharedTrip(mockRequest, mockResponse);

        expect(SharedTrip.destroy).toHaveBeenCalledWith({ where: { user_id: userId, trip_id: tripId } });
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if shared trip not found for deletion', async () => {
        const userId = '1';
        const tripId = '2';
        mockRequest.params.userId = userId;
        mockRequest.params.tripId = tripId;

        SharedTrip.destroy.mockResolvedValue(0); // Simulating no shared trip deleted

        await deleteSharedTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Shared trip not found" });
    });

    it('should return 500 if there is an error', async () => {
        const userId = '1';
        const tripId = '2';
        mockRequest.params.userId = userId;
        mockRequest.params.tripId = tripId;

        SharedTrip.destroy.mockRejectedValue(new Error('Database error')); // Simulate database error

        await deleteSharedTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Internal Server Error", error: 'Database error' });
    });
});
