import api from "./api";

export const createExpense = async (payload) => {
  try {
    const { userId } = payload;
    const { data } = await api.post(`/add-expense/${userId}`, payload);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while creating the expense. Please try again.";

    throw new Error(message);
  }
};

export const getExpenses = async (userId) => {
  try {
    const { data } = await api.get(`/get-expenses/${userId}`);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while getting the expenses. Please try again.";

    throw new Error(message);
  }
};

export const updateExpense = async (payload) => {
  try {
    const { data } = await api.patch(`/update-expense/${payload.userId}/${payload.expenseId}`, payload);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while updating the expense. Please try again.";

    throw new Error(message);
  }
};

export const deleteExpense = async (expenseId, userId) => {
  try {
    const { data } = await api.delete(`/delete-expense/${userId}/${expenseId}`);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while deleting the expense. Please try again.";

    throw new Error(message);
  }
};

export const getTotalExpensesAmount = async (userId) => {
  try {
    const { data } = await api.get(`/get-total-expense-amount/${userId}`);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while getting the total amount. Please try again.";

    throw new Error(message);
  }
};