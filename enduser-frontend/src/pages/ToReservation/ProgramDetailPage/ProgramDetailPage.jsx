import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api';
import CalendarModal from '../CalendarModal/CalendarModal';
import './ProgramDetailPage.css';
import LoginModal from '../../../components/auth/LoginModal';
import '../../../components/auth/AuthModalStyles.css';
import { useSelector } from 'react-redux';
import RegisterModal from '../../../components/auth/RegisterModal';

const ProgramDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const rawSessions = location.state?.sessions || [];
    const sessions = Array.isArray(rawSessions)
        ? rawSessions
        : (rawSessions.sessions || []);

    // URL 파라미터에서 모든 정보 추출
    const progId = queryParams.get('progId');
    const userName = queryParams.get('userName');
    const brchNm = queryParams.get('brchNm');
    const strtDt = queryParams.get('strtDt');
    const endDt = queryParams.get('endDt');
    const strtTm = queryParams.get('strtTm');
    const endTm = queryParams.get('endTm');
    const userId = queryParams.get('userId');

    // 프로그램 상세 데이터 상태
    const [programDetails, setProgramDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 선택된 날짜 상태
    const [selectedDate, setSelectedDate] = useState(null);

    // 로그인 상태
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // 로그인 모달 오픈 상태
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // 회원가입 모달 상태
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // 예약버튼 (캘린더) 모달 오픈 상태
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    // 선택된 스케줄 상태
    const [selectedSchdId, setSelectedSchdId] = useState(null);

    // 모달 닫기
    const handleCloseModal = () => {
        setIsReservationModalOpen(false);
    };

    // 모달 띄우기
    const handleReservationModal = () => {
        if (isAuthenticated === true) {     // 로그인 된 상태라면 모달 띄움
            setIsReservationModalOpen(true);
        } else if (isAuthenticated === false) {     // 로그인 되지 않은 상태라면 로그인 모달 띄움
            setIsLoginModalOpen(true);
        }
    };

    // 로그인 모달에서 회원가입으로 전환하는 핸들러
    const handleSwitchToRegister = () => {
        setIsLoginModalOpen(false); // 로그인 모달 닫기
        setIsRegisterModalOpen(true); // 회원가입 모달 열기
    };

    // 캘린더 날짜 선택 기능
    const handleDateSelect = (date) => {
        setSelectedDate(date);

        // 날짜를 YYYY-MM-DD 형식으로 변환하여 sessions에서 검색
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // 해당 날짜의 고유 schdId 찾기
        const session = sessions.find(s => s.date === formattedDate);
        if (session) {
            setSelectedSchdId(session.schdId);
        }
    };

    // 결제 페이지로 이동하는 핸들러
    const handleProceedToPayment = () => {
        if (selectedDate && programDetails) {
            // 로컬 날짜 기준으로 YYYY-MM-DD 형식 생성 (시간 밀림 방지)
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            navigate('/payment-reservation', {
                state: {
                    schdId: selectedSchdId,
                    progId: progId, // 프로그램 ID
                    selectedDate: formattedDate, // 선택된 날짜 (YYYY-MM-DD 형식)
                    userName: userName, // 강사명
                    brchNm: brchNm,     // 지점명
                    progNm: programDetails.progNm, // 프로그램명
                    strtTm: strtTm,     // 시작 시간
                    endTm: endTm,       // 종료 시간
                    // 필요한 경우 programDetails의 다른 정보들도 추가
                    oneTimeAmt: programDetails.oneTimeAmt, // 프로그램 단일 금액
                    rwdGamePnt: programDetails.rwdGamePnt, // 보상 게임 포인트
                }
            });
            handleCloseModal();
        } else {
            alert("날짜를 선택해주세요.");
        }
    };

    // 날짜 형식
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        return `${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
    };

    // 시간 형식
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

    useEffect(() => {
        // 프로그램 데이터 패치
        const fetchProgramDetails = async () => {
            if (!progId) {
                setError('잘못된 접근입니다. 프로그램 ID가 없습니다.');
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/programs/getProgramByProgIdForR/${progId}`, {
                    params: {
                        userId: userId,
                    }
                });
                setProgramDetails(response.data.data);
                console.log(programDetails);
            } catch (err) {
                setError('프로그램 데이터를 불러오는 중 오류가 발생했습니다.');
                console.error('Error fetching program data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgramDetails();
    }, [progId])

    return (
        <div>
            {loading ? (
                <div>프로그램 데이터를 불러오는 중입니다.</div>
            ) : (
                error ? (
                    <div>{error}</div>
                ) : (
                    <div className="program-detail-container">
                        <div className="detail-top-wrapper">
                            <div className="instructor-section"> {/* 강사정보 */}
                                <img className="instructor-image" src={`${programDetails.teacherInfo.profileImgUrl}`} alt={`${userName}`} />
                                <p className="instructor-name">{userName} 강사</p>
                                <p className="instructor-intro">{programDetails.teacherInfo.intro}</p>
                                <div className="certificate-container">
                                    <p className="certificate-title">보유 자격증</p>
                                    {programDetails.teacherInfo.certificates.length === 0 ? (
                                        <div className="no-certificate"> 등록된 자격증이 없습니다. </div>
                                    ) : (
                                        programDetails.teacherInfo.certificates.map((certificate, index) => (
                                            <div key={index} className="certificate-item">
                                                <p>{certificate.certNm} - {certificate.issuer}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>


                            <div className="program-info-section"> {/* 프로그램 정보 */}
                                <p className="program-title">{programDetails.progNm}</p>
                                <p className="branch-name">{brchNm}</p>
                                <p className="program-duration">기간 : {strtDt === endDt ? formatDate(strtDt) : `${formatDate(strtDt)} ~ ${formatDate(endDt)}`}</p>
                                <p className="program-time">진행 시간 : {formatTime(strtTm)} ~ {formatTime(endTm)}</p>
                                <p className="program-description">{programDetails.description}</p>
                            </div>
                        </div>

                        {/* 예약하기 버튼 클릭 시 모달 열기 */}
                        <button className="reserve-button" onClick={handleReservationModal}>예약하기</button>

                        {/* LoginModal 렌더링 */}
                        {isLoginModalOpen && (
                            <LoginModal
                                isOpen={isLoginModalOpen}
                                onClose={() => setIsLoginModalOpen(false)}
                                onOpenRegister={handleSwitchToRegister}
                            />
                        )}

                        {/* 5. RegisterModal 렌더링 추가 */}
                        {isRegisterModalOpen && (
                            <RegisterModal
                                isOpen={isRegisterModalOpen}
                                onClose={() => setIsRegisterModalOpen(false)}
                            />
                        )}

                        {/* CalendarModal 렌더링 */}
                        {isReservationModalOpen && (
                            <CalendarModal
                                isOpen={isReservationModalOpen}
                                sportId={programDetails.sportId}
                                sessions={rawSessions.data || rawSessions}
                                onClose={handleCloseModal}
                                strtDt={strtDt}
                                endDt={endDt}
                                onSelectDate={handleDateSelect}
                                selectedDate={selectedDate} // 현재 선택된 날짜를 전달
                                onProceedToPayment={handleProceedToPayment} // 결제 진행 핸들러 전달
                            />
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default ProgramDetailPage;