import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// localStorage 키 정의
export const ACCESS_TOKEN_KEY = 'accessToken';
export const USER_NAME_KEY = 'userName';
export const USER_ID_KEY = 'userId';
export const ROLE_KEY = 'role';
export const BRCH_ID_KEY = 'brchId'; // 새로 추가된 brchId 키

// 비동기 로그인 액션
export const login = createAsyncThunk(
    'auth/login', // slice name/action name 형식으로 변경
    async ({ userId, email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/login', { userId, email, password });
            const token = response.data.token;
            const userName = response.data.user.userName || null; // userName이 없을 경우 null로 처리
            const role = response.data.user.role;
            const brchId = response.data.user.brchId || null; // brchId도 백엔드에서 받아오기
            const loggedInUserId = response.data.user.userId; // 로그인 응답에서 실제 userId를 가져옴

            console.log("Login Response Data:", response.data);

            // localStorage에 모든 관련 정보 저장
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
            localStorage.setItem(USER_NAME_KEY, userName);
            localStorage.setItem(USER_ID_KEY, loggedInUserId); // 응답받은 userId 저장
            localStorage.setItem(ROLE_KEY, role);
            localStorage.setItem(BRCH_ID_KEY, brchId);
            localStorage.setItem('isLoggedIn', true); // 로그인 상태 저장

            // Redux 상태 업데이트를 위해 필요한 모든 정보 리턴
            return {
                token,
                userName,
                userId: loggedInUserId, // userId는 여기서 응답받은 값으로 사용
                role,
                brchId,
            };
        } catch (error) {
            const message = error.response?.data?.message || '로그인 실패';
            console.error("Login Error:", error.response?.data);
            return rejectWithValue(message);
        }
    }
);

// 인증 Slice 정의
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
        userName: localStorage.getItem(USER_NAME_KEY) || null,
        userId: localStorage.getItem(USER_ID_KEY) || null,
        role: localStorage.getItem(ROLE_KEY) || null,
        brchId: localStorage.getItem(BRCH_ID_KEY) || null, // 초기 상태에서 brchId 로드
        isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY), // 토큰 유무로 인증 상태 판단
        isLoading: false,
        error: null,
    },
    reducers: {
        // 로그아웃 액션
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.userName = null;
            state.userId = null;
            state.role = null;
            state.brchId = null; // Redux 상태에서 brchId 초기화

            // localStorage에서 모든 관련 정보 제거
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_NAME_KEY);
            localStorage.removeItem(USER_ID_KEY);
            localStorage.removeItem(ROLE_KEY);
            localStorage.removeItem(BRCH_ID_KEY); // localStorage에서 brchId 제거
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('authToken'); // 'authToken'도 제거 (어떤 용도인지는 명확치 않지만 1번 코드에 있었으므로 포함)
        },
        // 사용자 이름 설정 (필요에 따라 외부에서 userName 업데이트 시 사용)
        setUsername: (state, action) => {
            state.userName = action.payload;
            // setUsername 액션으로 userName이 변경될 때도 localStorage에 반영
            if (action.payload) {
                localStorage.setItem(USER_NAME_KEY, action.payload);
            } else {
                localStorage.removeItem(USER_NAME_KEY);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.userName = action.payload.userName;
                state.userId = action.payload.userId; // userId도 상태 업데이트
                state.role = action.payload.role; // role도 상태 업데이트
                state.brchId = action.payload.brchId; // brchId도 상태 업데이트
                state.error = null; // 로그인 성공 시 에러 초기화
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
                // 로그인 실패 시 Redux 상태 초기화
                state.token = null;
                state.userName = null;
                state.userId = null;
                state.role = null;
                state.brchId = null; // Redux 상태에서 brchId 초기화

                // 로그인 실패 시 localStorage 정보도 제거
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(USER_NAME_KEY);
                localStorage.removeItem(USER_ID_KEY);
                localStorage.removeItem(ROLE_KEY);
                localStorage.removeItem(BRCH_ID_KEY); // localStorage에서 brchId 제거
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('authToken'); // 'authToken'도 제거
            });
        // fetchUserInfo 관련 extraReducers는 모두 제거되었습니다.
    },
});

export const { logout, setUsername } = authSlice.actions; // 액션 내보내기
export default authSlice.reducer; // 리듀서 내보내기