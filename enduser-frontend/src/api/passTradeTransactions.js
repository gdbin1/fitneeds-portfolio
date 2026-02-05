// src/api/passTradeTransactions.js
import api from './index';

export const getAllTransactions = (userId) =>
  api.get('/pass-trade-transactions', { params: { userId } });

export const getTransaction = (transactionId) =>
  api.get(`/pass-trade-transactions/${transactionId}`);

export const getSellTransactions = (userId) =>
  api.get('/pass-trade-transactions/sell', { params: { userId } });

export const getBuyTransactions = (userId) =>
  api.get('/pass-trade-transactions/buy', { params: { userId } });