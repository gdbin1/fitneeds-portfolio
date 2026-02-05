// PassTradeQna.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api';
import './PassTradeFaq.css';
import QnaDetailModal from './QnaDetailModal';
import QnaWriteModal from './QnaWriteModal';

const PassTradeQna = () => {
  /* =========================
     상태 정의
     ========================= */

  // 🔥 QnA 목록 (API 연동)
  const [qnaList, setQnaList] = useState([]);

  // 현재 열려있는 모달 타입
  // null | 'detail' | 'write'
  const [activeModal, setActiveModal] = useState(null);

  // 상세보기용 선택된 QnA
  const [selectedQna, setSelectedQna] = useState(null);

  // 로그인 사용자 ID
  const userId = useSelector((state) => state.auth.userId);




  /* =========================
     QnA 목록 조회 API
     ========================= */
  const fetchQnaList = async () => {
    try {
      const res = await api.get('/passfaq');
      setQnaList(res.data);
      console.log(res.data);
    } catch (err) {
      console.error('문의 게시판 조회 실패', err);
    }
  };

  // 최초 1회 조회
  useEffect(() => {
    fetchQnaList();
  }, []);

  /* =========================
     모달 제어 함수
     ========================= */

  // 상세보기 모달 열기
  const openDetail = (qna) => {
    setSelectedQna(qna);
    setActiveModal('detail');
  };

  // 작성 모달 열기
  const openWrite = () => {
    setSelectedQna(null);
    setActiveModal('write');
  };

  // 모든 모달 닫기
  const closeModal = () => {
    setSelectedQna(null);
    setActiveModal(null);
  };

  return (
    <div className="pass-trade-qna">
      <hr className="qna-divider" />
      <h1>문의 게시판</h1>

      {/* 문의하기 버튼 */}
      <div className="qna-header">
        <button className="qna-write-btn" onClick={openWrite}>
          문의하기
        </button>
      </div>

      {/* 테이블 헤더 */}
      <div className="qna-table-header">
        <span>상태</span>
        <span>제목</span>
        <span>작성자</span>
        <span>작성일</span>
      </div>

      {/* QnA 리스트 */}
      {/* QnA 리스트 */}
      <div className="qna-table-body">
        {qnaList.map((qna) => {
          const isAnswered = !!qna.answer;

          return (
            <div
              key={qna.faqId}
              className="qna-row"
              onClick={() => openDetail(qna)}
            >
              <span className={`badge ${isAnswered ? 'answered' : 'waiting'}`}>
                {isAnswered ? '답변완료' : '미답변'}
              </span>

              <span>{qna.question?.split('\n')[0]}</span>
              <span>{qna.writerName}</span>
              <span>{qna.createdAt?.slice(0, 10)}</span>
            </div>
          );
        })}
      </div>



      {/* =========================
         모달 영역
         ========================= */}
      {activeModal && (
        <>
          {activeModal === 'detail' && selectedQna && (
            <QnaDetailModal
              faqId={selectedQna.faqId}
              loginUserId={userId}
              onClose={closeModal}
              onSuccess={fetchQnaList}
            />
          )}


          {activeModal === 'write' && (
            <QnaWriteModal
              onClose={closeModal}
              onSuccess={fetchQnaList}
            />
          )}
        </>
      )}

    </div>
  );
};

export default PassTradeQna;
