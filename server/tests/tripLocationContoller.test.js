require('dotenv').config({ path: 'server/.env' });
const { createTripLocation,
        getTripLocations,
        getTripLocationByTripId,
        getTripLocationByUserId,
        updateTripLocation,
        deleteTripLocation,
        updateLocationsInEdit } = require('../controllers/TripLocationController');
const TripLocation = require('../models/TripLocation');
const SharedTrip = require('../models/SharedTrip');

// Mock Trip Location and Shared Trip models
jest.mock('../models/TripLocation');
jest.mock('../models/SharedTrip');

describe('TripLocation Controller', () => {
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

    // Test for creating a new trip location
    it('should create a new trip location and return 201 status', async () => {
        const trip_id = '1';
        const location = 'Paris';
        const newTripLocation = { trip_id, location };
        mockRequest.body = { trip_id, location };

        TripLocation.create.mockResolvedValue(newTripLocation);

        await createTripLocation(mockRequest, mockResponse);

        expect(TripLocation.create).toHaveBeenCalledWith(newTripLocation);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: newTripLocation });
    });

    // Test for getting all trip locations
    it('should get all trip locations and return 200 status', async () => {
        const mockTripLocations = [{ trip_id: '1', location: 'Paris' }];
        TripLocation.findAll.mockResolvedValue(mockTripLocations);

        await getTripLocations(mockRequest, mockResponse);

        expect(TripLocation.findAll).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockTripLocations });
    });

    // Test for getting trip location by tripId
    it('should get trip locations by tripId and return 200 status', async () => {
        const tripId = '1';
        const mockTripLocation = [{ trip_id: tripId, location: 'Paris' }];
        mockRequest.params.tripId = tripId;

        TripLocation.findAll.mockResolvedValue(mockTripLocation);

        await getTripLocationByTripId(mockRequest, mockResponse);

        expect(TripLocation.findAll).toHaveBeenCalledWith({ where: { trip_id: tripId } });
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockTripLocation });
    });

    it('should return 404 if no trip locations found for tripId', async () => {
        const tripId = '1';
        mockRequest.params.tripId = tripId;

        TripLocation.findAll.mockResolvedValue([]);

        await getTripLocationByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip Location not found" });
    });

    // Test for getting trip location by userId
    it('should get trip locations by userId and return 200 status', async () => {
        const userId = '1';
        const mockSharedTrips = [{ user_id: userId, trip_id: '1' }];
        const mockTripLocation = [{ trip_id: '1', location: 'Paris' }];
        mockRequest.params.userId = userId;

        SharedTrip.findAll.mockResolvedValue(mockSharedTrips);
        TripLocation.findAll.mockResolvedValue(mockTripLocation);

        await getTripLocationByUserId(mockRequest, mockResponse);

        expect(SharedTrip.findAll).toHaveBeenCalledWith({ where: { user_id: userId } });
        expect(TripLocation.findAll).toHaveBeenCalledWith({ where: { trip_id: ['1'] } });
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockTripLocation });
    });

    it('should return 404 if no shared trips found for userId', async () => {
        const userId = '1';
        mockRequest.params.userId = userId;

        SharedTrip.findAll.mockResolvedValue([]);

        await getTripLocationByUserId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip not found" });
    });

    it('should return 404 if no trip locations found for userId', async () => {
        const userId = '1';
        const mockSharedTrips = [{ user_id: userId, trip_id: '1' }];
        mockRequest.params.userId = userId;

        SharedTrip.findAll.mockResolvedValue(mockSharedTrips);
        TripLocation.findAll.mockResolvedValue([]);

        await getTripLocationByUserId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip locations not found" });
    });

    // Test for updating a trip location
    it('should update a trip location and return the updated location', async () => {
        const tripId = '1';
        const tripLocationId = '2';
        const updatedLocation = { location: 'Sylhet', longitude: '13.405', latitude: '52.52', currency_code: 'BDT' };
        mockRequest.params.tripId = tripId;
        mockRequest.params.tripLocationId = tripLocationId;
        mockRequest.body = updatedLocation;

        const existingTripLocation = { location: 'Paris', update: jest.fn().mockResolvedValue(updatedLocation) };
        TripLocation.findOne.mockResolvedValue(existingTripLocation);

        await updateTripLocation(mockRequest, mockResponse);

        expect(TripLocation.findOne).toHaveBeenCalledWith({ where: { trip_id: tripId, location: tripLocationId } });
        expect(existingTripLocation.update).toHaveBeenCalledWith(updatedLocation);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: updatedLocation });
    });

    it('should return 404 if trip location not found for update', async () => {
        const tripId = '1';
        const tripLocationId = '2';
        mockRequest.params.tripId = tripId;
        mockRequest.params.tripLocationId = tripLocationId;

        TripLocation.findOne.mockResolvedValue(null);

        await updateTripLocation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip location not found" });
    });

    // Test for deleting a trip location
    it('should delete a trip location and return 204 status', async () => {
        const tripId = '1';
        const tripLocationId = '2';
        mockRequest.params.tripId = tripId;
        mockRequest.params.tripLocationId = tripLocationId;

        TripLocation.destroy.mockResolvedValue(1); // Simulate successful deletion

        await deleteTripLocation(mockRequest, mockResponse);

        expect(TripLocation.destroy).toHaveBeenCalledWith({ where: { trip_id: tripId, location: tripLocationId } });
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 404 if trip location not found for deletion', async () => {
        const tripId = '1';
        const tripLocationId = '2';
        mockRequest.params.tripId = tripId;
        mockRequest.params.tripLocationId = tripLocationId;

        TripLocation.destroy.mockResolvedValue(0); // Simulate no trip location deleted

        await deleteTripLocation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip Location not found" });
    });

    it('should return 500 if there is an error', async () => {
        const tripId = '1';
        const tripLocationId = '2';
        mockRequest.params.tripId = tripId;
        mockRequest.params.tripLocationId = tripLocationId;

        TripLocation.destroy.mockRejectedValue(new Error('Database error')); // Simulate database error

        await deleteTripLocation(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Internal Server Error", error: 'Database error' });
    });

    it('should update multiple trip locations and return 200 status', async () => {
        const mockRequest = {
            body: {
                tripId: '1',
                locations: ['Paris', 'Berlin'] // specify test locations
            }
        };
        
        const mockResponse = {
            status: jest.fn(() => mockResponse),
            json: jest.fn()
        };

        TripLocation.findAll.mockResolvedValue([
            { trip_id: '1', location: 'Paris' },
            { trip_id: '1', location: 'London' }
        ]);

        TripLocation.destroy.mockResolvedValue(1); // simulates successful delete
        TripLocation.bulkCreate.mockResolvedValue([{ trip_id: '1', location: 'Berlin' }]);

        await updateLocationsInEdit(mockRequest, mockResponse);

        // console.log('TripLocation.findAll was called with:', TripLocation.findAll.mock.calls);

        expect(TripLocation.findAll).toHaveBeenCalledWith({
            where: { trip_id: '1' }
        });

        expect(TripLocation.destroy).toHaveBeenCalledWith({
            where: { trip_id: '1', location: ['London'] }
        });

        expect(TripLocation.bulkCreate).toHaveBeenCalledWith([
            { trip_id: '1', location: 'Berlin' }
        ]);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Locations updated successfully" });
    });
    
    it('should return 404 if no locations found for the trip during update', async () => {
        // Simulate no locations found for the given tripId
        TripLocation.findAll.mockResolvedValue([]);

        await updateLocationsInEdit(mockRequest, mockResponse);

        // Assert the 404 status and error message
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "No locations found for this trip",
        });
    });

    it('should return 500 if there is an error while updating locations', async () => {
        // Simulate an error during database operation
        TripLocation.findAll.mockRejectedValue(new Error('Database error'));

        await updateLocationsInEdit(mockRequest, mockResponse);

        // Assert the 500 status and error message
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Error updating locations",
            error: 'Database error',
        });
    });
});

