// src/api/scheduleApi.js
import api from './index';

const scheduleApi = {
    // 1. 스케줄이 있는 날짜 목록 조회 (달력 활성화용)
    // sportId 파라미터로 특정 종목만 필터링 가능
    getScheduledDates: (sportId = null) => {
        const params = sportId ? { sportId } : {};
        return api.get('/schedules/dates', { params });
    },

    // 2. 특정 날짜의 스케줄 목록 조회
    getSchedulesByDate: (date) => {
        return api.get('/schedules', { params: { date } });
    }
};

export default scheduleApi;