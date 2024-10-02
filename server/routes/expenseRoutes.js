const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

router.post("/", ExpenseController.createExpense);
router.get("/", ExpenseController.getExpenses);
router.get("/:expenseId", ExpenseController.getExpenseById);
router.get("/trips/:tripId/", ExpenseController.getExpensesByTripId);
router.put("/:expenseId", ExpenseController.updateExpense);
router.delete("/:expenseId", ExpenseController.deleteExpense);

module.exports = router;