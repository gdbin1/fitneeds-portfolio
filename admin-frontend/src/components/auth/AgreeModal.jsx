import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice'; // Redux login 액션 임포트
// import './common.css';
import './AuthModalStyles.css';

// LoginModal은 isOpen, onClose 외에 onOpenRegister 콜백 함수를 props로 받습니다.
function LoginModal({ isOpen, onClose, onOpenRegister }) {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth); // Redux 상태 가져오기

    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null; // 모달이 닫혀있으면 아무것도 렌더링하지 않음

    // 폼 제출 핸들러 (로그인 로직)
    const handleSubmit = async (e) => {
        onClose(); // 로그인 성공 시 모달 닫기
    };

    return (
        <>
            {/* 모달 외부 클릭 시 닫히도록 하는 오버레이 */}
            <div className="auth-modal-overlay" onClick={onClose}>X</div>

            {/* 모달 콘텐츠 */}
            <div className="auth-modal-content-1">
                <h2 style={{ marginBottom: '20px', color: 'black' }}>개인정보 사용 및 수신 동의</h2>
                <div onSubmit={handleSubmit} style={{ display: 'flex', color: 'black', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                        <p>
                            저희 서비스는 회원님께 최적화된 경험을 제공하고 원활한 서비스를 운영하기 위해
                            다음과 같이 개인정보를 수집 및 이용하고 있습니다. 내용을 충분히 숙지하신 후 동의 여부를 결정해 주시기 바랍니다.
                        </p>

                        <h3>1. 개인정보 수집 및 이용 목적</h3>
                        {/* 각 목록 항목을 <p> 태그로 변환 */}
                        <div style={{ marginLeft: '20px' }}> {/* 목록처럼 들여쓰기 */}
                            <p><strong>회원 가입 및 관리</strong>: 본인 식별 및 인증, 회원 자격 유지 및 관리, 서비스 이용 약관 위반 행위 제재</p>
                            <p><strong>서비스 제공</strong>: 로그인, 공지사항 전달, 이벤트 참여 및 경품 발송, 고객 문의 응대</p>
                            <p><strong>통계 및 분석</strong>: 서비스 개선 및 신규 기능 개발, 이용 통계 분석</p>
                            <p><strong>마케팅 및 홍보</strong>: 신규 서비스 및 이벤트 정보 안내 (선택 동의 시)</p>
                        </div>


                        <h3>2. 수집하는 개인정보 항목</h3>
                        {/* 필수/선택 항목을 <div>로 묶고, 그 아래 내용을 <p> 태그로 변환 */}
                        <div style={{ marginLeft: '20px' }}> {/* 목록처럼 들여쓰기 */}
                            <p><strong>필수 항목</strong>:</p>
                            <div style={{ marginLeft: '20px' }}> {/* 중첩 목록처럼 더 들여쓰기 */}
                                <p>아이디(userId), 이름(userName), 이메일(email), 비밀번호(password), 전화번호(phoneNumber)</p>
                                <p>서비스 가입일시(agreeAt)</p>
                            </div>
                            <p><strong>선택 항목</strong>:</p>
                            <div style={{ marginLeft: '20px' }}> {/* 중첩 목록처럼 더 들여쓰기 */}
                                <p>지점 정보(brchId)</p>
                            </div>
                        </div>

                        <h3>3. 개인정보 보유 및 이용 기간</h3>
                        <p>
                            수집된 개인정보는 <strong>회원 탈퇴 시 또는 개인정보 수집 및 이용 목적이 달성될 때까지</strong> 안전하게 보유 및 이용됩니다.
                        </p>
                        <p>
                            단, 관련 법령의 규정에 의하여 보존할 필요가 있는 경우, 해당 법령에서 정한 기간 동안 보존됩니다.
                            (예: 전자상거래 등에서의 소비자 보호에 관한 법률 등)
                        </p>

                        <h3>4. 동의 거부권 및 불이익 안내</h3>
                        {/* 각 목록 항목을 <p> 태그로 변환 */}
                        <div style={{ marginLeft: '20px' }}> {/* 목록처럼 들여쓰기 */}
                            <p>귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.</p>
                            <p><strong>필수 항목</strong> 동의를 거부하시는 경우, 회원 가입 및 서비스 이용이 제한됩니다.</p>
                            <p><strong>선택 항목</strong> 동의를 거부하시는 경우에도 서비스 이용은 가능하나,
                                해당 선택 항목과 관련된 특정 서비스(예: 맞춤형 마케팅 정보 수신)의 이용이 제한될 수 있습니다.</p>
                        </div>

                    </div>
                    <button
                        type="button"
                        disabled={isLoading}
                        className="modal-button-register"
                        style={{ margin: '0 auto' }}
                        onClick={onClose}
                    >
                        확인
                    </button>
                </div>
                <button onClick={onClose} className="modal-close-button">X</button>
            </div>
        </>
    );
}

export default LoginModal;