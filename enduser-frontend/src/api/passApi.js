import api from './index';

/**
 * 사용자의 현재 이용권 목록 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise} 이용권 목록
 */
export const getMyPasses = (userId) => {
  return api.get('/my-pass', {
    params: { userId }
  });
};

/**
 * 특정 이용권 상세정보 조회
 * @param {number} id - 이용권 ID
 * @returns {Promise} 이용권 상세정보
 */
export const getMyPassDetail = (id) => {
  return api.get(`/my-pass/${id}`);
};
