const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

router.post("/trips/:tripId/", ExpenseController.createExpense);
router.post("/trips/:tripId/upload", ExpenseController.uploadReceipt);
router.get("/", ExpenseController.getExpenses);
router.get("/:expenseId", ExpenseController.getExpenseById);
router.get("/trips/:tripId/", ExpenseController.getExpensesByTripId);
router.get("/:expenseId/img", ExpenseController.getReceiptImageByExpenseId);
router.put("/:expenseId", ExpenseController.updateExpense);
router.delete("/:expenseId", ExpenseController.deleteExpense);

module.exports = router;