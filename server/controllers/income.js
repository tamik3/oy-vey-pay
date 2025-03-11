const { z } = require("zod");
const User = require("../models/user");
const { userIdValidation } = require("../lib/validation/user");
const { incomeSchema, incomeIdValidation } = require("../lib/validation/income");
const Income = require("../models/income");

const addIncome = async (req, res) => {
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

    const income = new Income({
      title,
      description,
      amount,
      tag,
      currency,
      exchangedAmount,
    });

    await income.save();

    userExists.incomes.push(income);

    await userExists.save();

    return res.status(201).json({ message: "Income added succefully", income });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const getIncomes = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const incomes = await Income.find({ _id: { $in: userExists.incomes } });

    return res.status(200).json(incomes);
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateIncome = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);
    const incomeId = incomeIdValidation.parse(req.params.incomeId);

    const { title, description, amount, tag, currency } = incomeSchema.parse(req.body);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userExists.incomes.includes(incomeId)) {
      return res.status(404).json({ message: "Income not found" });
    }

    const BASE_CURRENCY = "ILS";

    let exchangedAmount = 0;

    const income = await Income.findById(incomeId);
    if (income.currency !== currency || income.amount !== amount) {
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


    const updatedIncome = await Income.findByIdAndUpdate(
      incomeId,
      {
        title,
        description,
        amount,
        tag,
        currency,
        exchangedAmount,
      }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }

    await updatedIncome.save();

    return res.status(200).json({ message: "Income updated successfuly" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteIncome = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const userId = userIdValidation.parse(req.params.userId);
    const incomeId = incomeIdValidation.parse(req.params.incomeId);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userExists.incomes.includes(incomeId)) {
      return res.status(404).json({ message: "Income not found" });
    }

    await Income.findByIdAndDelete(incomeId);

    userExists.incomes = userExists.incomes.filter((id) => id.toString() !== incomeId);

    await userExists.save();

    return res.status(200).json({ message: "Income deleted successfully" });
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

    const incomes = await Income.find({ _id: { $in: userExists.incomes } });

    const totalAmount = incomes.reduce(
      (acc, income) => acc + (income.exchangedAmount || income.amount),
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
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
  getTotalAmount,
};
