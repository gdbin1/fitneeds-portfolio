import React, { useState, useEffect } from 'react';
import api from '../../api';

// 예약 목록 조회 API
const getMyReservations = async () => {
  try {
    const response = await api.get('/reservations/myReservations');

    if (response.data.resultCode === 'SUCCESS' && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '예약 목록 조회 실패');
    }
  } catch (error) {
    console.error('예약 목록 조회 실패:', error);
    throw error;
  }
};

function AttendanceSection() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 현재 월의 첫 날과 마지막 날
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 예약 목록 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getMyReservations();

        const transformedReservations = (data || []).map((reservation) => {
          // 날짜 포맷 YYYY-MM-DD
          let dateStr = reservation.rsvDt;
          if (typeof dateStr !== 'string') {
            dateStr = new Date(reservation.rsvDt).toISOString().split('T')[0];
          }

          // 시간 포맷 HH:mm
          let timeStr = reservation.rsvTime;
          if (typeof timeStr === 'string') {
            timeStr = timeStr.substring(0, 5);
          }

          // attendanceStatus → boolean/null 변환
          let attendance = null;
          if (reservation.attendanceStatus === 'ATTENDED') attendance = true;
          else if (reservation.attendanceStatus === 'ABSENT') attendance = false;
          else attendance = null;

          return {
            id: reservation.reservationId,
            reservationId: reservation.reservationId,
            date: dateStr,
            time: timeStr,
            sportName: reservation.sportName || '프로그램',
            branchName: reservation.brchNm || '지점',
            trainerName: reservation.trainerName || '',
            attendance,
          };
        });

        setReservations(transformedReservations);
      } catch (error) {
        console.error('예약 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const getReservationsByDate = (dateStr) =>
    reservations.filter((res) => res.date === dateStr);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(year, month, day));
      const dayReservations = getReservationsByDate(dateStr);
      const hasReservations = dayReservations.length > 0;
      const isToday = dateStr === formatDate(new Date());

      // 출석 상태 확인
      let attendanceStatus = null;
      if (hasReservations) {
        const attended = dayReservations.some((r) => r.attendance === true);
        const absent = dayReservations.some((r) => r.attendance === false);

        if (attended) attendanceStatus = 'attended';
        else if (absent) attendanceStatus = 'absent';
      }

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasReservations ? 'has-reservation' : ''} ${isToday ? 'today' : ''}`}
        >
          <div className="calendar-day-number">{day}</div>

          {hasReservations && (
            <>
              <div className="calendar-day-indicator">
                {attendanceStatus === 'attended' && <div className="attendance-check attended">✓</div>}
                {attendanceStatus === 'absent' && <div className="attendance-check absent">✗</div>}
                {attendanceStatus === null && <div className="attendance-dot"></div>}
              </div>

              <div className="calendar-day-reservations">
                {dayReservations.slice(0, 3).map((r) => (
                  <div key={r.id} className="calendar-reservation-item">
                    <span className="calendar-reservation-time">{r.time}</span>
                    <span className="calendar-reservation-title">
                      {r.sportName}
                      {r.trainerName ? ` · ${r.trainerName}` : ''}
                    </span>
                    {r.attendance === true && <span className="calendar-reservation-status attended">✓</span>}
                    {r.attendance === false && <span className="calendar-reservation-status absent">✗</span>}
                    {r.attendance === null && <span className="calendar-reservation-status pending">·</span>}
                  </div>
                ))}
                {dayReservations.length > 3 && (
                  <div className="calendar-reservation-more">+{dayReservations.length - 3}건 더보기</div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <section className="mypage-content-section attendance-section">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mypage-content-section attendance-section">
      <h2 className="content-title">출석현황</h2>

      {/* 달력 헤더 */}
      <div className="calendar-header">
        <button className="calendar-nav-button" onClick={handlePrevMonth}>
          ‹
        </button>
        <h3 className="calendar-month-title">
          {year}년 {month + 1}월
        </h3>
        <button className="calendar-nav-button" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      {/* 달력 */}
      <div className="calendar-container">
        <div className="calendar-weekdays">
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <div key={d} className="calendar-weekday">
              {d}
            </div>
          ))}
        </div>
        <div className="calendar-days">{renderCalendarDays()}</div>
      </div>

      {/* 범례 */}
      <div className="attendance-legend">
        <div className="legend-item">
          <div className="attendance-check attended">✓</div>
          <span>출석</span>
        </div>
        <div className="legend-item">
          <div className="attendance-check absent">✗</div>
          <span>미출석</span>
        </div>
        <div className="legend-item">
          <div className="attendance-dot"></div>
          <span>미확정</span>
        </div>
      </div>
    </section>
  );
}

export default AttendanceSection;
