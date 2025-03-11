import api from "./api";

export const createIncome = async (payload) => {
    try {
        const { userId } = payload;
        const { data } = await api.post(`/add-income/${userId}`, payload);

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "An error occured while creating the income. Please try again.";

        throw new Error(message);
    }
};

export const getIncomes = async (userId) => {
    try {
        const { data } = await api.get(`/get-incomes/${userId}`);

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "An error occured while getting the incomes. Please try again.";

        throw new Error(message);
    }
};

export const updateIncome = async (payload) => {
    try {
        const { data } = await api.patch(`/update-income/${payload.userId}/${payload.incomeId}`, payload);

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "An error occured while updating the income. Please try again.";

        throw new Error(message);
    }
};

export const deleteIncome = async (incomeId, userId) => {
    try {
        const { data } = await api.delete(`/delete-income/${userId}/${incomeId}`);

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "An error occured while deleting the income. Please try again.";

        throw new Error(message);
    }
};

export const getTotalIncomesAmount = async (userId) => {
    try {
        const { data } = await api.get(`/get-total-incomes-amount/${userId}`);

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "An error occured while getting the total amount. Please try again.";

        throw new Error(message);
    }
};