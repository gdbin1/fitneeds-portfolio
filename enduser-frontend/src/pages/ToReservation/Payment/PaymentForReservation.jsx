import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentForReservation.css';
import api from '../../../api';
import ReservationComplete from '../ReservationComplete/ReservationComplete';

const PaymentForReservation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ProgramDetailPage에서 전달받은 정보 구조분해 할당 (값이 없을 경우 대비하여 기본값 설정)
    const {
        schdId,
        progId,
        selectedDate, // YYYY-MM-DD 형식 문자열
        userName,
        brchNm,
        progNm,
        strtTm,
        endTm,
        oneTimeAmt = 0, // 기본값 0
        rwdGamePnt = 0 // 기본값 0
    } = location.state || {};

    const loggedInUserId = useSelector(state => state.auth.userId);

    // 결제 유형 선택: 'pass' (이용권), 'pay' (단건 결제: 카드/계좌이체 등)
    const [paymentType, setPaymentType] = useState('pass'); // 초기값은 'pass'로 설정 (UI에 맞춰)

    // 사용자가 선택할 결제 수단 (백엔드 Enum PaymentPayMethod 에 맞춤)
    // PASS, CARD, REMITTANCE, POINT
    const [payMethod, setPayMethod] = useState(''); // 초기값 없음, 사용자가 선택하도록 유도

    const [userPasses, setUserPasses] = useState([]); // 로그인 유저의 이용권 목록
    const [selectedUserPass, setSelectedUserPass] = useState(null); // 드롭다운에서 선택된 이용권 객체

    const [loading, setLoading] = useState(true); // 전체 페이지 로딩 상태
    const [fetchingUserPasses, setFetchingUserPasses] = useState(false); // 이용권 목록 로딩 상태
    const [error, setError] = useState(null); // 에러 메시지

    // 최종 결제 금액: 이용권 사용 시 0, 단건 결제 시 oneTimeAmt
    const [finalAmount, setFinalAmount] = useState(oneTimeAmt);

    // 결제 완료 모달
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- 초기 로드 및 유효성 검사 ---
    useEffect(() => {
        // 필수 정보가 없으면 알림 후 홈으로 리다이렉트
        if (!progId || !selectedDate || !loggedInUserId || !progNm) {
            alert('필수 예약 정보가 누락되었습니다. 다시 시도해 주세요.');
            navigate('/', { replace: true }); // 히스토리 스택에 쌓이지 않도록 replace 사용
            return;
        }

        // 초기 금액 설정
        setFinalAmount(oneTimeAmt);
        setLoading(false); // 필수 정보 로드 완료

    }, [progId, selectedDate, loggedInUserId, progNm, oneTimeAmt, navigate, location.state]);

    // --- 이용권 결제 유형 선택 시 이용권 목록 로드 ---
    useEffect(() => {
        if (paymentType === 'pass' && loggedInUserId) {
            const fetchUserpasses = async () => {
                setFetchingUserPasses(true);
                setError(null);
                try {
                    const response = await api.get(`/userpasses/getUserPassesByUserIdForR/${loggedInUserId}`);

                    const passes = response.data.data
                    setUserPasses(passes);

                    if (passes.length > 0) {
                        // 기본적으로 첫 번째 이용권을 선택된 이용권으로 설정
                        setSelectedUserPass(passes[0]);
                        setPayMethod('PASS'); // 이용권 결제이므로 payMethod를 PASS로 고정
                        setFinalAmount(0); // 이용권 사용 시 금액 0원
                    } else {
                        // 이용권이 없으면 단건 결제 유형으로 자동 전환 (UX 개선)
                        setPaymentType('pay');
                        setPayMethod('CARD'); // 또는 다른 기본값
                        setFinalAmount(oneTimeAmt);
                        alert('사용 가능한 이용권이 없어 단건 결제로 전환됩니다.');
                    }

                } catch (err) {
                    console.error("이용권 목록 로드 실패:", err);
                    const msg = err.response?.data?.message || '이용권 목록을 불러오는 데 실패했습니다.';
                    setError(msg);
                    // 이용권 로드 실패 시에도 단건 결제로 전환
                    setPaymentType('pay');
                    setPayMethod('CARD');
                    setFinalAmount(oneTimeAmt);
                    alert(`${msg}\n단건 결제로 전환됩니다.`);
                } finally {
                    setFetchingUserPasses(false);
                }
            }
            fetchUserpasses();
        } else if (paymentType === 'pay') {
            // 단건 결제 선택 시 이용권 관련 초기화
            setSelectedUserPass(null);
            setFinalAmount(oneTimeAmt);
            setPayMethod('CARD'); // 단건 결제 시 카드 기본값
        }
    }, [paymentType, loggedInUserId, oneTimeAmt]);

    // --- 핸들러 함수들 ---
    const handleChangePaymentType = (type) => {
        setPaymentType(type);
        setError(null); // 결제 유형 변경 시 에러 초기화
    }

    const handleChangePayMethod = (e) => { // 단건 결제 시 결제 수단 변경 핸들러
        setPayMethod(e.target.value);
        setFinalAmount(oneTimeAmt); // 단건 결제는 항상 원래 금액
    }

    const handleUserPassSelectChange = (e) => { // 이용권 드롭다운 선택 변경 핸들러
        const selectedId = Number(e.target.value);
        const pass = userPasses.find(p => p.userPassId === selectedId);
        setSelectedUserPass(pass);

        if (pass) { // 이용권 선택 시
            setPayMethod('PASS'); // payMethod를 PASS로 설정
            setFinalAmount(0); // 금액 0원으로 설정
        } else { // 선택 해제 시 (옵션이 생길 경우)
            setPayMethod('');
            setFinalAmount(oneTimeAmt);
        }
    };

    // --- 최종 결제 버튼 클릭 핸들러 ---
    const handleFinalPayment = async () => {
        if (!loggedInUserId) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        if (!progId || !selectedDate || !progNm) {
            alert('필수 예약 정보가 누락되었습니다. 다시 시도해 주세요.');
            return;
        }
        if (!payMethod) {
            alert('결제 수단을 선택해 주세요.');
            return;
        }
        if (payMethod === 'PASS' && !selectedUserPass) {
            alert('이용권 결제를 선택하셨습니다. 사용하실 이용권을 선택해 주세요.');
            return;
        }
        // 이용권 외 결제 수단이면서 금액이 0원 이하일 경우
        if (payMethod !== 'PASS' && finalAmount <= 0) {
            alert('결제 금액이 0원 이하입니다. 다른 결제 수단을 선택하거나 이용권을 사용해주세요.');
            return;
        }
        if (!schdId) {
            alert('스케줄 정보가 올바르지 않습니다.');
            return;
        }


        setLoading(true); // 결제 처리 로딩 시작
        setError(null);

        try {
            const requestBody = {
                userId: loggedInUserId,
                amount: finalAmount,
                payMethod: payMethod,
                schdId: schdId,
                reservationDate: selectedDate, // YYYY-MM-DD 형식 문자열
                reservationTime: strtTm, // HH:MM 형식
                userPassId: payMethod === 'PASS' ? selectedUserPass?.userPassId : null,
                paymentDetails: `스케줄 예약: ${progNm} - ${selectedDate}`,
                targetId : schdId,
                targetName : `${progNm}`,
            };

            const response = await api.post('/payments/process', requestBody);

            if (response.data.resultCode === "SUCCESS" || response.status === 201) {
                setIsModalOpen(true);
            } else {
                // 서버에서 에러는 아니지만 처리에 실패한 경우 (비즈니스 로직 에러)
                const errorMsg = response.data.message || '결제 처리 중 오류가 발생했습니다.';
                setError(errorMsg);
                alert(errorMsg);
            }
        } catch (err) {
            console.error('결제 API 호출 오류:', err);
            // 백엔드에서 보낸 에러 메시지를 사용
            const serverErrorMsg = err.response?.data?.message || '결제 서버와 통신 중 오류가 발생했습니다.';
            setError(serverErrorMsg);
            alert(`결제 실패: ${serverErrorMsg}`);
        } finally {
            setLoading(false); // 결제 처리 로딩 완료
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        return `${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? '오후' : '오전';
        const h12 = h % 12 || 12;
        const minuteStr = m > 0 ? ` ${m}분` : '';
        return `${ampm} ${h12}시${minuteStr}`;
    };

    return (
        <div className="payment-page-container">
            <div className="reservation-summary">
                <p><strong>프로그램:</strong> {progNm}</p>
                <p><strong>강사:</strong> {userName}</p>
                <p><strong>지점:</strong> {brchNm}</p>
                <p><strong>예약 날짜:</strong> {formatDate(selectedDate)}</p>
                <p><strong>예약 시간:</strong> {formatTime(strtTm)} ~ {formatTime(endTm)}</p>
                <p><strong>결제 금액:</strong> {oneTimeAmt.toLocaleString()}원</p>
            </div>

            {/* 결제 유형 선택 버튼 (이용권 결제 / 단건 결제) */}
            <div className="payment-type-selection">
                <button
                    className={`payment-type-btn ${paymentType === 'pass' ? 'active' : ''}`}
                    onClick={() => handleChangePaymentType('pass')}
                >
                    이용권 결제
                </button>
                <button
                    className={`payment-type-btn ${paymentType === 'pay' ? 'active' : ''}`}
                    onClick={() => handleChangePaymentType('pay')}
                >
                    단건 결제
                </button>
            </div>

            {/* --- 이용권 결제 섹션 --- */}
            {paymentType === 'pass' && (
                <div className="userpass-selection">
                    <h3>사용할 이용권 선택</h3>
                    {fetchingUserPasses ? (
                        <p>이용권 목록 불러오는 중...</p>
                    ) : userPasses.length === 0 ? (
                        <p>사용 가능한 이용권이 없습니다. 단건 결제로 진행해 주세요.</p>
                    ) : (
                        <div className="user-pass-dropdown-container">
                            <label htmlFor="userPassSelect">내 이용권:</label>
                            <select
                                id="userPassSelect"
                                value={selectedUserPass ? selectedUserPass.userPassId : ''}
                                onChange={handleUserPassSelectChange}
                                className="user-pass-select"
                            >
                                <option value="" disabled>--- 이용권 선택 ---</option>
                                {userPasses.map(pass => (
                                    <option key={pass.userPassId} value={pass.userPassId}>
                                        {pass.sportNm} ({pass.rmnCnt}회 남음{pass.expiryDate ? `, ~${pass.expiryDate}` : ''})
                                    </option>
                                ))}
                            </select>
                            {selectedUserPass && (
                                <div className="selected-userpass-info">
                                    <p>선택된 이용권: <strong>{selectedUserPass.passName}</strong></p>
                                    <p>남은 횟수: {selectedUserPass.rmnCnt}회</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* --- 단건 결제 섹션 --- */}
            {paymentType === 'pay' && (
                <div className="payment-method-selection">
                    <h3>결제 수단 선택</h3>
                    <div className="pay-method-options">
                        <label>
                            <input
                                type="radio"
                                name="payMethod"
                                value="CARD"
                                checked={payMethod === 'CARD'}
                                onChange={handleChangePayMethod}
                            />
                            신용/체크카드
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="payMethod"
                                value="REMITTANCE"
                                checked={payMethod === 'REMITTANCE'}
                                onChange={handleChangePayMethod}
                            />
                            계좌이체
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="payMethod"
                                value="POINT"
                                checked={payMethod === 'POINT'}
                                onChange={handleChangePayMethod}
                            />
                            포인트
                        </label>
                    </div>
                    <p className="payment-amount-display">결제 금액: <span>{oneTimeAmt.toLocaleString()}원</span></p>
                </div>
            )}

            {/* --- 최종 결제 금액 요약 --- */}
            <div className="final-payment-info">
                <h3>총 결제 금액: <span className="final-amount">{finalAmount.toLocaleString()}원</span></h3>
            </div>

            <div className="payment-actions">
                <button onClick={() => navigate(-1)} className="back-button">
                    뒤로 가기
                </button>

                <button
                    onClick={handleFinalPayment}
                    disabled={
                        loading ||
                        (paymentType === 'pass' && fetchingUserPasses) ||
                        !payMethod ||
                        (paymentType === 'pass' && !selectedUserPass) ||
                        (paymentType === 'pay' && finalAmount <= 0)
                    }
                    className="final-payment-button"
                >
                    {loading ? '결제 처리 중...' : '결제 확정'}
                </button>
            </div>

            <ReservationComplete
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default PaymentForReservation;