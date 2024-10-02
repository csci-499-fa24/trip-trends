const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

router.post("/create-expense", ExpenseController.createExpense);
router.get("/get-expenses", ExpenseController.getExpenses);
router.get("/get-expense/:id", ExpenseController.getExpenseById);
router.get("/:tripId/get-trip-expenses/", ExpenseController.getExpensesByTripId);
router.put("/update-expense/:id", ExpenseController.updateExpense);
router.delete("/delete-expense/:id", ExpenseController.deleteExpense);

module.exports = router;