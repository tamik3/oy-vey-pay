const { z } = require("zod");
const User = require("../models/user");
const { userIdValidation } = require("../lib/validation/user");
const { expenseSchema, expenseIdValidation } = require("../lib/validation/expense");
const Expense = require("../models/expense");

const addExpense = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const userId = userIdValidation.parse(req.params.userId);
    const { title, description, amount, tag, currency } = req.body;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const BASE_CURRENCY = "ILS";

    let exchangedAmount;

    if (currency !== BASE_CURRENCY) {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/pair/${currency}/ILS/${amount}`
      );

      if (!response.ok) {
        return res.status(400).json({ message: "Failed to exchange" });
      }

      const data = await response.json();
      exchangedAmount = data.conversion_result;
    }

    const expense = new Expense({
      title,
      description,
      amount,
      tag,
      currency,
      exchangedAmount,
    });

    await expense.save();

    userExists.expenses.push(expense);

    await userExists.save();

    return res.status(201).json({ message: "Expense added succefully", expense });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const getExpenses = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const expenses = await Expense.find({ _id: { $in: userExists.expenses } });

    return res.status(200).json(expenses);
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateExpense = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);
    const expenseId = expenseIdValidation.parse(req.params.expenseId);

    const { title, description, amount, tag, currency } = expenseSchema.parse(req.body);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userExists.expenses.includes(expenseId)) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const BASE_CURRENCY = "ILS";

    let exchangedAmount = 0;

    const expense = await Expense.findById(expenseId);
    if (expense.currency !== currency || expense.amount !== amount) {
      if (currency !== BASE_CURRENCY) {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/pair/${currency}/ILS/${amount}`
        );

        if (!response.ok) {
          return res.status(400).json({ message: "Failed to exchange" });
        }

        const data = await response.json();
        exchangedAmount = data.conversion_result;
      }
    }


    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        title,
        description,
        amount,
        tag,
        currency,
        exchangedAmount,
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await updatedExpense.save();

    return res.status(200).json({ message: "Expense updated successfuly" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteExpense = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);
    const expenseId = expenseIdValidation.parse(req.params.expenseId);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userExists.expenses.includes(expenseId)) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.findByIdAndDelete(expenseId);

    userExists.expenses = userExists.expenses.filter((id) => id.toString() !== expenseId);

    await userExists.save();

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTotalAmount = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const expenses = await Expense.find({ _id: { $in: userExists.expenses } });

    const totalAmount = expenses.reduce(
      (acc, expense) => acc + (expense.exchangedAmount || expense.amount),
      0
    );

    return res.status(200).json({ totalAmount: totalAmount.toFixed(2) });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getTotalAmount,
};
