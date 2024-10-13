require('dotenv').config({ path: 'server/.env' });
const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');
const Expense = require('../models/Expense');
const { 
    createTrip,
    getTrips, 
    getTripsByUserId, 
    getTripById, 
    updateTrip, 
    deleteTrip, 
    downloadTripData 
} = require('../controllers/TripController');

// mock Trip, SharedTrip, Expense models
jest.mock('../models/Trip');
jest.mock('../models/SharedTrip');
jest.mock('../models/Expense');

describe('Trip Controller', () => {
    let mockRequest, mockResponse;
    
    // set up fresh mock request and response objects before each test
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
        const createdTrip = { trip_id: '1234', ...inputTrip };
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

    it('should return all trips and a 200 status', async () => {
        const allTrips = [
            { trip_id: '1', name: 'Trip 1', start_date: '2024-01-01', end_date: '2024-01-10', budget: 1000, image: 'image1.jpg' },
            { trip_id: '2', name: 'Trip 2', start_date: '2024-02-01', end_date: '2024-02-10', budget: 1500, image: 'image2.jpg' }
        ];
        Trip.findAll.mockResolvedValue(allTrips);

        await getTrips(mockRequest, mockResponse);

        expect(Trip.findAll).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: allTrips });
    });

    it('should return trips for the given user ID', async () => {
        const mockUserId = 'b3c249e7-26ae-4818-83de-ca8f5b4f4bb6';
        mockRequest.params = { userId: mockUserId };

        const sharedTrips = [{ user_id: mockUserId, trip_id: '1' }, { user_id: mockUserId, trip_id: '2' }];
        const trips = [
            { trip_id: '1', name: 'Trip 1', start_date: '2024-01-01', end_date: '2024-01-10', budget: 1000, image: 'image1.jpg' },
            { trip_id: '2', name: 'Trip 2', start_date: '2024-02-01', end_date: '2024-02-10', budget: 1500, image: 'image2.jpg' }
        ];

        SharedTrip.findAll.mockResolvedValue(sharedTrips);
        Trip.findAll.mockResolvedValue(trips);

        await getTripsByUserId(mockRequest, mockResponse);

        expect(SharedTrip.findAll).toHaveBeenCalledWith({ where: { user_id: mockUserId } });
        expect(Trip.findAll).toHaveBeenCalledWith({ where: { trip_id: ['1', '2'] } });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: trips });
    });

    it('should return a trip by tripId and a 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };

        const trip = { trip_id: mockTripId, name: 'Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '123', image: 'image.jpg' };
        Trip.findByPk.mockResolvedValue(trip);

        await getTripById(mockRequest, mockResponse);

        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: trip });
    });

    it('should update trip data and return 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
        const updatedData = { name: 'New Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '150', image: 'new_image.jpg' };
        const updatedTrip = { trip_id: mockTripId, ...updatedData };
        
        mockRequest.body = updatedData;

        Trip.findByPk.mockResolvedValue({ update: jest.fn().mockResolvedValue(updatedTrip) });

        await updateTrip(mockRequest, mockResponse);

        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: updatedTrip });
    });

    it('should delete a trip and return 204 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
    
        Trip.destroy.mockResolvedValue(1);
    
        await deleteTrip(mockRequest, mockResponse);
    
        expect(Trip.destroy).toHaveBeenCalledWith({ where: { trip_id: mockTripId } });
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 404 status when deleting a non-existent trip', async () => {
        const mockTripId = 'non-existent-id';
        mockRequest.params = { tripId: mockTripId };

        Trip.destroy.mockResolvedValue(0); // Simulate no deletion (trip not found)

        await deleteTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip not found" });
    });

    it('should download trip data as CSV and return 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
    
        const trip = { trip_id: mockTripId, name: 'Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '123', image: 'image.jpg' };
        const expenses = [
            { name: 'Flight', amount: 300, category: 'Travel', currency: 'USD', posted: '2024-08-01', notes: 'Flight to Paris' },
            { name: 'Hotel', amount: 700, category: 'Accommodation', currency: 'USD', posted: '2024-08-02', notes: 'Hotel in Paris' }
        ];
    
        Trip.findByPk.mockResolvedValue(trip);
        Expense.findAll.mockResolvedValue(expenses);
    
        // Mocking the response methods
        mockResponse.setHeader = jest.fn();
        mockResponse.status = jest.fn().mockReturnValue(mockResponse); // to allow chaining
        mockResponse.send = jest.fn(); // Mock the send method
    
        await downloadTripData(mockRequest, mockResponse);
    
        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(Expense.findAll).toHaveBeenCalledWith({ where: { trip_id: mockTripId } });
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename=trip_${mockTripId}.csv`);
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    
        // Get the actual CSV output for comparison
        const actualCSVOutput = mockResponse.send.mock.calls[0][0];
    
        // Adjust the expected CSV to match the format generated by `parse`
        const expectedCSV = `"name\",\"start_date\",\"end_date\",\"budget\",\"image\"\n\"Paris\",\"2024-08-01\",\"2025-03-30\",\"123\",\"image.jpg\"\n\nExpense Data:\n\"name\",\"amount\",\"category\",\"currency\",\"posted\",\"notes\"\n\"Flight\",300,\"Travel\",\"USD\",\"2024-08-01\",\"Flight to Paris\"\n\"Hotel\",700,\"Accommodation\",\"USD\",\"2024-08-02\",\"Hotel in Paris"`;
    
        // This is the crucial part where we compare the actual and expected outputs
        expect(mockResponse.send).toHaveBeenCalledWith(expectedCSV);
    });     
    
    it('should return 404 status when downloading non-existent trip data', async () => {
        const mockTripId = 'non-existent-id';
        mockRequest.params = { tripId: mockTripId };

        Trip.findByPk.mockResolvedValue(null); // Simulate trip not found

        await downloadTripData(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip not found" });
    });

    it('should return 400 status for invalid date range', async () => {
        const mockUserId = 'b3c249e7-26ae-4818-83de-ca8f5b4f4bb6';
        mockRequest.params = { userId: mockUserId }; // set userId in request params

        mockRequest.body = {
            name: 'Paris',
            start_date: '2025-03-10',
            end_date: '2024-08-01',
            budget: '123',
            image: 'image.jpg'
        };
        
        const validationError = new Error('Start date cannot be after end date.');
        validationError.name = 'SequelizeValidationError';

        // arrange
        Trip.create.mockRejectedValue(validationError);

        // act
        await createTrip(mockRequest, mockResponse); // call createTrip function

        // assert
        expect(mockResponse.status).toHaveBeenCalledWith(400); // check for 400 status
        expect(mockResponse.json).toHaveBeenCalledWith({ 
            message: 'Validation Error',
            error: 'Start date cannot be after end date.',
        }); // check response message
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