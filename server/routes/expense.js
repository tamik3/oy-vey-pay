const { addExpense, getExpenses, updateExpense, deleteExpense, getTotalAmount } = require("../controllers/expense");

const router = require("express").Router();

router.post("/add-expense/:userId", addExpense);
router.get("/get-expenses/:userId", getExpenses);
router.patch("/update-expense/:userId/:expenseId", updateExpense);
router.delete("/delete-expense/:userId/:expenseId", deleteExpense);
router.get("/get-total-expense-amount/:userId", getTotalAmount);

module.exports = router;