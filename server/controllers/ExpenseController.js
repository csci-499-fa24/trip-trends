const Expense = require("../models/Expense");
const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");
const { time } = require("console");
const { PlaidApi, Configuration, PlaidEnvironments } = require("plaid");
// const { fromBuffer } = require('file-type');

// POST new expense data with image handling
const createExpense = async (req, res) => {
    const tripId = req.params.tripId;
    const imageFile = req.files?.image ? req.files.image : null; // uploaded img withing the 'image' key
    const { expenseId, name, amount, category, currency, posted, notes } =
        req.body;
    const existingExpense = await Expense.findOne({
        where: {
            trip_id: tripId,name, amount, category, currency, posted, notes
        },
    });
    if (existingExpense) {
        return res.status(400).json({ error: "Expense already exists" });
    }
    let imageBuffer = null;
    try {
        // file type validation
        if (
            imageFile &&
            !["image/jpeg", "image/png"].includes(imageFile.mimetype)
        ) {
            return res
                .status(400)
                .json({
                    error: "Invalid file type. Only JPEG and PNG are allowed.",
                });
        }

        if (imageFile) {
            imageBuffer = imageFile.data;
        }

        const newExpense = await Expense.create({
            expense_id: expenseId,
            trip_id: tripId,
            name,
            amount,
            category,
            currency,
            posted,
            notes,
            image: imageBuffer,
        });
        res.status(201).json({ data: newExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// POST request to process receipt and get extracted data
const getExtractedReceiptData = async (req, res) => {
    try {
        // check if a file was uploaded
        if (!req.files || !req.files.file) {
            console.error("No file uploaded.");
            return res.status(400).json({ error: "No file uploaded" });
        }

        // console.log("Uploaded file:", req.files.file.data);
        const fileBuffer = req.files.file.data; // req.files is where the image was uploaded via frontend
        const formData = new FormData();
        formData.append("file", fileBuffer, {
            filename: "receipt.jpg",
            contentType: "application/octet-stream",
        }); // allowing for arbitrary binary data

        // console.log("Sending file to Veryfi API", formData);
        try {
            // build timestamp
            const timestamp = Date.now();

            // build signature
            const payload = `timestamp:${timestamp},user_id:${process.env.VERYFI_USERNAME}`; // use username as the user ID
            const hmac = crypto.createHmac(
                "sha256",
                `${process.env.VERYFI_CLIENT_SECRET}`
            );
            hmac.update(payload);
            const signature = hmac.digest("base64");

            const response = await axios.post(
                "https://api.veryfi.com/api/v8/partner/documents/",
                formData,
                {
                    headers: {
                        "Client-ID": process.env.VERYFI_CLIENT_ID,
                        Authorization: `apikey ${process.env.VERYFI_USERNAME}:${process.env.VERYFI_API_KEY}`,
                        "X-Veryfi-Request-Signature": signature,
                        "X-Veryfi-Request-Timestamp": timestamp,
                        ...formData.getHeaders(),
                    },
                }
            );

            // console.log("Veryfi response:", response.data);
            res.status(200).json({ data: response.data });
        } catch (error) {
            console.error(
                "Error uploading receipt to Veryfi:",
                error.response ? error.response.data : error
            );
            res.status(500).json({ error: "Error extracting receipt data" });
        }
    } catch (error) {
        console.error("General error in receipt processing:", error);
        res.status(500).json({ error: "Error extracting receipt data" });
    }
};

// GET all expense data
const getExpenses = async (req, res) => {
    try {
        const allExpenses = await Expense.findAll();
        res.status(200).json({ data: allExpenses });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};  

// GET specific expense data by expenseId
const getExpenseById = async (req, res) => {
    const expenseId = req.params.expenseId;
    try {
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json({ data: expense });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// GET specific expense data by TripId
const getExpensesByTripId = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        if (!tripId) {
            return res.status(400).json({ message: "Trip ID is required" });
        }
        const expense = await Expense.findAll({
            where: { trip_id: tripId },
            attributes: { exclude: ['image'] }, // Exclude the 'image' column
        });
        if (!expense || expense.length === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }
        // const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.status(200).json({ data: expense });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

const checkReceiptExistenceByExpenseId = async (req, res) => {
    const expenseId = req.params.expenseId;

    if (!expenseId) {
        return res.status(400).json({ message: "Expense ID is required" });
    }

    try {
        const expense = await Expense.findByPk(expenseId);  // Find expense by ID
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        if (!expense.image) {
            return res.status(200).json({ receiptExists: false });  // No receipt image
        }

        return res.status(200).json({ receiptExists: true });  // Receipt exists
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// GET expense image using ExpenseID
const getReceiptImageByExpenseId = async (req, res) => {
    const expenseId = req.params.expenseId;
    if (!expenseId) {
        return res.status(400).json({ message: "Expense ID is required" });
    }
    try {
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        if (!expense.image) {
            return res.status(200).json({ message: "Receipt image not added" });
        }

        const imageBuffer = expense.image; // buffer is in BYTEA format
        // const { mime } = await fromBuffer(imageBuffer);
        res.type("image/png"); // image content type
        res.status(200).send(imageBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// PUT request to update expense data
const updateExpense = async (req, res) => {
    const expenseId = req.params.expenseId;
    const { tripId, name, amount, category, currency, posted, notes, image } =
        req.body;
    if (!expenseId || !amount || !category) {
        return res
            .status(400)
            .json({ error: "Missing required fields: amount, category, etc." });
    }
    try {
        // find expense by id
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json();
        }
        // update expense data
        const updatedExpense = await expense.update({
            tripId,
            name,
            amount,
            category,
            currency,
            posted,
            notes,
            image,
        });
        res.status(200).json({ data: updatedExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// PATCH request to transfer expense data
const transferExpense = async (req, res) => {
    const expenseId = req.params.expenseId;
    const { fromTripId, toTripId } = req.body;
    if (!expenseId || !fromTripId || !toTripId) {
        return res
            .status(400)
            .json({ error: "Missing required fields: fromTripId, toTripId" });
    }
    try {
        // find expense by id
        const expense = await Expense.findByPk(expenseId);
        
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        
        if (expense.trip_id !== fromTripId) {
            return res.status(400).json({
                error: "Expense does not belong to the specified fromTripId"
            });
        }
        
        expense.trip_id = toTripId;
        await expense.save();
        
        res.status(200).json({ message: 'Expense transferred successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// DELETE expense data
const deleteExpense = async (req, res) => {
    const expenseId = req.params.expenseId;
    try {
        // delete expense by expenseId
        const deletedCount = await Expense.destroy({ where: { expense_id: expenseId } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// Plaid API configuration
const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
            "PLAID-SECRET": process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

// POST to get link token
const createLinkToken = async (req, res) => {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: req.body.client_user_id || "default-user",
            },
            client_name: "Trip Trends",
            products: ["transactions"],
            country_codes: ["US"],
            language: "en",
        });
        res.status(200).json({ link_token: response.data.link_token });
    } catch (err) {
        console.error("Error creating link token:", err);
        res.status(500).json({
            error: "Failed to create link token",
            details: err.message,
        });
    }
};

// POST to exchange public token
const exchangePublicToken = async (req, res) => {
    const { public_token } = req.body;

    if (!public_token) {
        return res.status(400).json({ error: "Public token is required" });
    }

    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });
        if (!response.data || !response.data.access_token) {
            return res
                .status(500)
                .json({ error: "Access token not found in response" });
        }
        const access_token = response.data.access_token;
        console.log("Access token:", access_token);
        res.status(200).json({ access_token });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to exchange public token",
            details: error.message,
        });
    }
};

const getTransactions = async (req, res) => {
    const {
        access_token,
        start_date,
        end_date,
        count = 100,
        offset = 0,
    } = req.body;

    if (!access_token) {
        return res.status(400).json({ error: "Access token is required" });
    }

    try {
        const response = await plaidClient.transactionsGet({
            access_token,
            start_date,
            end_date,
            options: {
                count: parseInt(count),
                offset: parseInt(offset),
            },
        });

        res.status(200).json({
            transactions: response.data.transactions,
            total_transactions: response.data.total_transactions,
        });
    } catch (error) {
        console.error(
            "Error fetching transactions:",
            error.response || error
        );
        res.status(500).json({
            error: "Failed to fetch transactions",
            details: error.response ? error.response.data : "Unknown error",
        });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    getExpensesByTripId,
    checkReceiptExistenceByExpenseId,
    getReceiptImageByExpenseId,
    getExtractedReceiptData,
    updateExpense,
    transferExpense,
    deleteExpense,
    createLinkToken,
    exchangePublicToken,
    getTransactions,
};
