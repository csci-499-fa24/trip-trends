require('dotenv').config({ path: 'server/.env' });
const List = require('../models/List');
const Trip = require('../models/Trip');
const { 
    createListItem, 
    updateListCompletion, 
    updateListName, 
    deleteListItem, 
    getPurchaseListsByTripId, 
    getSightseeingListsByTripId 
} = require('../controllers/ListController');

jest.mock('../models/List');
jest.mock('../models/Trip');

describe('List Controller', () => {
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
            type: jest.fn()
        };
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Successful case for creating a list item
    it('should create a new list item and return 201 status', async () => {
        const mockTripId = '1';
        const inputListItem = { name: 'Item1', list_type: 'sightseeing', is_completed: false };
        const createdListItem = { list_id: '123', trip_id: mockTripId, ...inputListItem };

        mockRequest.params.tripId = mockTripId;
        mockRequest.body = inputListItem;

        List.create = jest.fn().mockResolvedValue(createdListItem);

        await createListItem(mockRequest, mockResponse);

        expect(List.create).toHaveBeenCalledWith({
            trip_id: mockTripId,
            name: inputListItem.name,
            list_type: inputListItem.list_type,
            is_completed: inputListItem.is_completed
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'List item created successfully.',
            data: createdListItem
        });
    });

    // Error case for creating a list item
    it('should handle errors when creating a new list item', async () => {
        const mockTripId = '1';
        mockRequest.params.tripId = mockTripId;
        mockRequest.body = { name: 'Item1', list_type: 'sightseeing' };

        List.create = jest.fn().mockRejectedValue(new Error('Database Error'));

        await createListItem(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: 'Failed to create list item.'
        });
    });

    // Successful case for updating list completion
    it('should update the list item completion state and return 200 status', async () => {
        const mockTripId = '1';
        const mockListId = '2';
        const listItem = { save: jest.fn(), is_completed: false };
        mockRequest.params = { tripId: mockTripId, listId: mockListId };
        mockRequest.body = { isCompleted: true };

        List.findOne = jest.fn().mockResolvedValue(listItem);

        await updateListCompletion(mockRequest, mockResponse);

        expect(List.findOne).toHaveBeenCalledWith({
            where: { trip_id: mockTripId, list_id: mockListId }
        });
        expect(listItem.is_completed).toBe(true);
        expect(listItem.save).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'List item updated successfully.',
            data: listItem
        });
    });

    // Error case for updating list completion
    it('should return 404 if list item to update is not found', async () => {
        mockRequest.params = { tripId: '1', listId: '2' };
        mockRequest.body = { isCompleted: true };

        List.findOne = jest.fn().mockResolvedValue(null);

        await updateListCompletion(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: 'List item not found.'
        });
    });

    // Successful case for updating list item name
    it('should update the list item name and return 200 status', async () => {
        const mockTripId = '1';
        const mockListId = '2';
        const listItem = { save: jest.fn(), name: 'Old Item' };
        mockRequest.params = { tripId: mockTripId, listId: mockListId };
        mockRequest.body = { name: 'Updated Item' };

        List.findOne = jest.fn().mockResolvedValue(listItem);

        await updateListName(mockRequest, mockResponse);

        expect(List.findOne).toHaveBeenCalledWith({
            where: { trip_id: mockTripId, list_id: mockListId }
        });
        expect(listItem.name).toBe('Updated Item');
        expect(listItem.save).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'List item name updated successfully.',
            data: listItem
        });
    });

    // Error case for updating list item name
    it('should return 404 if list item to update name is not found', async () => {
        mockRequest.params = { tripId: '1', listId: '2' };
        mockRequest.body = { name: 'New Item Name' };

        List.findOne = jest.fn().mockResolvedValue(null);

        await updateListName(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: 'List item not found.'
        });
    });

    // Successful case for deleting list item
    it('should delete the list item and return 200 status', async () => {
        const mockTripId = '1';
        const mockListId = '2';
        const listItem = { destroy: jest.fn() };
        mockRequest.params = { tripId: mockTripId, listId: mockListId };

        List.findOne = jest.fn().mockResolvedValue(listItem);

        await deleteListItem(mockRequest, mockResponse);

        expect(List.findOne).toHaveBeenCalledWith({
            where: { trip_id: mockTripId, list_id: mockListId }
        });
        expect(listItem.destroy).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'List item deleted successfully.'
        });
    });

    // Error case for deleting list item
    it('should return 404 if list item to delete is not found', async () => {
        mockRequest.params = { tripId: '1', listId: '2' };

        List.findOne = jest.fn().mockResolvedValue(null);

        await deleteListItem(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: 'List item not found.'
        });
    });

    // Error case for fetching purchase lists if none found
    it('should return 404 if no purchase lists found for a trip', async () => {
        mockRequest.params.tripId = '1';

        List.findAll = jest.fn().mockResolvedValue([]);

        await getPurchaseListsByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: `No purchase lists found for trip ID ${mockRequest.params.tripId}`
        });
    });

    // Error case for fetching sightseeing lists if none found
    it('should return 404 if no sightseeing lists found for a trip', async () => {
        mockRequest.params.tripId = '1';

        List.findAll = jest.fn().mockResolvedValue([]);

        await getSightseeingListsByTripId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: `No sightseeing lists found for trip ID ${mockRequest.params.tripId}`
        });
    });
});
