// src/api/passLogs.js
import api from './index';

export const getPassLogsByUser = (userId) =>
  api.get('/pass/pass-logs', { params: { userId } });

export const getPassLogsByUserPass = (userPassId) =>
  api.get(`/pass/pass-logs/${userPassId}`);