const Expense = require('../models/Expense');

//  post new expense to the db
const createExpense = async (req, res) => {
    const { expense_id, trip_id, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // create a model instance 
        const newExpense = await Expense.create({ expense_id, trip_id, name, amount, category, currency, posted, notes, image });
        res.status(201).json({ data: newExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });

    }
};

// get all expenses from db
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
    const id = req.params.id;
    try {
        const expense = await Expense.findByPk(id);
        if (!expense) {
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
    const id = req.params.id;
    const { trip_id, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // find expense by id
        const expense = await Expense.findByPk(id);
        if (!expense) {
            return res.status(404).json();
        }
        // update expense data
        const updatedExpense = await expense.update({ trip_id, name, amount, category, currency, posted, notes, image });
        res.json({ data: updatedExpense });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE expense data
const deleteExpense = async (req, res) => {
    const id = req.params.id;
    try {
        // delete expense by id
        const deletedCount = await Expense.destroy({ where: { expense_id: id } });
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
    updateExpense,
    deleteExpense
};