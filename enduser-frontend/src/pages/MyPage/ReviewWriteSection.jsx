import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../components/auth/AuthModalStyles.css';

/* =========================
   API 함수들
========================= */

// 이용내역 조회
const getPastHistory = async (startDate = null, endDate = null, branchId = null, reviewWritten = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (branchId) params.branchId = branchId;
    if (reviewWritten) params.reviewWritten = reviewWritten;

    const response = await api.get('/reservations/completedReservations', { params });

    // 백엔드 응답 구조: { status, message, data }
    if (response.data.status === 'SUCCESS') {
      // 성공이면 data가 없어도 빈 배열 반환 (데이터 없음 = 정상)
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || '이용내역 조회 실패');
    }
  } catch (error) {
    console.error('이용내역 조회 실패:', error);
    throw error;
  }
};

// 이용내역 조회 (리뷰 작성 가능한 항목)
const getCompletedReservations = async (reviewWritten = null) => {
  try {
    const loginUserId = localStorage.getItem('userId');
    if (!loginUserId) throw new Error('로그인이 필요합니다.');

    const response = await api.get('/reviews/my/completed-reservations', {
      params: { userId: loginUserId },
    });

    if (response.data.status === 'SUCCESS' && response.data.data) {
      const data = response.data.data;
      // reviewWritten 필터링
      if (reviewWritten === 'N') {
        return data.filter((item) => !item.reviewWritten);
      }
      return data;
    } else {
      throw new Error(response.data.message || '이용내역 조회 실패');
    }
  } catch (error) {
    console.error('이용내역 조회 실패:', error);
    throw error;
  }
};

// 리뷰 작성
const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    if (response.data.status === 'SUCCESS') return response.data;
    else throw new Error(response.data.message || '리뷰 작성 실패');
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    throw error;
  }
};

// 내가 쓴 리뷰 목록 조회
const getMyReviews = async () => {
  try {
    const response = await api.get('/reviews/my'); // JWT 필요
    if (response.data.status === 'SUCCESS' && response.data.data) return response.data.data;
    else throw new Error(response.data.message || '리뷰 목록 조회 실패');
  } catch (error) {
    console.error('리뷰 목록 조회 실패:', error);
    throw error;
  }
};

// 리뷰 수정
const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    if (response.data.status === 'SUCCESS') return response.data;
    else throw new Error(response.data.message || '리뷰 수정 실패');
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

// 리뷰 삭제
const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    if (response.data.status === 'SUCCESS') return response.data;
    else throw new Error(response.data.message || '리뷰 삭제 실패');
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
};

/* =========================
   리뷰 작성 모달
========================= */
function ReviewWriteModal({ isOpen, onClose, history, onRefresh }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setReviewText('');
    }
  }, [isOpen]);

  if (!isOpen || !history) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating === 0) return alert('평점을 선택해주세요.');
    if (!reviewText.trim()) return alert('리뷰 내용을 입력해주세요.');

    setIsSubmitting(true);
    try {
      await createReview({
        historyId: history.historyId || history.id,
        reservationId: history.reservationId,
        rating,
        content: reviewText.trim(),
        userId: loginUserId,
      });
      alert('리뷰가 작성되었습니다.');
      onClose();
      onRefresh();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || '리뷰 작성 실패';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reservation-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>리뷰 작성</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {history && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>프로그램명:</strong> {history.programName}</p>
              <p><strong>지점명:</strong> {history.branchName}</p>
              <p><strong>강사명:</strong> {history.trainerName || '-'}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div style={{ display: 'flex', gap: '5px', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      color: star <= rating ? '#FFC107' : '#ddd',
                      padding: 0
                    }}
                  >★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <textarea
                className="form-control"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="리뷰를 작성해주세요"
                rows="5"
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>취소</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '작성 중...' : '리뷰 작성'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================
   리뷰 수정 모달
========================= */
function ReviewEditModal({ isOpen, onClose, reviewId, writtenReviews, onRefresh }) {
  const review = writtenReviews.find((r) => r.reviewId === reviewId);
  const [rating, setRating] = useState(review?.rating || 0);
  const [reviewText, setReviewText] = useState(review?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setReviewText(review.content);
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !reviewText.trim()) return alert('평점과 리뷰 내용을 입력해주세요.');

    setIsSubmitting(true);
    try {
      await updateReview(review.reviewId, {
        rating,
        content: reviewText.trim(),
        userId: loginUserId
      });
      alert('리뷰가 수정되었습니다.');
      onClose();
      onRefresh();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || '리뷰 수정 실패';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reservation-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>리뷰 수정</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div style={{ display: 'flex', gap: '5px', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      color: star <= rating ? '#FFC107' : '#ddd',
                      padding: 0
                    }}
                  >★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <textarea
                className="form-control"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="리뷰를 작성해주세요"
                rows="5"
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>취소</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? '수정 중...' : '수정 완료'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================
   리뷰 상세 모달
========================= */
function ReviewDetailModal({ isOpen, onClose, review }) {
  if (!isOpen || !review) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reservation-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>리뷰 상세</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p><strong>프로그램명:</strong> {review.programName || '-'}</p>
          <p><strong>지점명:</strong> {review.branchName || '-'}</p>
          <p><strong>강사명:</strong> {review.trainerName || '-'}</p>
          <p><strong>작성일:</strong> {review.writtenDate || '-'}</p>
          <p><strong>평점:</strong> {'★'.repeat(review.rating || 0)}</p>
          <p><strong>리뷰 내용:</strong> {review.content || '-'}</p>
          <div className="modal-footer">
            <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%' }}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   리뷰 쓰기 섹션
========================= */
function ReviewWriteSection({ reviewTab, setReviewTab }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [writtenReviews, setWrittenReviews] = useState([]);
  const [unwrittenHistories, setUnwrittenHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [writeLoading, setWriteLoading] = useState(false);
  const loginUserId = localStorage.getItem('userId');

  const getSportImage = (sportName) => {
    if (!sportName) return '/images/pt.png';
    const sportLower = sportName.toLowerCase();
    if (sportLower.includes('pilates') || sportLower.includes('필라테스')) return '/images/pilates.png';
    if (sportLower.includes('yoga') || sportLower.includes('요가')) return '/images/yoga.png';
    if (sportLower.includes('crossfit') || sportLower.includes('크로스핏')) return '/images/crossfit.png';
    return '/images/pt.png';
  };

  const fetchMyReviews = async () => {
    if (!loginUserId) return setWrittenReviews([]);

    setLoading(true);
    try {
      const [reviewsData, historiesData] = await Promise.all([
        getMyReviews(),
        getPastHistory().catch(() => [])
      ]);

      const historyMap = new Map();
      historiesData.forEach(h => historyMap.set(h.reservationId, h));

      const transformedReviews = reviewsData.map(r => {
        const history = historyMap.get(r.reservationId);
        const writtenDate = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0].replace(/-/g, '.') : '';
        return {
          ...r,
          programName: history?.sportName || r.title || '프로그램',
          branchName: history?.brchNm || '',
          trainerName: history?.trainerName || '',
          writtenDate,
          image: getSportImage(history?.sportName)
        };
      });
      setWrittenReviews(transformedReviews);
    } catch (error) {
      console.error('리뷰 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnwrittenHistories = async () => {
    if (!loginUserId) return setUnwrittenHistories([]);

    setWriteLoading(true);
    try {
      const data = await getPastHistory(null, null, null, 'N');
      const transformed = data.map(h => ({
        ...h,
        date: h.rsvDt?.split?.('T')[0] || h.rsvDt,
        time: h.rsvTime?.substring(0, 5) || '',
        image: getSportImage(h.sportName)
      }));
      setUnwrittenHistories(transformed);
    } catch (error) {
      console.error('리뷰 미작성 이용내역 조회 실패:', error);
    } finally {
      setWriteLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
    if (reviewTab === 'write') fetchUnwrittenHistories();
  }, [loginUserId, reviewTab]);

  return (
    <section className="mypage-content-section">
      <h2 className="content-title">리뷰쓰기</h2>

      <div className="review-tabs">
        <button className={`review-tab ${reviewTab === 'write' ? 'active' : ''}`} onClick={() => setReviewTab('write')}>
          리뷰 작성하기 {unwrittenHistories.length}
        </button>
        <button className={`review-tab ${reviewTab === 'written' ? 'active' : ''}`} onClick={() => setReviewTab('written')}>
          작성한 리뷰 보기 {writtenReviews.length}
        </button>
      </div>

      {reviewTab === 'write' && (
        <div className="review-written-list">
          {writeLoading ? <p>로딩 중...</p> : unwrittenHistories.length > 0 ? (
            unwrittenHistories.map(h => (
              <div key={h.id} className="review-written-item">
                <img src={h.image} alt={h.programName} style={{ width: 80, height: 80 }} />
                <div>
                  <p>{h.programName}</p>
                  <p>{h.branchName}</p>
                  <p>{h.trainerName}</p>
                  <button onClick={() => { setSelectedHistory(h); setIsWriteModalOpen(true); }}>리뷰 작성하기</button>
                </div>
              </div>
            ))
          ) : <p>리뷰를 작성할 이용내역이 없습니다.</p>}
        </div>
      )}

      {reviewTab === 'written' && (
        <div className="review-written-list">
          {writtenReviews.length > 0 ? writtenReviews.map(r => (
            <div key={r.reviewId} className="review-written-item">
              <img src={r.image} alt={r.programName} style={{ width: 80, height: 80 }} />
              <div>
                <p>{r.programName}</p>
                <p>{r.branchName}</p>
                <p>{r.trainerName}</p>
                <p>작성일: {r.writtenDate}</p>
                <button onClick={() => { setSelectedReview(r); setIsDetailModalOpen(true); }}>상세보기</button>
                <button onClick={() => { setSelectedReviewId(r.reviewId); setIsEditModalOpen(true); }}>수정하기</button>
                <button onClick={async () => {
                  if (!window.confirm('정말 삭제하시겠습니까?')) return;
                  await deleteReview(r.reviewId); fetchMyReviews();
                }}>삭제하기</button>
              </div>
            </div>
          )) : <p>작성한 리뷰가 없습니다.</p>}
        </div>
      )}

      {isWriteModalOpen && <ReviewWriteModal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} history={selectedHistory} onRefresh={() => { fetchUnwrittenHistories(); fetchMyReviews(); }} />}
      {isDetailModalOpen && <ReviewDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} review={selectedReview} />}
      {isEditModalOpen && <ReviewEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} reviewId={selectedReviewId} writtenReviews={writtenReviews} onRefresh={fetchMyReviews} />}
    </section>
  );
}

export default ReviewWriteSection;
