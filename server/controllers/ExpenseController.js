const Expense = require('../models/Expense');
const { fromBuffer } = require('file-type');

// POST new expense data
const createExpense = async (req, res) => {
    const tripId = req.params.tripId;
    const { expenseId, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // create a model instance 
        const newExpense = await Expense.create({ expense_id: expenseId, trip_id: tripId, name, amount, category, currency, posted, notes, image });
        res.status(201).json({ data: newExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// POST receipt with empty expense data
const uploadReceipt = async (req, res) => {
    const tripId = req.params.tripId;
    const image = req.files.img;
    const { expenseId } = req.body;
    try {
        if (!image) {
            return res.status(400).json({ message: "No image uploaded." });
        }

        // convert image to base 64 string
        const imageBase64 = image.data.toString('base64');

        const newExpense = await Expense.create({ expense_id: expenseId, trip_id: tripId, name: "", amount: 0, category: "", currency: "", posted: '2024-01-01', notes: null, image: imageBase64 });
        res.status(201).json({ data: newExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}; 

// GET all expense data
const getExpenses = async (req, res) => {
    try {
        const allExpenses = await Expense.findAll();
        res.status(200).json({ data: allExpenses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
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
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific expense data by TripId
const getExpensesByTripId = async (req, res) => {
    const tripId = req.params.tripId;
    try {
        if (!tripId) {
            return res.status(400).json({ message: "Trip ID is required" });
        }
        const expense = await Expense.findAll({ where: { trip_id: tripId } });
        if (!expense || expense.length === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json({ data: expense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET expense image using ExpenseID
const getReceiptImageByExpenseId = async (req, res) => {
    const expenseId = req.params.expenseId;
    console.log(expenseId);
    try {
        const expense = await Expense.findByPk(expenseId);
        if (!expenseId) {
            return res.status(400).json({ message: "Expense ID is required" });
        }
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        if (!expense.image) {
            return res.status(200).json({ message: "Receipt image not added" });
        }

        const imageBuffer = Buffer.from(expense.image, 'base64');
        const { mime } = await fromBuffer(imageBuffer);
        res.type(mime); // image content type
        res.status(200);
        res.send(imageBuffer);  

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update expense data
const updateExpense = async (req, res) => {
    const expenseId = req.params.expenseId;
    const { tripId, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // find expense by id
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json();
        }
        // update expense data
        const updatedExpense = await expense.update({ tripId, name, amount, category, currency, posted, notes, image });
        res.status(200).json({ data: updatedExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
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
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createExpense,
    uploadReceipt,
    getExpenses,
    getExpenseById,
    getExpensesByTripId,
    getReceiptImageByExpenseId,
    updateExpense,
    deleteExpense
};