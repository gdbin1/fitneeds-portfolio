// src/components/auth/RegisterModal.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api';
import './AuthModalStyles.css';
import AgreeModal from './AgreeModal';

// 폼 입력 필드를 위한 초기 상태 정의 (컴포넌트 외부) 
const initialFormState = {
    userId: '',
    userName: '',
    password: '',
    email: '',
    phoneNumber: '',
    cashPoint: '',
    gradePoint: '',
    agreeAt: false, // agreeAt은 boolean으로 관리
    agree: false
};

function RegisterModal({ isOpen, onClose }) {
    // 1. 모든 Hooks 호출 (useState, useSelector, useDispatch)
    const { isAuthenticated, userId } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [formState, setFormState] = useState(initialFormState);
    const { userName, password, email, phoneNumber, cashPoint, gradePoint, agreeAt } = formState;

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isAgreeModalOpen, setIsAgreeModalOpen] = useState(false);

    // 2. useCallback, useMemo로 감싸진 함수 선언 (훅들이 선언된 이후)
    // 폼 입력 변경 핸들러
    const handleChange = useCallback((e) => {
        const { id, value, type, checked } = e.target;
        setFormState((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
        let processedValue = value;
        if (id === 'phoneNumber') {
            processedValue = value.replace(/[^0-9]/g, ''); // 숫자(0-9)가 아닌 모든 문자를 빈 문자열로 대체
        }
    }, []);

    // 공통 API 에러 처리 로직
    const handleApiError = useCallback((error, defaultMessage) => {
        console.error("API Call Error:", error);
        let errorMessage = defaultMessage;
        if (error.response) {
            console.error("Server Response Error Details:", error.response);
            errorMessage = error.response.data?.message || `서버 응답 오류: ${error.response.status} ${error.response.statusText}`;
            if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = "인증/권한 문제 또는 로그인이 만료되었습니다.";
            } else if (error.response.status === 404) {
                errorMessage = "데이터를 찾을 수 없습니다.";
            }
        } else if (error.request) {
            console.error("No Response Received:", error.request);
            errorMessage = '네트워크 오류 또는 서버 응답 없음.';
        } else {
            console.error("Request Setup Error:", error.message);
            errorMessage = `요청 설정 오류: ${error.message}`;
        }
        setMessage(errorMessage);
    }, []);

    // 사용자 정보 가져오기 함수
    const fetchUserInfo = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/userinfo', {
                params: { userId: userId }
            });
            console.log('User Info Response:', response.data);
            // setMessage('정보를 성공적으로 가져왔습니다.');

            setFormState({
                userId: response.data.userId || '',
                userName: response.data.userName || '',
                password: '',
                email: response.data.email || '',
                phoneNumber: response.data.phoneNumber || '',
                cashPoint: response.data.cashPoint !== undefined ? response.data.cashPoint : '',
                gradePoint: response.data.gradePoint !== undefined ? response.data.gradePoint : '',
                agreeAt: response.data.agreeAt || false
            });

        } catch (error) {
            handleApiError(error, '정보 가져오기 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [userId, handleApiError]); // 의존성 배열

    // 모달 상태 및 인증 여부에 따른 사이드 이펙트 관리
    useEffect(() => {
        if (isOpen && isAuthenticated && userId) {
            fetchUserInfo();
        }

        // 클린업 함수
        return () => {
            if (!isOpen) { // 모달이 닫힐 때만 상태 초기화
                setFormState(initialFormState);
                setMessage('');
                setIsLoading(false);
            }
        };
    }, [isOpen, isAuthenticated, userId, fetchUserInfo]); // 의존성 배열

    // useMemo 훅들 또한 여기에 위치해야 합니다!
    const formTitle = useMemo(() => isAuthenticated ? '내 정보' : '회원가입', [isAuthenticated]);
    const submitButtonText = useMemo(() => {
        if (isLoading) return isAuthenticated ? '수정 중...' : '가입 중...';
        return isAuthenticated ? '정보수정' : '회원가입';
    }, [isLoading, isAuthenticated]);


    // 3. 조건부 리턴 (모든 훅 호출 및 관련 함수 정의 이후)
    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated && !document.getElementById('agree').checked) {
            setMessage('개인정보 사용 및 수신에 동의하셔야 회원가입이 가능합니다.');
            return;
        }

        // if (isAuthenticated) {
        //     handleUpdateSubmit(e);
        // } else {
        setIsLoading(true);
        setMessage('');
        try {
            const response = await api.post('/admin/register', { ...formState, agreeAt: true });
            if (!isAuthenticated) {
                setMessage(response.data.message || '회원가입 성공!');
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
            } else {
                setMessage(response.data.message || '수정 성공!');
                alert('정보 수정이 완료되었습니다.');

                // 정보 수정 후 최신 정보 다시 불러오기
                fetchUserInfo();
            }

            onClose();
            setFormState(initialFormState);

        } catch (error) {
            handleApiError(error, '회원가입 실패');
        } finally {
            setIsLoading(false);
        }
        // }
    };

    const formatAgreeAt = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) { // 유효하지 않은 날짜인 경우
                return isoString; // 원본 문자열 반환
            }
            // 예시: "2025년 12월 26일" 형식으로 포맷팅
            // 옵션을 조절하여 원하는 포맷을 만들 수 있습니다.
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            // 시간까지 포함하려면:
            // return date.toLocaleString('ko-KR', {
            //     year: 'numeric', month: 'long', day: 'numeric',
            //     hour: '2-digit', minute: '2-digit', second: '2-digit',
            //     hour12: false // 24시간 형식
            // });
        } catch (e) {
            console.error("Failed to format date:", e);
            return isoString; // 에러 발생 시 원본 문자열 반환
        }
    };

    const isAgreeAtValid = (isoString) => {
        if (!isoString) return false;
        try {
            const date = new Date(isoString);
            return !isNaN(date.getTime());
        } catch (e) {
            return false;
        }
    }

    const agreeOpen = () => {
        if (document.getElementById('agree').checked == true) {
            setIsAgreeModalOpen(true);
        }
    }

    return (

        <div
            className={`${isAuthenticated ? 'auth-modal-overlay-1' : 'auth-modal-overlay'
                }`}
        >
            <div className="auth-modal-content-1">
                <button onClick={onClose} className="modal-close-button">X</button>
                <h2 style={{ marginBottom: '20px', color: 'black' }}>{formTitle}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="userName" style={{ minWidth: '80px', textAlign: 'right', color: '#333' }}>이름:</label>
                        <input
                            id="userName"
                            type="text"
                            placeholder="이름"
                            value={userName}
                            onChange={handleChange}
                            className="modal-input"
                            autoComplete="name"
                            style={{ flexGrow: 1 }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="password" style={{ minWidth: '80px', textAlign: 'right', color: '#333' }}>비밀번호:</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={handleChange}
                            className="modal-input"
                            autoComplete={isAuthenticated ? "current-password" : "new-password"}
                            style={{ flexGrow: 1 }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="email" style={{ minWidth: '80px', textAlign: 'right', color: '#333' }}>이메일:</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={handleChange}
                            className="modal-input"
                            autoComplete="email"
                            style={{ flexGrow: 1 }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="phoneNumber" style={{ minWidth: '80px', textAlign: 'right', color: '#333' }}>전화번호:</label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            placeholder="전화번호"
                            value={phoneNumber}
                            onChange={handleChange}
                            className="modal-input"
                            autoComplete="tel-national"
                            style={{ flexGrow: 1 }}
                        />
                    </div>

                    {isAuthenticated ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <label htmlFor="agreeAt" style={{ minWidth: '80px', textAlign: 'right', color: '#333' }}>개인정보동의:</label>
                                <input
                                    id="agreeAt"
                                    type="checkbox"
                                    checked={agreeAt}
                                    onChange={handleChange}
                                    disabled={isAuthenticated}
                                    style={{ width: '20px', height: '20px', margin: '0 5px' }}
                                />
                                <span style={{ flexGrow: 1, color: '#333' }}>
                                    {isAgreeAtValid(agreeAt) ? `(동의일: ${formatAgreeAt(agreeAt)})` : '동의하지 않음'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}>
                                <label htmlFor="agree" style={{ minWidth: '80px', textAlign: 'right', color: '#333' }}>개인정보 사용 및 수신 동의:</label>
                                <input
                                    onClick={agreeOpen}
                                    id="agree"
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px', margin: '0 5px' }} // 체크박스 크기 조정
                                />
                            </div>
                        </>
                    )}

                    {message && <p style={{ color: message.includes('실패') || message.includes('오류') || message.includes('만료') ? 'red' : 'green', fontSize: '14px' }}>{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="modal-button-register"
                        style={{ margin: '0 auto' }}
                    >
                        {submitButtonText}
                    </button>
                </form>
            </div >

            <AgreeModal
                isOpen={isAgreeModalOpen}
                onClose={() => setIsAgreeModalOpen(false)}
            />
        </div>
    );
}

export default RegisterModal;