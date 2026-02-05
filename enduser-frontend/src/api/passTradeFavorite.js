// src/api/passTradeFavorite.js
import api from './index';

export const addFavorite = (token, postId) =>
  api.post(
    '/pass-trade-favorite',
    { postId },
    { headers: { Authorization: token } }
  );

export const removeFavorite = (token, postId) =>
  api.delete(`/pass-trade-favorite/${postId}`, {
    headers: { Authorization: token }
  });

export const getFavorites = (token) =>
  api.get('/pass-trade-favorite', {
    headers: { Authorization: token }
  });

export const isFavorite = (token, postId) =>
  api.get(`/pass-trade-favorite/${postId}`, {
    headers: { Authorization: token }
  });