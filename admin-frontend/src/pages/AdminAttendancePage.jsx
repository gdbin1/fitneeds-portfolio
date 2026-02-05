import React, { useState, useEffect } from 'react';
import axios from 'axios';

/* =========================
   출석 상태 표시
========================= */
const STATUS_LABEL = {
    ATTENDED: { label: '출석', color: '#3498db' },
    ABSENT: { label: '결석', color: '#e74c3c' },
    UNCHECKED: { label: '미처리', color: '#7f8c8d' }
};

function AdminAttendancePage() {
    /* =========================
       스케줄 목록
    ========================= */
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    /* =========================
       참석자 모달
    ========================= */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);

    const [attendees, setAttendees] = useState([]);
    const [attendeeLoading, setAttendeeLoading] = useState(false);

    /* =========================
       초기 로딩
    ========================= */
    useEffect(() => {
        fetchSchedules();
    }, []);

    /* =========================
       출석 스케줄 목록 조회
       GET /api/attendance
    ========================= */
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/attendance');
            setSchedules(res.data);
        } catch (e) {
            alert('출석 스케줄을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       특정 스케줄 참석자 조회
       GET /api/attendance/{schdId}
    ========================= */
    const fetchAttendees = async (scheduleId) => {
        setAttendeeLoading(true);
        try {
            const res = await axios.get(
                `/api/attendance/${scheduleId}`
            );

            // ScheduleDetailDto 구조
            setAttendees(res.data.reservations);
        } catch (e) {
            alert('참석자 정보를 불러오지 못했습니다.');
        } finally {
            setAttendeeLoading(false);
        }
    };

    /* =========================
       모달 열기
    ========================= */
    const openAttendanceModal = async (scheduleId) => {
        setSelectedScheduleId(scheduleId);
        setIsModalOpen(true);
        await fetchAttendees(scheduleId);
    };

    /* =========================
       출석 상태 변경
       PATCH /api/attendance/{schdId}/reservations/{reservationId}
    ========================= */
    const updateAttendance = async (reservationId, status) => {
        try {
            await axios.patch(
                `/api/attendance/${selectedScheduleId}/reservations/${reservationId}`,
                { status }
            );

            setAttendees(prev =>
                prev.map(a =>
                    a.reservationId === reservationId
                        ? { ...a, attendanceStatus: status }
                        : a
                )
            );
        } catch (e) {
            alert('출석 처리 실패');
        }
    };

    /* =========================
       렌더링
    ========================= */
    return (
        <div style={{ padding: '20px' }}>
            <h1>[관리자] 출결 관리</h1>

            {/* =========================
               스케줄 목록
            ========================= */}
            {loading ? (
                <p>로딩 중...</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>시간</th>
                            <th>지점</th>
                            <th>수업</th>
                            <th>정원</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length === 0 ? (
                            <tr>
                                <td colSpan="5">데이터 없음</td>
                            </tr>
                        ) : (
                            schedules.map(item => (
                                <tr
                                    key={item.scheduleId}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        openAttendanceModal(item.scheduleId)
                                    }
                                >
                                    <td>{item.scheduleId}</td>
                                    <td>
                                        {item.startTime} ~ {item.endTime}
                                    </td>
                                    <td>{item.branchName}</td>
                                    <td>{item.programName}</td>
                                    <td>
                                        {item.currentCount} / {item.maxCount}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* =========================
               참석자 모달
            ========================= */}
            {isModalOpen && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h2>📋 참석자 명단</h2>

                        {attendeeLoading ? (
                            <p>로딩 중...</p>
                        ) : attendees.length === 0 ? (
                            <p>예약자 없음</p>
                        ) : (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>연락처</th>
                                        <th>상태</th>
                                        <th>처리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendees.map(a => {
                                        const st =
                                            STATUS_LABEL[a.attendanceStatus] ||
                                            STATUS_LABEL.UNCHECKED;

                                        return (
                                            <tr key={a.reservationId}>
                                                <td>{a.userName}</td>
                                                <td>{a.phone}</td>
                                                <td>
                                                    <span
                                                        style={{
                                                            background: st.color,
                                                            color: '#fff',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px'
                                                        }}
                                                    >
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() =>
                                                            updateAttendance(
                                                                a.reservationId,
                                                                'ATTENDED'
                                                            )
                                                        }
                                                    >
                                                        출석
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            updateAttendance(
                                                                a.reservationId,
                                                                'ABSENT'
                                                            )
                                                        }
                                                        style={{ marginLeft: '8px' }}
                                                    >
                                                        결석
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        <button
                            style={{ marginTop: '20px' }}
                            onClick={() => setIsModalOpen(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================
   스타일
========================= */
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center'
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const modalStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '700px',
    maxHeight: '80vh',
    overflowY: 'auto'
};

export default AdminAttendancePage;
