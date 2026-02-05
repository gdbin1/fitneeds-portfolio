// file: src/api/teachers.js
import api from "./index";

/**
 * 목록 조회
 * @param {Object} params
 * @param {string} [params.status] - ACTIVE | LEAVE | RESIGNED | ALL (미지정/ALL이면 전체)
 * @param {number} [params.branchId]
 * @param {number} [params.sportId]
 */
export async function getTeacherList(params = {}) {
    const { status, branchId, sportId, keyword, page, size } = params;

    const qp = {
        branchId: branchId ?? undefined,
        sportId: sportId ?? undefined,
    };
    if (status && status !== "ALL") qp.status = status;
    if (keyword && keyword.trim()) qp.keyword = keyword.trim();
    if (page != null) qp.page = page;
    if (size != null) qp.size = size;

    const res = await api.get("/teachers", { params: qp });
    return res.data; // TeacherResp[]
}

/**
 * 상세 조회
 */
export async function getTeacherDetail(userId) {
    const res = await api.get(`/teachers/${userId}`);
    return res.data; // TeacherResp
}

/**
 * 신규 등록
 */
export async function createTeacher(payload) {
    const res = await api.post("/teachers/new", payload);
    return res.data; // TeacherResp
}

/**
 * 수정
 */
export async function updateTeacher(userId, payload) {
    const res = await api.put(`/teachers/${userId}`, payload);
    return res.data; // TeacherResp
}

/**
 * 퇴직 처리
 */


// 프로필이 없는 강사에 대해 프로필 생성(사용자 동의 후 호출)
export async function createTeacherProfile(userId) {
    if (!userId) throw new Error("userId is required");
    const res = await api.post(`/teachers/${encodeURIComponent(userId)}/profile`);
    return res.data;
}

export async function retireTeacher(userId, payload) {
    const res = await api.patch(`/teachers/${userId}/retire`, payload);
    return res.data; // (204이면 undefined)
}

/**
 * 상태 변경
 */
export async function updateTeacherStatus(userId, payload) {
    const res = await api.patch(`/teachers/${userId}/status`, payload);
    return res.data; // 204면 undefined
}

/**
 *  강사 배정 수업 목록
 *  */
export async function getTeacherAssignedSchedules(userId, params = {}) {
    const res = await api.get(`/teachers/${userId}/schedules`, { params });
    return res.data;
}