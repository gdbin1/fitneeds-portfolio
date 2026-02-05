import api from './index';

/**
 * 구매 가능한 상품(이용권) 목록 조회
 * @returns {Promise} 상품 목록
 */
export const listProducts = () => {
  return api.get('/store/products');
};

/**
 * 특정 상품 상세정보 조회
 * @param {number} id - 상품 ID
 * @returns {Promise} 상품 상세정보
 */
export const getProduct = (id) => {
  return api.get(`/store/products/${id}`);
};
