// src/api/reservationApi.js
import api from './index';

const reservationApi = {
    // 1. 예약 목록 조회 (ReservationSearchRequest 매핑)
    getReservations: (params) => {
        return api.get('/reservations', { params });
    },

    // 2. 예약 상세 조회
    getReservationDetail: (id) => {
        return api.get(`/reservations/${id}`);
    },

    // 3. 예약 수동 등록 (ReservationCreateRequest)
    createReservation: (data) => {
        return api.post('/reservations', data);
    },

    // 4. 예약 정보(스케줄) 수정 (PATCH)
    updateReservation: (id, data) => {
        return api.patch(`/reservations/${id}`, data);
    },

    // 5. 예약 취소 (PATCH)
    cancelReservation: (id, data) => {
        return api.patch(`/reservations/${id}/cancel`, data);
    },

    // 6. 예약 상태 변경 (PATCH)
    updateReservationStatus: (id, data) => {
        return api.patch(`/reservations/${id}/status`, data);
    }
};

export default reservationApi;