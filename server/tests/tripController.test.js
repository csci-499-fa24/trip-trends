require('dotenv').config({ path: 'server/.env' });
const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');
const Expense = require('../models/Expense');
const TripImages = require('../models/TripImages');
const {
    createTrip,
    getTrips,
    getTripsByUserId,
    getTripById,
    updateTrip,
    deleteTrip,
    downloadTripData,
    createTripImage,
    getTripImage,
    getImagesByTripId,
    deleteTripImage
} = require('../controllers/TripController');

// mock Trip, SharedTrip, Expense models
jest.mock('../models/Trip');
jest.mock('../models/SharedTrip');
jest.mock('../models/Expense');
jest.mock('../models/TripImages');
jest.mock('pdfkit', () => {
    return jest.fn().mockImplementation(() => ({
        pipe: jest.fn(),
        end: jest.fn(),
        fontSize: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
    }));
});

describe('Trip Controller', () => {
    let mockRequest, mockResponse;

    // set up fresh mock request and response objects before each test
    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {},
            files: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
            type: jest.fn().mockReturnThis(),
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
            { trip_id: '1', name: 'Trip 1', start_date: '2024-01-01', end_date: '2024-01-10', budget: 1000 },
            { trip_id: '2', name: 'Trip 2', start_date: '2024-02-01', end_date: '2024-02-10', budget: 1500 }
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
            { trip_id: '1', name: 'Trip 1', start_date: '2024-01-01', end_date: '2024-01-10', budget: 1000 },
            { trip_id: '2', name: 'Trip 2', start_date: '2024-02-01', end_date: '2024-02-10', budget: 1500 }
        ];

        SharedTrip.findAll.mockResolvedValue(sharedTrips);
        Trip.findAll.mockResolvedValue(trips);

        await getTripsByUserId(mockRequest, mockResponse);

        expect(SharedTrip.findAll).toHaveBeenCalledWith({
            where: { user_id: mockUserId },
            order: [['favorite', 'DESC']] 
        });
        expect(Trip.findAll).toHaveBeenCalledWith({ where: { trip_id: ['1', '2'] } });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: trips });
    });

    it('should return a trip by tripId and a 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };

        const trip = { trip_id: mockTripId, name: 'Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '123' };
        Trip.findByPk.mockResolvedValue(trip);

        await getTripById(mockRequest, mockResponse);

        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: trip });
    });

    it('should update trip data and return 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
        const updatedData = { name: 'New Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '150' };
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

        Trip.destroy.mockResolvedValue(0);

        await deleteTrip(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip not found" });
    });

    it('should download trip data as CSV and return 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
        mockRequest.query = { format: 'csv' };
    
        const trip = { trip_id: mockTripId, name: 'Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '123' };
        const expenses = [
            { name: 'Flight', amount: 300, category: 'Travel', currency: 'USD', posted: '2024-08-01', notes: 'Flight to Paris' },
            { name: 'Hotel', amount: 700, category: 'Accommodation', currency: 'USD', posted: '2024-08-02', notes: 'Hotel in Paris' }
        ];
        const filename = trip.name;
    
        Trip.findByPk.mockResolvedValue(trip);
        Expense.findAll.mockResolvedValue(expenses);
    
        mockResponse.setHeader = jest.fn();
        mockResponse.status = jest.fn().mockReturnValue(mockResponse);
        mockResponse.send = jest.fn();
    
        await downloadTripData(mockRequest, mockResponse);
    
        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(Expense.findAll).toHaveBeenCalledWith({ where: { trip_id: mockTripId } });
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename=${filename}.csv`);
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(expect.stringContaining('Expense Data:'));
    });
    
    it('should download trip data as PDF and return 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
        mockRequest.query = { format: 'pdf' };
    
        const trip = { trip_id: mockTripId, name: 'Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '123' };
        const expenses = [
            { name: 'Flight', amount: 300, category: 'Travel', currency: 'USD', posted: '2024-08-01', notes: 'Flight to Paris' },
            { name: 'Hotel', amount: 700, category: 'Accommodation', currency: 'USD', posted: '2024-08-02', notes: 'Hotel in Paris' }
        ];
        const filename = trip.name;
    
        Trip.findByPk.mockResolvedValue(trip);
        Expense.findAll.mockResolvedValue(expenses);
    
        mockResponse.setHeader = jest.fn();
        mockResponse.status = jest.fn().mockReturnValue(mockResponse);
        mockResponse.send = jest.fn();
    
        await downloadTripData(mockRequest, mockResponse);
    
        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(Expense.findAll).toHaveBeenCalledWith({ where: { trip_id: mockTripId } });
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename=${filename}.pdf`);
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    });      

    it('should generate and send an XML with trip and expense data for valid tripId and return 200 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
        mockRequest.query = { format: 'xml' };
    
        const trip = { trip_id: mockTripId, name: 'Paris', start_date: '2024-08-01', end_date: '2025-03-30', budget: '1000' };
        const expenses = [
            { name: 'Flight', amount: 300, category: 'Travel', currency: 'USD', posted: '2024-08-01', notes: 'Flight to Paris' },
            { name: 'Hotel', amount: 700, category: 'Accommodation', currency: 'USD', posted: '2024-08-02', notes: 'Hotel in Paris' }
        ];
        const filename = trip.name;
    
        Trip.findByPk.mockResolvedValue(trip);
        Expense.findAll.mockResolvedValue(expenses);
    
        mockResponse.setHeader = jest.fn();
        mockResponse.status = jest.fn().mockReturnValue(mockResponse);
        mockResponse.send = jest.fn();
    
        await downloadTripData(mockRequest, mockResponse);
    
        expect(Trip.findByPk).toHaveBeenCalledWith(mockTripId);
        expect(Expense.findAll).toHaveBeenCalledWith({ where: { trip_id: mockTripId } });
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename=${filename}.xml`);
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(expect.stringContaining('<trip>'));
    });

    it('should return 404 status when downloading non-existent trip data', async () => {
        const mockTripId = 'non-existent-id';
        mockRequest.params = { tripId: mockTripId };
        mockRequest.query = { format: 'csv' };
    
        Trip.findByPk.mockResolvedValue(null); 
    
        await downloadTripData(mockRequest, mockResponse);
    
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip not found" });
    });
    

    it('should upload multiple images successfully', async () => {
        const tripId = '1';
        const mockImages = [
            { data: Buffer.from('image1'), mimetype: 'image/jpeg' },
            { data: Buffer.from('image2'), mimetype: 'image/jpeg' }
        ];

        mockRequest.params.tripId = tripId;
        mockRequest.files.images = mockImages;

        const createdTripImage = { trip_id: tripId, image: 'mockImage' };
        TripImages.create.mockResolvedValue(createdTripImage); // Mock TripImages.create method

        await createTripImage(mockRequest, mockResponse); // Call createTripImage function

        expect(mockResponse.status).toHaveBeenCalledWith(201); // Check for response 201
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'Images uploaded successfully',
            data: expect.arrayContaining([
                expect.objectContaining(createdTripImage),
                expect.objectContaining(createdTripImage),
            ]),
        });
        expect(TripImages.create).toHaveBeenCalledTimes(2); // Verify that create was called twice
    });

    it('should return 400 if no images are uploaded', async () => {
        mockRequest.params.tripId = '1'; // Set tripId in request params

        await createTripImage(mockRequest, mockResponse); // Call createTripImage function

        expect(mockResponse.status).toHaveBeenCalledWith(400); // Check for response 400
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "No image files uploaded" });
    });

    it('should handle internal server error', async () => {
        const tripId = '1';
        const mockImages = [{ data: Buffer.from('image1'), mimetype: 'image/jpeg' }];
        mockRequest.params.tripId = tripId;
        mockRequest.files.images = mockImages;

        TripImages.create.mockRejectedValue(new Error('Database error')); // Mock error

        await createTripImage(mockRequest, mockResponse); // Call createTripImage function

        expect(mockResponse.status).toHaveBeenCalledWith(500); // Check for response 500
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Internal Server Error",
            error: 'Database error',
        });
    });

    it('should handle successful image upload', async () => {
        const tripId = '1';
        const mockImages = [
            { data: Buffer.from('image1'), mimetype: 'image/jpeg' },
            { data: Buffer.from('image2'), mimetype: 'image/jpeg' }
        ];

        mockRequest.params.tripId = tripId;
        mockRequest.files.images = mockImages;

        const createdTripImages = mockImages.map((_, index) => ({
            trip_id: tripId,
            image: `mockImage${index + 1}` // Generate a mock image response
        }));

        TripImages.create.mockResolvedValueOnce(createdTripImages[0]); // First image
        TripImages.create.mockResolvedValueOnce(createdTripImages[1]); // Second image

        await createTripImage(mockRequest, mockResponse); // Call createTripImage function

        expect(mockResponse.status).toHaveBeenCalledWith(201); // Check for response 201
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'Images uploaded successfully',
            data: expect.arrayContaining([
                expect.objectContaining({ trip_id: tripId, image: 'mockImage1' }),
                expect.objectContaining({ trip_id: tripId, image: 'mockImage2' }),
            ]),
        });
        expect(TripImages.create).toHaveBeenCalledTimes(2); // Verify that create was called twice
    });

    it('should handle internal server error', async () => {
        const tripId = '1';
        const mockImages = [{ data: Buffer.from('image1'), mimetype: 'image/jpeg' }];
        mockRequest.params.tripId = tripId;
        mockRequest.files.images = mockImages;

        TripImages.create.mockRejectedValue(new Error('Database error')); // Mock error

        await createTripImage(mockRequest, mockResponse); // Call createTripImage function

        expect(mockResponse.status).toHaveBeenCalledWith(500); // Check for response 500
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Internal Server Error",
            error: 'Database error',
        });
    });


    it('should return 400 if no image ID is provided', async () => {
        mockRequest.params.imageId = undefined;

        await getTripImage(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Image ID is required" });
    });

    it('should return 404 if the image is not found', async () => {
        const imageId = 1; // Example image ID
        mockRequest.params.imageId = imageId; // Set image ID in params

        TripImages.findByPk.mockResolvedValue(null);

        await getTripImage(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Image not found" });
    });

    it('should return 200 and the image buffer if the image exists', async () => {
        const imageId = 1; // Example image ID
        mockRequest.params.imageId = imageId; // Set image ID in params

        const mockImageBuffer = Buffer.from('mock image data'); // Mock image data
        TripImages.findByPk.mockResolvedValue({ image: mockImageBuffer }); // Mock image object

        await getTripImage(mockRequest, mockResponse);

        expect(mockResponse.type).toHaveBeenCalledWith("image/png");
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(mockImageBuffer);
    });

    it('should return 400 if no trip ID is provided', async () => {
        // No trip ID in params
        mockRequest.params.tripId = undefined;

        await getImagesByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip ID is required" });
    });

    it('should return 404 if no images are found for the trip', async () => {
        const tripId = 1; // Example trip ID
        mockRequest.params.tripId = tripId; // Set trip ID in params

        TripImages.findAll.mockResolvedValue([]);

        await getImagesByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "No images found for this trip" });
    });

    it('should return 200 and an array of image info if images are found', async () => {
        const tripId = 1; // Example trip ID
        mockRequest.params.tripId = tripId; // Set trip ID in params

        const mockTripImages = [
            { image_id: 1, trip_id: tripId },
            { image_id: 2, trip_id: tripId },
        ];
        TripImages.findAll.mockResolvedValue(mockTripImages);

        await getImagesByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([
            { image_id: 1, trip_id: tripId, image_url: "/api/trips/trip-images/1" },
            { image_id: 2, trip_id: tripId, image_url: "/api/trips/trip-images/2" },
        ]);
    });

    it("should delete an image successfully and return 200", async () => {
        const imageId = 1;
        mockRequest.params.imageId = imageId; // Set specific image ID

        const mockImage = { destroy: jest.fn() };
        TripImages.findByPk.mockResolvedValue(mockImage);

        await deleteTripImage(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Image deleted successfully" });
        expect(mockImage.destroy).toHaveBeenCalled();
    });

    it("should return 404 if the image is not found", async () => {
        const imageId = 2;
        mockRequest.params.imageId = imageId; // Set specific image ID

        TripImages.findByPk.mockResolvedValue(null);

        await deleteTripImage(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Image not found" });
    });

    it("should return 500 if there is a server error", async () => {
        const imageId = 3;
        mockRequest.params.imageId = imageId; // Set specific image ID

        TripImages.findByPk.mockRejectedValue(new Error("Database error"));

        await deleteTripImage(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Internal Server Error",
            error: expect.any(String)
        }));
    });

});

