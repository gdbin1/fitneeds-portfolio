// src/api/passTrade.js
import api from './index';

export const createTradePost = (sellerId, data) =>
  api.post('/pass-trade/posts', data, {
    params: { sellerId }
  });

export const getTradePosts = () =>
  api.get('/pass-trade/posts');

export const buyTrade = (postId, buyerId, data) =>
  api.post(`/pass-trade/posts/${postId}/buy`, data, {
    params: { buyerId }
  });