require('dotenv').config({ path: 'server/.env' });
const Image = require('../models/Image');
const { createImage, getImages, getImageById, getImagesByTripId, deleteTripImages, deleteImageByLocationPosition } = require('../controllers/ImageController');

jest.mock('../models/Image');

describe('Image Controller', () => {
    let mockRequest, mockResponse;

    beforeEach(() => {
        mockRequest = {
            body: {},
            params: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        console.error = jest.fn(); // Suppress error logs
    });

    describe('createImage', () => {
        it('should create a new image and return 201 status', async () => {
            mockRequest.params.tripId = '1';
            mockRequest.body.image_url = 'http://example.com/image.jpg';

            const newImage = { id: 1, trip_id: '1', image_url: 'http://example.com/image.jpg' };
            Image.create.mockResolvedValue(newImage);

            await createImage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: newImage });
        });

        it('should return 500 if there is an error', async () => {
            mockRequest.params.tripId = '1';
            mockRequest.body.image_url = 'http://example.com/image.jpg';
            Image.create.mockRejectedValue(new Error('Database error'));

            await createImage(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                error: 'Database error'
            });
        });
    });

    describe('getImages', () => {
        it('should return all images with 200 status', async () => {
            const allImages = [
                { id: 1, trip_id: '1', image_url: 'http://example.com/image1.jpg' },
                { id: 2, trip_id: '2', image_url: 'http://example.com/image2.jpg' },
            ];
            Image.findAll.mockResolvedValue(allImages);

            await getImages(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: allImages });
        });

        it('should return 500 if there is an error', async () => {
            Image.findAll.mockRejectedValue(new Error('Database error'));

            await getImages(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                error: 'Database error'
            });
        });
    });

    describe('getImageById', () => {
        it('should return specific image with 200 status', async () => {
            const image = { id: 1, trip_id: '1', image_url: 'http://example.com/image.jpg' };
            mockRequest.params.imageId = '1';
            Image.findByPk.mockResolvedValue(image);

            await getImageById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: image });
        });

        it('should return 404 if image is not found', async () => {
            mockRequest.params.imageId = '1';
            Image.findByPk.mockResolvedValue(null);

            await getImageById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: null, message: 'Image not found' });
        });

        it('should return 500 if there is an error', async () => {
            mockRequest.params.imageId = '1';
            Image.findByPk.mockRejectedValue(new Error('Database error'));

            await getImageById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                error: 'Database error'
            });
        });
    });

    describe('getImagesByTripId', () => {
        it('should return images by trip ID with 200 status', async () => {
            const images = [
                { id: 1, trip_id: '1', image_url: 'http://example.com/image1.jpg' },
                { id: 2, trip_id: '1', image_url: 'http://example.com/image2.jpg' },
            ];
            mockRequest.params.tripId = '1';
            Image.findAll.mockResolvedValue(images);

            await getImagesByTripId(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: images });
        });

        it('should return 400 if trip ID is missing', async () => {
            mockRequest.params.tripId = undefined;

            await getImagesByTripId(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Trip ID is required' });
        });

        it('should return 200 with a message if no images are found', async () => {
            mockRequest.params.tripId = '1';
            Image.findAll.mockResolvedValue([]);

            await getImagesByTripId(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ data: [], message: 'Images not found' });
        });

        it('should return 500 if there is an error', async () => {
            mockRequest.params.tripId = '1';
            Image.findAll.mockRejectedValue(new Error('Database error'));

            await getImagesByTripId(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                error: 'Database error'
            });
        });
    });


    describe('deleteTripImages', () => {
        it('should delete images by trip ID and return 200 status with a success message', async () => {
            const mockTripId = '1';
            mockRequest.params.tripId = mockTripId;
    
            // Mock Image.destroy behavior (success case)
            Image.destroy.mockResolvedValue(3); // Mock that 3 images are deleted
    
            await deleteTripImages(mockRequest, mockResponse);
    
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: '3 images deleted successfully.' });
        });
    
        it('should return 400 if trip ID is missing', async () => {
            mockRequest.params.tripId = undefined;
    
            await deleteTripImages(mockRequest, mockResponse);
    
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Trip ID is required' });
        });
    
        it('should return 404 if no images are found for the specified trip ID', async () => {
            const mockTripId = '1';
            mockRequest.params.tripId = mockTripId;
    
            // Mock that no images are deleted
            Image.destroy.mockResolvedValue(0); // Simulate no images found
    
            await deleteTripImages(mockRequest, mockResponse);
    
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No images found for the specified tripId' });
        });
    
        it('should return 500 if there is an error', async () => {
            const mockTripId = '1';
            mockRequest.params.tripId = mockTripId;
    
            // Mock Image.destroy to throw an error (simulate database error)
            Image.destroy.mockRejectedValue(new Error('Database error'));
    
            await deleteTripImages(mockRequest, mockResponse);
    
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Internal Server Error',
                error: 'Database error',
            });
        });
    });
});
