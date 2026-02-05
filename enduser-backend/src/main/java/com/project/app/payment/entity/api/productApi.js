// src/api/productApi.js
import api from './index';

const productApi = {
    // 1. 상품 목록 조회 (ProductSearchRequest 매핑)
    getProducts: (params) => {
        const filteredParams = Object.fromEntries(
            Object.entries(params || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );
        return api.get('/pass-products', { params: filteredParams });
    },

    // 2. 상품 상세 조회
    getProductDetail: (id) => {
        return api.get(`/pass-products/${id}`);
    },

    // 3. 상품 등록 (ProductCreateRequest)
    createProduct: (data) => {
        return api.post('/pass-products', data);
    },

    // 4. 상품 수정 (ProductUpdateRequest)
    updateProduct: (id, data) => {
        return api.put(`/pass-products/${id}`, data);
    },

    // 5. 상태 변경 (판매중/중지)
    updateStatus: (id, useYn) => {
        return api.patch(`/pass-products/${id}/status`, null, { params: { useYn } });
    },

    // 6. 상품 삭제
    deleteProduct: (id) => {
        return api.delete(`/pass-products/${id}`);
    }
};

export default productApi;