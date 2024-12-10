require("dotenv").config({ path: "server/.env" });
const Expense = require("../models/Expense");
const {
    createExpense,
    getExpenses,
    getExpenseById,
    getExpensesByTripId,
    checkReceiptExistenceByExpenseId,
    getReceiptImageByExpenseId,
    // createLinkToken,
    // exchangePublicToken,
    // getTransactions,
} = require("../controllers/ExpenseController");
const { PlaidApi, Configuration, PlaidEnvironments } = require("plaid");

// mock Expense and Trip model
jest.mock("../models/Expense");
jest.mock("../models/Trip");
jest.mock("plaid", () => {
    const originalPlaid = jest.requireActual("plaid");
    return {
        ...originalPlaid,
        PlaidApi: jest.fn().mockImplementation(() => ({
            linkTokenCreate: jest.fn(),
            itemPublicTokenExchange: jest.fn(),
            transactionsGet: jest.fn(),
        })),
    };
});

describe("Expense Controller", () => {
    let mockRequest, mockResponse, mockPlaidClient;

    // set up fresh mock request and response objects before each test
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            body: { client_user_id: "test-user" },
            params: {},
            files: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
            type: jest.fn(),
        };

        const configuration = new Configuration({
            basePath: PlaidEnvironments.sandbox,
            baseOptions: {
                headers: {
                    "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "mock-client-id",
                    "PLAID-SECRET": process.env.PLAID_SECRET || "mock-secret",
                },
            },
        });

        console.error = jest.fn(); // suppress error logs

        mockPlaidClient = new PlaidApi(configuration);
        mockPlaidClient.linkTokenCreate = jest.fn().mockResolvedValue({
            link_token: "mock-link-token",
        });
        mockPlaidClient.itemPublicTokenExchange = jest.fn().mockResolvedValue({
            access_token: "mock-access-token",
        });
        mockPlaidClient.transactionsGet = jest.fn().mockResolvedValue({
            transactions: [],
            total_transactions: 0,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should create a new expense with an image and return 201 status", async () => {
        const mockTripId = "1234";
        const inputExpense = {
            expenseId: "3",
            name: "Brunch",
            amount: 50,
            category: "Food",
            currency: "USD",
            posted: "2024-11-11",
            notes: "Team outing",
        };
        const createdExpense = {
            expense_id: inputExpense.expenseId,
            trip_id: mockTripId,
            ...inputExpense,
            image: Buffer.from("test-image-data"),
        };

        mockRequest.params.tripId = mockTripId;
        mockRequest.body = inputExpense;
        mockRequest.files.image = {
            data: Buffer.from("test-image-data"),
            mimetype: "image/png",
        };

        Expense.create = jest.fn().mockResolvedValue(createdExpense);

        await createExpense(mockRequest, mockResponse);

        expect(Expense.create).toHaveBeenCalledWith({
            expense_id: inputExpense.expenseId,
            trip_id: mockTripId,
            name: inputExpense.name,
            amount: inputExpense.amount,
            category: inputExpense.category,
            currency: inputExpense.currency,
            posted: inputExpense.posted,
            notes: inputExpense.notes,
            image: mockRequest.files.image.data,
        });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            data: createdExpense,
        });
    });

    it("should create a new expense without image and return 201 status", async () => {
        const mockTripId = "1234";
        const inputExpense = {
            name: "Brunch",
            amount: 50,
            category: "Food",
            image: null,
        };
        const createdExpense = {
            expense_id: "3",
            trip_id: mockTripId,
            ...inputExpense,
        };

        mockRequest.params.tripId = mockTripId;
        mockRequest.body = inputExpense;

        Expense.create.mockResolvedValue(createdExpense);

        await createExpense(mockRequest, mockResponse);

        expect(Expense.create).toHaveBeenCalledTimes(1); // Debug line
        expect(Expense.create).toHaveBeenCalledWith(
            expect.objectContaining({
                trip_id: mockTripId,
                name: inputExpense.name,
                amount: inputExpense.amount,
                category: inputExpense.category,
                image: null,
            })
        );
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            data: createdExpense,
        });
    });

    it("should return all expenses and a 200 status", async () => {
        const expenses = [
            {
                expense_id: "3",
                name: "Brunch",
                amount: 50,
                category: "Food",
                trip_id: "1234",
            },
            {
                expense_id: "4",
                name: "Flight",
                amount: 200,
                category: "Transport",
                trip_id: "1235",
            },
        ];

        Expense.findAll.mockResolvedValue(expenses);

        await getExpenses(mockRequest, mockResponse);

        expect(Expense.findAll).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: expenses });
    });

    it("should return specific expense and a 200 status", async () => {
        const mockExpenseId = "3";
        const mockExpense = {
            expense_id: mockExpenseId,
            name: "Brunch",
            amount: 50,
            category: "Food",
            trip_id: "1234",
        };

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

    it("should return 404 if expense is not found", async () => {
        const mockExpenseId = "5";

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
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Expense not found",
        });
    });

    it("should return 500 on internal server error", async () => {
        const mockExpenseId = "3";

        // Mock request and Expense.findByPk to throw an error
        mockRequest.params = { expenseId: mockExpenseId };
        Expense.findByPk.mockRejectedValue(new Error("Database error"));

        // Call the getExpenseById function
        await getExpenseById(mockRequest, mockResponse);

        // Check that the status 500 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(500);

        // Check that the response contains the error message
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Internal Server Error",
            error: "Database error",
        });
    });

    it("should return expenses by trip ID and a 200 status", async () => {
        const mockTripId = "3333";
        const mockExpenses = [
            {
                expense_id: "3",
                name: "Brunch",
                amount: 50,
                category: "Food",
                trip_id: mockTripId,
            },
            {
                expense_id: "4",
                name: "Flight",
                amount: 20,
                category: "Transport",
                trip_id: mockTripId,
            },
        ];

        // Mock request and Expense.findAll
        mockRequest.params = { tripId: mockTripId };
        Expense.findAll.mockResolvedValue(mockExpenses);

        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);

        expect(Expense.findAll).toHaveBeenCalledWith({
            where: { trip_id: mockTripId },
            attributes: { exclude: ["image"] }, // Include the exclusion of the 'image' attribute
        });

        // Check that the status 200 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        // Check that the response contains the expense data
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockExpenses });
    });

    it("should return 400 if trip ID is missing", async () => {
        // Mock request with no tripId
        mockRequest.params = {};

        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);

        // Check that the status 400 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(400);

        // Check that the response contains the "Trip ID is required" message
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Trip ID is required",
        });
    });

    it("should return 404 if no expenses are found for the trip", async () => {
        const mockTripId = "1234";

        // Mock request and Expense.findAll to return an empty array
        mockRequest.params = { tripId: mockTripId };
        Expense.findAll.mockResolvedValue([]);

        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);

        // Check that the status 404 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(404);

        // Check that the response contains the "Expense not found" message
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Expense not found",
        });
    });

    it("should return 500 on internal server error", async () => {
        const mockTripId = "1234";

        // Mock request and Expense.findAll to throw an error
        mockRequest.params = { tripId: mockTripId };
        Expense.findAll.mockRejectedValue(new Error("Database error"));

        // Call the getExpensesByTripId function
        await getExpensesByTripId(mockRequest, mockResponse);

        // Check that the status 500 was returned
        expect(mockResponse.status).toHaveBeenCalledWith(500);

        // Check that the response contains the error message
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Internal Server Error",
            error: "Database error",
        });
    });

    it("should return 400 if expense ID is missing", async () => {
        await checkReceiptExistenceByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Expense ID is required",
        });
    });

    it("should return 404 if expense is not found", async () => {
        const mockExpenseId = "1234";
        mockRequest.params.expenseId = mockExpenseId;

        Expense.findByPk = jest.fn().mockResolvedValue(null);

        await checkReceiptExistenceByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Expense not found",
        });
    });

    it("should return 200 with a message if receipt image is not available", async () => {
        const mockExpenseId = "1234";
        mockRequest.params.expenseId = mockExpenseId;

        const expense = { image: null };
        Expense.findByPk = jest.fn().mockResolvedValue(expense);

        await checkReceiptExistenceByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            receiptExists: false,
        });
    });

    it("should return 200 with receiptExists: true if receipt image is available", async () => {
        const mockExpenseId = "1234";
        const mockImageData = Buffer.from("image-data");
        mockRequest.params.expenseId = mockExpenseId;

        const expense = { image: mockImageData };
        Expense.findByPk = jest.fn().mockResolvedValue(expense);

        await checkReceiptExistenceByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            receiptExists: true,
        });
    });

    it("should return 400 if expense ID is missing", async () => {
        await getReceiptImageByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Expense ID is required",
        });
    });

    it("should return 404 if expense is not found", async () => {
        const mockExpenseId = "1234";
        mockRequest.params.expenseId = mockExpenseId;

        Expense.findByPk = jest.fn().mockResolvedValue(null);

        await getReceiptImageByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Expense not found",
        });
    });

    it("should return 200 with a message if receipt image is not available", async () => {
        const mockExpenseId = "1234";
        mockRequest.params.expenseId = mockExpenseId;

        const expense = { image: null };
        Expense.findByPk = jest.fn().mockResolvedValue(expense);

        await getReceiptImageByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Receipt image not added",
        });
    });

    it("should return 200 with image data if receipt image is available", async () => {
        const mockExpenseId = "1234";
        const mockImageData = Buffer.from("image-data");
        mockRequest.params.expenseId = mockExpenseId;

        const expense = { image: mockImageData };
        Expense.findByPk = jest.fn().mockResolvedValue(expense);

        await getReceiptImageByExpenseId(mockRequest, mockResponse);

        expect(mockResponse.type).toHaveBeenCalledWith("image/png");
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(mockImageData);
    });

    // it("should create a new link token and return it", async () => {
    //     const mockLinkTokenResponse = {
    //         data: { link_token: "mock-link-token" },
    //     };
    //     mockPlaidClient.linkTokenCreate.mockResolvedValue(
    //         mockLinkTokenResponse
    //     );

    //     const createLinkToken = async (req, res) => {
    //         try {
    //             const response = await mockPlaidClient.linkTokenCreate({
    //                 user: {
    //                     client_user_id:
    //                         req.body.client_user_id || "default-user",
    //                 },
    //                 client_name: "Trip Trends",
    //                 products: ["transactions"],
    //                 country_codes: ["US"],
    //                 language: "en",
    //             });
    //             res.status(200).json({ link_token: response.data.link_token });
    //         } catch (err) {
    //             console.error("Error creating link token:", err);
    //             res.status(500).json({
    //                 error: "Failed to create link token",
    //                 details: err.message,
    //             });
    //         }
    //     };

    //     await createLinkToken(mockRequest, mockResponse);

    //     expect(mockPlaidClient.linkTokenCreate).toHaveBeenCalledWith({
    //         user: { client_user_id: "test-user" },
    //         client_name: "Trip Trends",
    //         products: ["transactions"],
    //         country_codes: ["US"],
    //         language: "en",
    //     });

    //     expect(mockResponse.status).toHaveBeenCalledWith(200);
    //     expect(mockResponse.json).toHaveBeenCalledWith({
    //         link_token: "mock-link-token",
    //     });
    // });

    // it("should handle errors when creating link token", async () => {
    //     const mockError = new Error("Link token creation failed");
    //     mockPlaidClient.linkTokenCreate.mockRejectedValue(mockError);

    //     const createLinkToken = async (req, res) => {
    //         try {
    //             const response = await mockPlaidClient.linkTokenCreate({
    //                 user: {
    //                     client_user_id:
    //                         req.body.client_user_id || "default-user",
    //                 },
    //                 client_name: "Trip Trends",
    //                 products: ["transactions"],
    //                 country_codes: ["US"],
    //                 language: "en",
    //             });
    //             res.status(200).json({ link_token: response.data.link_token });
    //         } catch (err) {
    //             console.error("Error creating link token:", err);
    //             res.status(500).json({
    //                 error: "Failed to create link token",
    //                 details: err.message,
    //             });
    //         }
    //     };

    //     await createLinkToken(mockRequest, mockResponse);

    //     expect(mockResponse.status).toHaveBeenCalledWith(500);
    //     expect(mockResponse.json).toHaveBeenCalledWith({
    //         error: "Failed to create link token",
    //         details: mockError.message,
    //     });
    // });

    // it("should exchange the public token and return the access token", async () => {
    //     const mockExchangeResponse = {
    //         data: { access_token: "mock-access-token" },
    //     };
    //     mockPlaidClient.itemPublicTokenExchange.mockResolvedValue(
    //         mockExchangeResponse
    //     );

    //     const exchangePublicToken = async (req, res) => {
    //         const { public_token } = req.body;

    //         if (!public_token) {
    //             return res
    //                 .status(400)
    //                 .json({ error: "Public token is required" });
    //         }

    //         try {
    //             const response = await mockPlaidClient.itemPublicTokenExchange({
    //                 public_token,
    //             });
    //             if (!response.data || !response.data.access_token) {
    //                 return res
    //                     .status(500)
    //                     .json({ error: "Access token not found in response" });
    //             }
    //             res.status(200).json({
    //                 access_token: response.data.access_token,
    //             });
    //         } catch (error) {
    //             console.error("Error exchanging public token:", error);
    //             res.status(500).json({
    //                 error: "Failed to exchange public token",
    //                 details: error.message,
    //             });
    //         }
    //     };

    //     await exchangePublicToken(mockRequest, mockResponse);

    //     expect(mockPlaidClient.itemPublicTokenExchange).toHaveBeenCalledWith({
    //         public_token: "mock-public-token", 
    //     });

    //     expect(mockResponse.status).toHaveBeenCalledWith(200);
    //     expect(mockResponse.json).toHaveBeenCalledWith({
    //         access_token: "mock-access-token",
    //     });
    // });

    // it("should handle errors when exchanging public token", async () => {
    //     const mockError = new Error("Public token exchange failed");
    //     mockPlaidClient.itemPublicTokenExchange.mockRejectedValue(mockError);

    //     const exchangePublicToken = async (req, res) => {
    //         const { public_token } = req.body;

    //         if (!public_token) {
    //             return res
    //                 .status(400)
    //                 .json({ error: "Public token is required" });
    //         }

    //         try {
    //             const response = await mockPlaidClient.itemPublicTokenExchange({
    //                 public_token,
    //             });
    //             if (!response.data || !response.data.access_token) {
    //                 return res
    //                     .status(500)
    //                     .json({ error: "Access token not found in response" });
    //             }
    //             res.status(200).json({
    //                 access_token: response.data.access_token,
    //             });
    //         } catch (error) {
    //             console.error("Error exchanging public token:", error);
    //             res.status(500).json({
    //                 error: "Failed to exchange public token",
    //                 details: error.message,
    //             });
    //         }
    //     };

    //     await exchangePublicToken(mockRequest, mockResponse);

    //     expect(mockResponse.status).toHaveBeenCalledWith(500);
    //     expect(mockResponse.json).toHaveBeenCalledWith({
    //         error: "Failed to exchange public token",
    //         details: mockError.message,
    //     });
    // });

    // it("should fetch transactions and return them", async () => {
    //     const mockTransactionsResponse = {
    //         data: {
    //             transactions: [{ transaction_id: "txn1" }],
    //             total_transactions: 1,
    //         },
    //     };
    //     mockPlaidClient.transactionsGet.mockResolvedValue(
    //         mockTransactionsResponse
    //     );

    //     const getTransactions = async (req, res) => {
    //         const { access_token, start_date, end_date, count, offset } =
    //             req.body;

    //         if (!access_token) {
    //             return res
    //                 .status(400)
    //                 .json({ error: "Access token is required" });
    //         }

    //         try {
    //             const response = await mockPlaidClient.transactionsGet({
    //                 access_token,
    //                 start_date,
    //                 end_date,
    //                 options: {
    //                     count: parseInt(count),
    //                     offset: parseInt(offset),
    //                 },
    //             });

    //             res.status(200).json({
    //                 transactions: response.data.transactions,
    //                 total_transactions: response.data.total_transactions,
    //             });
    //         } catch (error) {
    //             console.error("Error fetching transactions:", error);
    //             res.status(500).json({
    //                 error: "Failed to fetch transactions",
    //                 details: "Plaid API error",
    //             });
    //         }
    //     };

    //     await getTransactions(mockRequest, mockResponse);

    //     expect(mockPlaidClient.transactionsGet).toHaveBeenCalledWith({
    //         access_token: "mock-access-token",
    //         start_date: expect.any(String),
    //         end_date: expect.any(String),
    //         options: { count: 100, offset: 0 },
    //     });

    //     expect(mockResponse.status).toHaveBeenCalledWith(200);
    //     expect(mockResponse.json).toHaveBeenCalledWith({
    //         transactions: [{ transaction_id: "txn1" }],
    //         total_transactions: 1,
    //     });
    // });

    // it("should handle errors when fetching transactions", async () => {
    //     const mockError = new Error("Failed to fetch transactions");
    //     mockPlaidClient.transactionsGet.mockRejectedValue(mockError);

    //     const getTransactions = async (req, res) => {
    //         const { access_token, start_date, end_date, count, offset } =
    //             req.body;

    //         if (!access_token) {
    //             return res
    //                 .status(400)
    //                 .json({ error: "Access token is required" });
    //         }

    //         try {
    //             const response = await mockPlaidClient.transactionsGet({
    //                 access_token,
    //                 start_date,
    //                 end_date,
    //                 options: {
    //                     count: parseInt(count),
    //                     offset: parseInt(offset),
    //                 },
    //             });

    //             res.status(200).json({
    //                 transactions: response.data.transactions,
    //                 total_transactions: response.data.total_transactions,
    //             });
    //         } catch (error) {
    //             console.error("Error fetching transactions:", error);
    //             res.status(500).json({
    //                 error: "Failed to fetch transactions",
    //                 details: "Plaid API error",
    //             });
    //         }
    //     };

    //     await getTransactions(mockRequest, mockResponse);

    //     expect(mockResponse.status).toHaveBeenCalledWith(500);
    //     expect(mockResponse.json).toHaveBeenCalledWith({
    //         error: "Failed to fetch transactions",
    //         details: "Plaid API error",
    //     });
    // });
});
