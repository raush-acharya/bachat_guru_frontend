import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://192.168.1.69:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("API Request:", config.method, config.url, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    throw error;
  }
);

export const login = (email, password) =>
  api.post("/auth/login", { email, password });
export const signup = (data) => api.post("/auth/register", data);
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });
export const addExpense = (data) => api.post("/expense", data);
export const getExpenses = (params) => api.get("/expense", { params });
export const getDashboard = (params) => api.get("/dashboard", { params });
export const getCategories = (params) => api.get("/category", { params });
export const addCategory = (data) => api.post("/category", data);
export const addIncome = (data) => api.post("/income", data);
export const addLoan = (data) => api.post("/loan", data);
export const getLoan = (params) => api.get("/loan", { params }); 
export const recordLoanPayment = (loanId, paymentData) => api.post(`/loan/${loanId}/payment`, paymentData);
export const addBudget = (data) => api.post("/budget", data);
export const getTransactions = (params) => api.get("/transactions", { params });
export const getBudget = (params) => api.get("/budget", { params });
export const getIncome = (params) => api.get("/income", { params });
export const getUser = () => api.get("/auth/user");