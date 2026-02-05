// src/api/marketApi.js
import api from "./index";

const marketApi = {
  // --- 게시글(Post) 관리 ---
  // 1. 게시글 목록 조회
  getPosts: (params) => {
    return api.get("/market/posts", { params });
  },
  // 2. 게시글 상세 조회
  getPostDetail: (id) => {
    return api.get(`/market/posts/${id}`);
  },
  // 3. 게시글 수정 (PATCH)
  updatePost: (id, data) => {
    return api.patch(`/market/posts/${id}`, data);
  },
  // 4. 게시글 상태 변경 (판매중, 예약중, 완료 등)
  updatePostStatus: (id, status) => {
    return api.patch(`/market/posts/${id}/status`, null, {
      params: { status },
    });
  },
  // 5. 게시글 삭제 (DELETE)
  deletePost: (id) => {
    return api.delete(`/market/posts/${id}`);
  },

  // --- 거래(Trade) 내역 관리 ---
  // 6. 거래 내역 목록 조회
  getTrades: (params) => {
    return api.get("/market/trades", { params });
  },
  // 6-1. 거래 상세 조회
  getTradeDetail: (id) => {
    return api.get(`/market/trades/${id}`);
  },
  // 7. 거래 상태 변경 (완료/취소 시 이용권 이동 로직 실행)
  updateTradeStatus: (id, status) => {
    return api.patch(`/market/trades/${id}/status`, null, {
      params: { status },
    });
  },
};

export default marketApi;
