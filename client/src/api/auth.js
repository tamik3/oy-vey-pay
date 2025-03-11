import api from "./api";

export const signUp = async (payload) => {
  try {
    const { data } = await api.post("/sign-up", payload);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while signing up. Please try again.";

    throw new Error(message);
  }
};

export const signIn = async (payload) => {
  try {
    const { data } = await api.post("/sign-in", payload);

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while signing in. Please try again.";

    throw new Error(message);
  }
};

export const me = async () => {
  try {
    const { data } = await api.get("/me");

    return data;
  } catch (error) {
    const message =
      error.response?.data.message ||
      "an erro occurred while fetching userdata. please try agian.";

    throw new Error(message);
  }
};

export const logout = async (payload) => {
  try {
    await api.post("/log-out", payload);

    window.location.href = '/auth';
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "An error occured while logging out. Please try again.";

    throw new Error(message);
  }
};