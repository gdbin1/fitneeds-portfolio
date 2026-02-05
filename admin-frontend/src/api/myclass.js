// file: src/api/myclass.js
import api from "./index";

/**
 * 내 수업(스케줄) 목록
 * GET /api/myclass/schedules?fromDt&toDt&sttsCd&brchId&teacherId
 */
export async function getMySchedules(params = {}) {
    const res = await api.get("/myclass/schedules", { params });
    return res.data;
}

/**
 * 내 수업(스케줄) 상세
 * GET /api/myclass/schedules/{schdId}
 */
export async function getMyScheduleDetail(schdId) {
    const res = await api.get(`/myclass/schedules/${schdId}`);
    return res.data;
}

/**
 * 예약자 목록
 * GET /api/myclass/schedules/{schdId}/reservations
 */
export async function getMyScheduleReservations(schdId) {
    const res = await api.get(`/myclass/schedules/${schdId}/reservations`);
    return res.data;
}

/**
 * 정산(조회)
 * GET /api/myclass/settlements?month&brchId&teacherId ...
 */
export async function getMySettlements(params = {}) {
    const res = await api.get("/myclass/settlements", { params });
    return res.data;
}