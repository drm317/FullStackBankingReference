import axios from 'axios';
import { AuthResponse, Account, Transaction, TransactionRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const accountService = {
  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getAccount: async (accountId: string): Promise<Account> => {
    const response = await api.get(`/accounts/${accountId}`);
    return response.data;
  },

  getAccountTransactions: async (accountId: string, page = 1): Promise<{
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get(`/accounts/${accountId}/transactions?page=${page}`);
    return response.data;
  },
};

export const transactionService = {
  transfer: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await api.post('/transactions/transfer', data);
    return response.data.transaction;
  },

  deposit: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await api.post('/transactions/deposit', data);
    return response.data.transaction;
  },

  withdraw: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await api.post('/transactions/withdraw', data);
    return response.data.transaction;
  },
};

export default api;