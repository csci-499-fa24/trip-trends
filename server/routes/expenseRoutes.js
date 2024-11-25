const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

router.post("/trips/:tripId/", ExpenseController.createExpense);
router.post("/process-receipt", ExpenseController.getExtractedReceiptData);
router.get("/", ExpenseController.getExpenses);
router.get("/:expenseId", ExpenseController.getExpenseById);
router.get("/trips/:tripId/", ExpenseController.getExpensesByTripId);
router.get("/:expenseId/image", ExpenseController.getReceiptImageByExpenseId);
router.put("/:expenseId", ExpenseController.updateExpense);
router.patch("/:expenseId", ExpenseController.updateExpense);
router.delete("/:expenseId", ExpenseController.deleteExpense);
router.post("/link-token", ExpenseController.createLinkToken);
router.post("/exchange-public-token", ExpenseController.exchangePublicToken);
router.post("/transactions", ExpenseController.getTransactions);

module.exports = router;