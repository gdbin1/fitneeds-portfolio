// src/components/common/LoginButtonAndModal.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import '../Navigation.css';

function LoginButtonAndModal() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, userName, userId, role } = useSelector((state) => state.auth); // Redux 상태 가져오기

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
    };

    const handleLogoutClick = () => {
        dispatch(logout());
        // 모달 상태 초기화
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
        // 홈페이지로 이동
        navigate('/');
    };

    const handleOpenRegisterFromLogin = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
    };

    const handleCloseRegisterModal = () => {
        setIsRegisterModalOpen(false);
    };

    // 로그아웃 후 자동으로 모달을 열지 않도록 제거
    if (!isAuthenticated) {
        if (!isLoginModalOpen) {
            setIsLoginModalOpen(true);
        }
    }

    const handleMyinfoClick = () => {
        setIsRegisterModalOpen(true);
    };

    return (
        <div>
            {isAuthenticated ? (
                <span className="nav-menu-login"> <span onClick={handleMyinfoClick} style={{ cursor: 'pointer' }} >{userName || 'ADMIN'} &nbsp; </span>
                    {/* </span><span className="nav-menu-login"> <span>{userName || 'ADMIN'} &nbsp; </span> */}
                    <button onClick={handleLogoutClick} style={buttonLogoutButton}>
                        로그아웃
                    </button>
                </span>
            ) : (
                <button onClick={handleLoginClick} style={loginButtonStyle}>
                    로그인
                </button>
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onOpenRegister={handleOpenRegisterFromLogin}
            />

            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={handleCloseRegisterModal}
            />
        </div>
    );
}


// 컴포넌트 내부 스타일 (겹치지 않게 이름을 다르게 했어요)
const loginButtonStyle = {
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
};

const logoutButtonPrimaryStyle = {
    backgroundColor: '#f0ad4e',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
};

const logoutButtonSecondaryStyle = {
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '5px',
};

// 위에서 loginButtonStyle 또는 logoutButtonPrimaryStyle/logoutButtonSecondaryStyle 중 선택해서 사용
// 예시에서는 loginButtonStyle과 logoutButtonPrimaryStyle을 사용하겠습니다.
const loginButtonPrimaryStyle = loginButtonStyle;
const loginButtonSecondaryStyle = logoutButtonPrimaryStyle; // 임시로 이름만 다르게

const logoutButtonDefaultStyle = logoutButtonPrimaryStyle; // 로그아웃 버튼 기본 스타일
const logoutButtonConfirmationStyle = logoutButtonSecondaryStyle; // 로그아웃 버튼 확인 스타일

// 실제 사용하는 스타일을 정확히 매핑 (불필요한 스타일은 제거)
const loginDefaultButtonStyle = loginButtonPrimaryStyle;
const loginRegisterButtonStyle = loginButtonSecondaryStyle;
const loginAdminNameStyle = { fontWeight: 'bold' };

const loginLogoutButton = logoutButtonDefaultStyle; // LoginButtonAndModal.jsx에서 사용되는 로그아웃 버튼

// Export용 스타일
const styleMapping = {
    loginButtonStyle: loginDefaultButtonStyle,
    registerButtonStyle: loginRegisterButtonStyle,
    adminNameStyle: loginAdminNameStyle,
    logoutButton: loginLogoutButton,
};


const buttonLogoutButton = {
    backgroundColor: '#d9534f', // 로그아웃 버튼은 다른 색상
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};



export default LoginButtonAndModal;