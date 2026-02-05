import api from './index';

/**
 * 이용권 구매 처리
 * @param {object} purchaseData - 구매 정보 { productId, paymentMethod, ... }
 * @returns {Promise} 구매 결과
 */
export const purchasePass = (purchaseData) => {
  return api.post('/orders/purchase', purchaseData);
};
