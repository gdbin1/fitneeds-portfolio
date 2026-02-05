// src/api/passFaq.js
import api from './index';

export const getFaqs = (category) =>
  api.get('/passfaq', {
    params: category ? { category } : {}
  });

export const getFaq = (faqId) =>
  api.get(`/passfaq/${faqId}`);