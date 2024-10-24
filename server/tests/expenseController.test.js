require('dotenv').config({ path: 'server/.env' });
const Expense = require('../models/Expense');
const { 
    createExpense,
    getExpenses,
    getExpenseById,
    getExpensesByTripId,
    updateExpense,
    deleteExpense
} = require('../controllers/ExpenseController');

// mock Expense and Trip model
jest.mock('../models/Expense');
jest.mock('../models/Trip');

describe('Expense Controller', () => {
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

    it('should create new expense and return 201 status', async () => {
        const mockTripId = '1234';
        mockRequest.params = { tripId: mockTripId };
    
        const inputExpense = { name: 'Brunch', amount: 50, category: 'Food' };
        const createdExpense = { expense_id: '3', trip_id: mockTripId, ...inputExpense };
        mockRequest.body = inputExpense;
    
        Expense.create.mockResolvedValue(createdExpense);
    
        await createExpense(mockRequest, mockResponse);
    
        expect(Expense.create).toHaveBeenCalledWith({ trip_id: mockTripId, ...inputExpense });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: createdExpense });
    });      

    it('should return all expenses and a 200 status', async () => {
        const expenses = [
            { expense_id: '3', name: 'Brunch', amount: 50, category: 'Food', trip_id: '1234' },
            { expense_id: '4', name: 'Flight', amount: 200, category: 'Transport', trip_id: '1235' }
        ];
    
        Expense.findAll.mockResolvedValue(expenses);
    
        await getExpenses(mockRequest, mockResponse);
    
        expect(Expense.findAll).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: expenses });
    });
      
    it('should return specific expense and a 200 status', async () => {
        const mockExpenseId = '3';
        const mockExpense = { expense_id: mockExpenseId, name: 'Brunch', amount: 50, category: 'Food', trip_id: '1234' };
    
        // Mock request and Expense.findByPk
        mockRequest.params = { expenseId: mockExpenseId };
        Expense.findByPk.mockResolvedValue(mockExpense);
    
        // Call the getExpenseById function
        await getExpenseById(mockRequest, mockResponse);
    
        // Check that Expense.findByPk was called with the correct ID
        expect(Expense.findByPk).toHaveBeenCalledWith(mockExpenseId);
    
        // Check that the status 200 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    
        // Check that the response contains the expense data
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockExpense });
    });
    
    it('should return 404 if expense is not found', async () => {
        const mockExpenseId = '5';
    
        // Mock request and Expense.findByPk to return null (not found)
        mockRequest.params = { expenseId: mockExpenseId };
        Expense.findByPk.mockResolvedValue(null);
    
        // Call the getExpenseById function
        await getExpenseById(mockRequest, mockResponse);
    
        // Check that Expense.findByPk was called with the correct ID
        expect(Expense.findByPk).toHaveBeenCalledWith(mockExpenseId);
    
        // Check that the status 404 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(404);
    
        // Check that the response contains the "Expense not found" message
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Expense not found" });
    });
    
    it('should return 500 on internal server error', async () => {
        const mockExpenseId = '3';
    
        // Mock request and Expense.findByPk to throw an error
        mockRequest.params = { expenseId: mockExpenseId };
        Expense.findByPk.mockRejectedValue(new Error('Database error'));
    
        // Call the getExpenseById function
        await getExpenseById(mockRequest, mockResponse);
    
        // Check that the status 500 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(500);
    
        // Check that the response contains the error message
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Internal Server Error", error: "Database error" });
    });    
    
    it('should return expenses by trip ID and a 200 status', async () => {
        const mockTripId = '3333';
        const mockExpenses = [
            { expense_id: '3', name: 'Brunch', amount: 50, category: 'Food', trip_id: mockTripId },
            { expense_id: '4', name: 'Flight', amount: 20, category: 'Transport', trip_id: mockTripId }
        ];
    
        // Mock request and Expense.findAll
        mockRequest.params = { tripId: mockTripId };
        Expense.findAll.mockResolvedValue(mockExpenses);
    
        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);
    
        // Check that Expense.findAll was called with the correct trip_id
        expect(Expense.findAll).toHaveBeenCalledWith({ where: { trip_id: mockTripId } });
    
        // Check that the status 200 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(200);
    
        // Check that the response contains the expense data
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockExpenses });
    });
    
    it('should return 400 if trip ID is missing', async () => {
        // Mock request with no tripId
        mockRequest.params = {};
    
        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);
    
        // Check that the status 400 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    
        // Check that the response contains the "Trip ID is required" message
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Trip ID is required" });
    });
    
    it('should return 404 if no expenses are found for the trip', async () => {
        const mockTripId = '1234';
    
        // Mock request and Expense.findAll to return an empty array
        mockRequest.params = { tripId: mockTripId };
        Expense.findAll.mockResolvedValue([]);
    
        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);
    
        // Check that the status 404 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(404);
    
        // Check that the response contains the "Expense not found" message
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Expense not found" });
    });
    
    it('should return 500 on internal server error', async () => {
        const mockTripId = '1234';
    
        // Mock request and Expense.findAll to throw an error
        mockRequest.params = { tripId: mockTripId };
        Expense.findAll.mockRejectedValue(new Error('Database error'));
    
        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);
    
        // Check that the status 500 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(500);
    
        // Check that the response contains the error message
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Internal Server Error", error: "Database error" });
    });    

    it('should update expense and return 200 status', async () => {
        const mockExpenseId = '4567';
        mockRequest.params = { expenseId: mockExpenseId };
        const updatedData = { name: 'Another Flight', amount: 350 };
        const updatedExpense = { expense_id: mockExpenseId, ...updatedData };

        mockRequest.body = updatedData;

        Expense.findByPk.mockResolvedValue({ update: jest.fn().mockResolvedValue(updatedExpense) });

        await updateExpense(mockRequest, mockResponse);

        expect(Expense.findByPk).toHaveBeenCalledWith(mockExpenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: updatedExpense });
    });

    it('should delete expense and return 204 status', async () => {
        const mockExpenseId = '4567';
        mockRequest.params = { expenseId: mockExpenseId };

        Expense.destroy.mockResolvedValue(1);

        await deleteExpense(mockRequest, mockResponse);

        expect(Expense.destroy).toHaveBeenCalledWith({ where: { expense_id: mockExpenseId } });
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 404 when deleting non-existent expense', async () => {
        const mockExpenseId = 'non-existent-id';
        mockRequest.params = { expenseId: mockExpenseId };

        Expense.destroy.mockResolvedValue(0);

        await deleteExpense(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "Expense not found" });
    });

    it('should handle errors and return 500 status', async () => {
        const error = new Error('Internal Server Error');

        Expense.create.mockRejectedValue(error);

        await createExpense(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Internal Server Error',
            error: error.message
        });
    });
});