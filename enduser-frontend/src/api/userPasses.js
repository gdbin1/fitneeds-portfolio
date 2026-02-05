// src/api/userPasses.js
import api from './index';

export const createUserPass = (data) =>
  api.post('/pass/passes', data);

export const getUserPasses = (userId) =>
  api.get('/pass/passes', { params: { userId } });

export const getActiveUserPasses = (userId) =>
  api.get('/pass/passes/active', { params: { userId } });

export const getUserPass = (userPassId, userId) =>
  api.get(`/pass/passes/${userPassId}`, { params: { userId } });

export const useUserPass = (userPassId, userId) =>
  api.post(`/pass/passes/${userPassId}/use`, null, {
    params: { userId }
  });

export const getUserPassLogs = (userPassId) =>
  api.get(`/pass/passes/${userPassId}/logs`);