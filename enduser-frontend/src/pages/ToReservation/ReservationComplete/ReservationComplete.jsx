import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReservationComplete.css';

const ReservationComplete = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleGoHome = () => {
        onClose(); // 모달 닫기
        navigate('/'); // 메인으로 이동
    };
    return (
        <div className="modal-overlay">
            <div className="complete-modal-content">
                <div className="check-icon">✓</div>
                <h2>예약 및 결제 완료!</h2>
                <p className="complete-msg">
                    예약이 정상적으로 완료되었습니다.<br />
                    상세 내역은 마이페이지에서 확인 가능합니다.
                </p>
                
                <div className="complete-modal-actions">
                    <button onClick={handleGoHome} className="go-home-btn">
                        메인화면으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationComplete;