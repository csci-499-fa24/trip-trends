const Expense = require('../models/Expense');

//  post new expense to the db
const createExpense = async (req, res) => {
    const { expense_id, trip_id, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // create a model instance 
        const newExpense = await Expense.create({ expense_id, trip_id, name, amount, category, currency, posted, notes, image });
        res.json({ data: newExpense });
    } catch (err) {
        console.error(err);
    }
};

// get all expenses from db
const getExpenses = async (req, res) => {
    try {
        const allExpenses = await Expense.findAll();
        res.json({ data: allExpenses });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    createExpense,
    getExpenses,
};