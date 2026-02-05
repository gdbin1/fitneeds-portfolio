// src/api/index.js
import axios from 'axios';
import { ACCESS_TOKEN_KEY } from '../store/authSlice';

// import store from '../store'; // Redux Store를 import하여 로그아웃 액션 디스패치

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 에러 처리 (예: 401 Unauthorized 시 로그아웃)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // window.location.href = '/login' 등 로그인 페이지로 리디렉션
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            console.log('401 Unauthorized. Access token removed from localStorage.');
        }
        return Promise.reject(error);
    }
);

// Branch API
export const branchApi = {
    getAll: () => api.get('/branch').then(res => res.data),
    getById: (brchId) => api.get(`/branch/${brchId}`).then(res => res.data),
    create: (data) => api.post('/branch', data).then(res => res.data),
    update: (brchId, data) => api.put(`/branch/${brchId}`, data).then(res => res.data),
    delete: (brchId) => api.delete(`/branch/${brchId}`).then(res => res.data),
    updateStatus: (brchId, status) => api.put(`/branch/${brchId}`, { status }).then(res => res.data),
};

// BranchInfo API
export const branchInfoApi = {
    getAll: () => api.get('/branch-info').then(res => res.data),
    getById: (brInfoId) => api.get(`/branch-info/${brInfoId}`).then(res => res.data),
    create: (data) => api.post('/branch-info', data).then(res => res.data),
    update: (brInfoId, data) => api.put(`/branch-info/${brInfoId}`, data).then(res => res.data),
    delete: (brInfoId) => api.delete(`/branch-info/${brInfoId}`).then(res => res.data),
};

// CenterInfo API (BranchInfo의 별칭, getByBranch 메서드 포함)
export const centerInfoApi = {
    getAll: () => branchInfoApi.getAll(),
    getById: (brInfoId) => branchInfoApi.getById(brInfoId),
    getByBranch: (branchId) => {
        // 지점 ID로 필터링하여 조회 (타입 차이 고려)
        return branchInfoApi.getAll().then(list => {
            const filtered = list.filter(item => String(item.brchId || item.brch_id) === String(branchId));
            const result = filtered.length > 0 ? filtered[0] : null;
            return { data: result };
        });
    },
    create: (data) => branchInfoApi.create(data),
    update: (brInfoId, data) => branchInfoApi.update(brInfoId, data),
    delete: (brInfoId) => branchInfoApi.delete(brInfoId),
};

// Payment API
export const paymentApi = {
    getAll: () => api.get('/payment').then(res => res.data),
    getById: (payId) => api.get(`/payment/${payId}`).then(res => res.data),
    create: (data) => api.post('/payment', data).then(res => res.data),
    update: (payId, data) => api.put(`/payment/${payId}`, data).then(res => res.data),
    delete: (payId) => api.delete(`/payment/${payId}`).then(res => res.data),
};

// PassProduct API
export const passProductApi = {
    getAll: () => api.get('/pass-product').then(res => res.data),
    getById: (prodId) => api.get(`/pass-product/${prodId}`).then(res => res.data),
    create: (data) => api.post('/pass-product', data).then(res => res.data),
    update: (prodId, data) => api.put(`/pass-product/${prodId}`, data).then(res => res.data),
    delete: (prodId) => api.delete(`/pass-product/${prodId}`).then(res => res.data),
};

// PassLog API
export const passLogApi = {
    getAll: () => api.get('/pass-log').then(res => res.data),
    getById: (passLogId) => api.get(`/pass-log/${passLogId}`).then(res => res.data),
    create: (data) => api.post('/pass-log', data).then(res => res.data),
    update: (passLogId, data) => api.put(`/pass-log/${passLogId}`, data).then(res => res.data),
    delete: (passLogId) => api.delete(`/pass-log/${passLogId}`).then(res => res.data),
};

// SportType API
export const sportTypeApi = {
    getAll: () => api.get('/sport-types').then(res => res.data),
    getById: (sportId) => api.get(`/sport-types/${sportId}`).then(res => res.data),
    create: (data) => api.post('/sport-types', data).then(res => res.data),
    update: (sportId, data) => api.put(`/sport-types/${sportId}`, data).then(res => res.data),
    delete: (sportId) => api.delete(`/sport-types/${sportId}`).then(res => res.data),
};

// Program API
export const programApi = {
    getAll: () => api.get('/program').then(res => res.data),
    getById: (progId) => api.get(`/program/${progId}`).then(res => res.data),
    create: (data) => api.post('/program', data).then(res => res.data),
    update: (progId, data) => api.put(`/program/${progId}`, data).then(res => res.data),
    delete: (progId) => api.delete(`/program/${progId}`).then(res => res.data),
};

// User API
export const userApi = {
    getAll: () => api.get('/user/all').then(res => res.data),
    getById: (userId) => api.get(`/user/userinfo/${userId}`).then(res => res.data),
    create: (data) => api.post('/user/register', data).then(res => res.data),
};

// Teacher API (user_admin 테이블 사용)
export const teacherApi = {
    getAll: () => api.get('/user/teachers').then(res => res.data), // user_admin 조회
    getById: (teacherId) => api.get(`/user/userinfo/${teacherId}`).then(res => res.data),
    getByBranch: (brchId) => api.get(`/user/teachers/${brchId}`).then(res => res.data), // user_admin 조회
    create: (data) => api.post('/user/register', data).then(res => res.data),
    update: (teacherId, data) => api.put(`/user/${teacherId}`, data).then(res => res.data),
    delete: (teacherId) => api.delete(`/user/${teacherId}`).then(res => res.data),
};

// Schedule API
export const scheduleApi = {
    getAll: () => api.get('/schedule').then(res => res.data),
    getById: (schdId) => api.get(`/schedule/${schdId}`).then(res => res.data),
    create: (dataOrBranchId, scheduleData) => {
        // AdminSchedulePage.jsx에서 사용하는 형태: create(data)
        if (scheduleData === undefined) {
            return api.post('/schedule', dataOrBranchId).then(res => res.data);
        }
        // ScheduleCalendar.jsx에서 사용하는 형태: create(branchId, data)
        // branchId는 무시하고 data만 사용
        return api.post('/schedule', scheduleData).then(res => res.data);
    },
    update: (schdIdOrBranchId, scheduleIdOrData, scheduleData) => {
        // AdminSchedulePage.jsx에서 사용하는 형태: update(schdId, data)
        if (scheduleData === undefined) {
            return api.put(`/schedule/${schdIdOrBranchId}`, scheduleIdOrData).then(res => res.data);
        }
        // ScheduleCalendar.jsx에서 사용하는 형태: update(branchId, scheduleId, data)
        // branchId는 무시하고 scheduleId와 data만 사용
        return api.put(`/schedule/${scheduleIdOrData}`, scheduleData).then(res => res.data);
    },
    delete: (schdIdOrBranchId, scheduleId) => {
        // AdminSchedulePage.jsx에서 사용하는 형태: delete(schdId)
        if (scheduleId === undefined) {
            return api.delete(`/schedule/${schdIdOrBranchId}`).then(res => res.data);
        }
        // ScheduleCalendar.jsx에서 사용하는 형태: delete(branchId, scheduleId)
        // branchId는 무시하고 scheduleId만 사용
        return api.delete(`/schedule/${scheduleId}`).then(res => res.data);
    },
    getByDateRange: (branchId, startDate, endDate) => {
        // 날짜 범위로 필터링하여 조회
        // 백엔드에 해당 엔드포인트가 없으므로 프론트엔드에서 필터링
        return api.get('/schedule').then(res => {
            const allSchedules = res.data || [];
            const filtered = allSchedules.filter(schedule => {
                // schedule의 날짜 필드 확인 (strtDt, endDt 등)
                const scheduleDate = schedule.strtDt || schedule.startDate || schedule.date;
                if (!scheduleDate) return false;
                
                // branchId 필터링 (brchId, branchId 등)
                if (branchId !== undefined && branchId !== null) {
                    const scheduleBranchId = schedule.brchId || schedule.branchId;
                    if (scheduleBranchId != branchId) return false;
                }
                
                // 날짜 범위 필터링
                const date = new Date(scheduleDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return date >= start && date <= end;
            });
            return { data: filtered };
        });
    },
};

export default api;