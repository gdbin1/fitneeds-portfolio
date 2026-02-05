import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SideBar from "./SideBar";
import '../../components/auth/AuthModalStyles.css';
import '../MyPage/MyPage.css';
import api from '../../api'; // axios instance, baseURL: '/api' 포함

/* =========================
   API 함수
========================= */
// 나의 예약 목록 조회
const getMyReservations = async () => {
  try {
    const response = await api.get('/reservations/myReservations'); // 백엔드 경로와 동일
    if (response.data.resultCode === 'SUCCESS') {
      return response.data.data || [];
    } else {
      console.warn('예약 목록 조회 실패:', response.data.message);
      return [];
    }
  } catch (error) {
    console.error('예약 목록 조회 에러:', error);
    return [];
  }
};


// 예약 취소
const cancelReservation = async (reservationId, cancelReason = null) => {
  try {
    const params = {};
    if (cancelReason) params.cancelReason = cancelReason;

    const response = await api.delete(`/reservations/${reservationId}`, { params });

    if (response.data.resultCode === 'SUCCESS') {
      return response.data;
    } else {
      throw new Error(response.data.message || '예약 취소 실패');
    }
  } catch (error) {
    console.error('[API] 예약 취소 실패', error);
    throw error;
  }
};

// 마감임박 수업 조회
const getClosingSoonSchedules = async () => {
  try {
    const response = await api.get('/schedules/closingSoon');
    if (response.data.resultCode === 'SUCCESS') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '마감임박 수업 조회 실패');
    }
  } catch (error) {
    console.error('[API] 마감임박 수업 조회 실패', error);
    throw error;
  }
};

// 운동 종목 이미지 매핑
const getSportImage = (sportName) => {
  if (!sportName) return '/images/pt.png';
  const sportLower = sportName.toLowerCase();
  if (sportLower.includes('필라테스') || sportLower.includes('pilates')) return '/images/pilates.png';
  if (sportLower.includes('요가') || sportLower.includes('yoga')) return '/images/yoga.png';
  if (sportLower.includes('크로스핏') || sportLower.includes('crossfit')) return '/images/crossfit.png';
  return '/images/pt.png';
};

function MyReservationList() {
  const [reservations, setReservations] = useState([]);
  const [urgentClasses, setUrgentClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgentClassesLoading, setUrgentClassesLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 예약 목록 조회
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getMyReservations();
        const transformed = (data || []).map(r => ({
          id: r.reservationId,
          reservationId: r.reservationId,
          date: r.rsvDt,
          time: r.rsvTime ? r.rsvTime.substring(0, 5) : '',
          productName: r.sportName || '프로그램',
          branchName: r.brchNm || '지점',
          trainerName: r.trainerName || '',
          option: r.trainerName ? '개인 레슨' : '그룹 레슨',
        }));
        setReservations(transformed);
      } catch (error) {
        console.error('[MyReservationList] 예약 목록 조회 실패', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [refreshKey]);

  // 마감임박 수업 조회
  useEffect(() => {
    const fetchUrgentClasses = async () => {
      try {
        setUrgentClassesLoading(true);
        const data = await getClosingSoonSchedules();
        const transformed = (data || []).map(schedule => {
          const dateStr = schedule.endDt ? schedule.endDt.split('T')[0] : '';
          const timeStr = schedule.endTm ? schedule.endTm.substring(0, 5) : '';
          const lessonType = schedule.trainerName ? '개인레슨' : '그룹레슨';
          return {
            id: schedule.scheduleId,
            scheduleId: schedule.scheduleId,
            name: `${schedule.sportName || '프로그램'} ${lessonType}`,
            branch: schedule.brchNm || '지점',
            image: getSportImage(schedule.sportName),
            rating: 5,
            date: dateStr,
            time: timeStr,
            maxCapacity: schedule.maxCapacity,
            reservedCount: schedule.reservedCount,
            remainingSeats: schedule.remainingSeats,
            trainerName: schedule.trainerName
          };
        });
        setUrgentClasses(transformed);
      } catch (error) {
        console.error('[MyReservationList] 마감임박 수업 조회 실패', error);
      } finally {
        setUrgentClassesLoading(false);
      }
    };
    fetchUrgentClasses();
  }, []);

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('정말 예약을 취소하시겠습니까?')) return;
    try {
      await cancelReservation(reservationId);
      alert('예약이 취소되었습니다.');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert(error.message || '예약 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="mypage-container">
        <SideBar />
        <main className="mypage-main">
          <section className="mypage-content-section">
            <h2 className="content-title">예약목록</h2>
            <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>FITNEEDS - 예약목록</title>
      </Helmet>

      <div className="mypage-container">
        <SideBar />
        <main className="mypage-main">

          {/* 예약 목록 */}
          <section className="mypage-content-section">
            <h2 className="content-title">예약목록</h2>
            <div className="reservation-summary">예약목록 총 {reservations.length}건</div>
            <div className="reservation-table-container">
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th>예약날짜시간</th>
                    <th>지점명</th>
                    <th>프로그램명</th>
                    <th>강사명</th>
                    <th>옵션</th>
                    <th>취소</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length > 0 ? reservations
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(r => (
                      <tr key={r.id}>
                        <td>{r.date}{r.time && <div className="text-muted" style={{ fontSize: '0.875rem' }}>{r.time}</div>}</td>
                        <td>{r.branchName}</td>
                        <td>{r.productName}</td>
                        <td>{r.trainerName || '-'}</td>
                        <td>{r.option}</td>
                        <td>
                          <button className="btn-action" onClick={() => handleCancelReservation(r.reservationId)}
                            style={{ backgroundColor: '#dc3545', color: 'white' }}>취소</button>
                        </td>
                      </tr>
                    )) :
                    <tr><td colSpan="6" className="text-center">예약 내역이 없습니다.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          {/* 마감임박 수업 */}
          <section className="mypage-content-section">
            <h2 className="content-title">마감임박 수업 예약하기</h2>
            {urgentClassesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : urgentClasses.length > 0 ? (
              <div className="class-cards-container">
                {urgentClasses.map(c => (
                  <div key={c.id} className="class-card">
                    <div className="class-card-image">
                      <img src={c.image} alt={c.name} />
                      <div className="class-card-rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} style={{ color: star <= c.rating ? '#FFC107' : '#ddd' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="class-card-info">
                      <h3 className="class-card-name">{c.name}</h3>
                      <div style={{ fontSize: '1.125rem', color: '#6c757d', marginBottom: '0.5rem' }}>{c.branch}</div>
                      <div style={{ fontSize: '1.125rem', color: '#6c757d', marginBottom: '0.5rem' }}>{c.date} {c.time}</div>
                      {c.remainingSeats !== undefined && <div style={{ fontSize: '0.875rem', color: '#dc3545', marginBottom: '1rem' }}>남은 자리: {c.remainingSeats}석</div>}
                      <button className="btn-submit">예약하기</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>마감임박 수업이 없습니다.</div>
            )}
          </section>

        </main>
      </div>
    </>
  );
}

export default MyReservationList;

