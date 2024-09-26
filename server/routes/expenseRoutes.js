const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

router.post("/create-expense", ExpenseController.createExpense);
router.get("/get-expenses", ExpenseController.getExpenses);

module.exports = router;