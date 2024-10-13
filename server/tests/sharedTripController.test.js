require('dotenv').config({ path: 'server/.env' });
const { createSharedTrip, 
        getSharedTrips, 
        getSharedTripsByUserId, 
        getSharedTripsByTripId, 
        deleteSharedTrip } = require('../controllers/SharedTripController');
const SharedTrip = require('../models/SharedTrip');

// Mock SharedTrip model
jest.mock('../models/SharedTrip');

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

    it('should create a new shared trip and return 201 status', async () => {
        const userId = '1';
        const tripId = '2';
        const newSharedTrip = { user_id: userId, trip_id: tripId };
        mockRequest.params.userId = userId;
        mockRequest.params.tripId = tripId;

        SharedTrip.create.mockResolvedValue(newSharedTrip);

        await createSharedTrip(mockRequest, mockResponse);

        expect(SharedTrip.create).toHaveBeenCalledWith(newSharedTrip);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: newSharedTrip });
    });

    it('should return 400 if userId or tripId is missing', async () => {
        await createSharedTrip(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "userId, tripId required" });
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
        const mockSharedTrips = [{ user_id: '1', trip_id: tripId }];
        mockRequest.params.tripId = tripId;

        SharedTrip.findAll.mockResolvedValue(mockSharedTrips);

        await getSharedTripsByTripId(mockRequest, mockResponse);

        expect(SharedTrip.findAll).toHaveBeenCalledWith({ where: { trip_id: tripId } });
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockSharedTrips });
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