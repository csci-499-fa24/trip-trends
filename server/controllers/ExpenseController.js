const Expense = require('../models/Expense');

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

// GET all expense data
const getExpenses = async (req, res) => {
    try {
        const allExpenses = await Expense.findAll();
        res.json({ data: allExpenses });
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
        res.json({ data: expense });
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
        res.json({ data: expense });
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
        res.json({ data: updatedExpense });
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
        res.status(204).json();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    getExpensesByTripId,
    updateExpense,
    deleteExpense
};