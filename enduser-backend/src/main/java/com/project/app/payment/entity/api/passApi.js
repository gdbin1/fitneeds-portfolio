// src/api/passApi.js
import api from './index'; // 기존에 작성하신 공통 axios 인스턴스

/**
 * [관리자] 회원 이용권 관리 API 서비스
 * 백엔드 AdminPassController와 1:1 대응
 */
const passApi = {
    
    // 1. 이용권 목록 조회 (페이징 & 검색)
    // UserPassSearchDto와 매핑됨
    getPasses: (params) => {
        // 빈 값 제거 (백엔드 500 에러 방지)
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );
        console.log("🔗 API 요청 파라미터:", filteredParams);
        return api.get('/user-pass', { params: filteredParams });
    },

    // 2. 특정 회원별 활성 이용권 목록 조회
    getUserPasses: (userId) => {
        return api.get(`/user-pass/user/${userId}`);
    },

    // 3. 이용권 상세 조회 (이력 포함)
    // UserPassResponse(histories 포함) 반환
    getPassDetail: (id) => {
        return api.get(`/user-pass/${id}`);
    },

    // 4. 이용권 수동 등록
    // UserPassCreateRequest Body 전달
    createPass: (data) => {
        return api.post('/user-pass', data);
    },

    // 5. 이용권 정보(횟수 등) 수정
    // UserPassUpdateRequest Body 전달
    updatePass: (id, data) => {
        return api.put(`/user-pass/${id}`, data);
    },

    // 6. 이용권 상태 변경 (PATCH)
    // @RequestParam status 처리
    updateStatus: (id, status) => {
        return api.patch(`/user-pass/${id}/status`, null, { params: { status } });
    },

    // 7. 이용권 삭제 (전액 회수)
    deletePass: (id) => {
        return api.delete(`/user-pass/${id}`);
    },

    // 8. 이용권 등록을 위한 회원 검색
    searchUsers: (keyword) => {
        return api.get('/user-pass/search-users', { params: { keyword } });
    },

    // 9. 셀렉트 박스용 활성 스포츠 목록 조회
    getActiveSports: () => {
        return api.get('/user-pass/sports/active');
    }
};

export default passApi;