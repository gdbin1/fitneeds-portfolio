import { useEffect, useState } from 'react';
import api from '../../api';
import './QnaDetailModal.css';

/* ==================================================
   답변 등록 모달 (자식 모달)
   ================================================== */
const QnaAnswerModal = ({ faqId, onClose, onSuccess }) => {
  const [answer, setAnswer] = useState('');

  // 답변 등록
  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      await api.post(`/passfaq/${faqId}/answer`, { answer });
      onSuccess(); // 부모 상세 + 목록 갱신
      onClose();   // 답변 모달 닫기
    } catch (e) {
      alert(e.response?.data?.message || '답변 등록 실패');
    }
  };

  return (
    <div className="qna-modal-backdrop">
      <div className="qna-modal">

        <div className="qna-modal-header">
          <h3>답변 등록</h3>
        </div>

        <div className="qna-modal-section">
          <textarea
            className="qna-textarea"
            placeholder="답변을 작성해주세요."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>

        <div className="qna-modal-footer">
          <div className="qna-footer-left">
            <button className="btn-save" onClick={submitAnswer}>
              저장
            </button>
            <button className="btn-delete" onClick={onClose}>
              취소
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ==================================================
   QnA 상세 모달 (부모 모달)
   ================================================== */
const QnaDetailModal = ({ faqId, onClose, loginUserId, onSuccess }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // 수정 관련 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 답변 모달 제어
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);

  /* =========================
     상세 조회
     ========================= */
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/passfaq/${faqId}`);
      setDetail(res.data);

      // 제목 / 내용 분리 (기존 데이터 구조 유지)
      const [t, c] = (res.data.question ?? '').split('\n', 2);
      setEditTitle((t ?? '').replace(/^\[|\]$/g, '').trim());
      setEditContent((c ?? '').trim());
    } catch {
      alert('문의 상세 조회 실패');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (faqId) fetchDetail();
  }, [faqId]);

  if (loading || !detail) return null;

  /* =========================
     파생 값
     ========================= */
  const [title, content] = detail.question.split('\n', 2);
  const isMine = detail.userId === loginUserId;
  const isAnswered = !!detail.answer;

  /* =========================
     수정 저장
     ========================= */
  const submitEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    const question = `[${editTitle.trim()}]\n${editContent.trim()}`;

    try {
      await api.put(`/passfaq/${faqId}`, { question });
      setIsEditMode(false);   // 수정 모드 종료
      await fetchDetail();    // 상세 최신화
      onSuccess?.();          // 목록 최신화
    } catch (e) {
      alert(e.response?.data || '수정 실패');
    }
  };

  /* =========================
     삭제
     ========================= */
  const submitDelete = async () => {
    if (!window.confirm('정말 삭제할까요?')) return;
    await api.delete(`/passfaq/${faqId}`);
    onClose();
    onSuccess?.();
  };

  return (
    <>
      <div className="qna-modal-backdrop">
        <div className="qna-modal">

          <div className="qna-modal-header">
            <h3>{title}</h3>
          </div>

          <div className="qna-modal-meta">
            <span>작성자: {isMine ? '나' : detail.writerName}</span>
            <span>작성일: {detail.createdAt}</span>
          </div>

          <div className="qna-modal-section">
            <h4>문의 내용</h4>

            {!isEditMode ? (
              <p>{content}</p>
            ) : (
              <>
                <input
                  className="qna-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="qna-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />

                {/* 저장 / 취소 (같은 라인) */}
                <div className="qna-footer-left">
                  <button className="btn-save" onClick={submitEdit}>
                    저장
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => setIsEditMode(false)}
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="qna-modal-section">
            <h4>답변</h4>
            {isAnswered ? <p>{detail.answer}</p> : <p>답변 대기중입니다.</p>}
          </div>

          <div className="qna-modal-footer">
            <div className="qna-footer-left">
              {isMine && !isEditMode && (
                <>
                  <button className="btn-edit" onClick={() => setIsEditMode(true)}>
                    수정
                  </button>
                  <button className="btn-delete" onClick={submitDelete}>
                    삭제
                  </button>
                </>
              )}

              {!isMine && !isAnswered && (
                <button
                  className="btn-answer"
                  onClick={() => setIsAnswerOpen(true)}
                >
                  답변 달기
                </button>
              )}
            </div>

            <div className="qna-footer-right">
              <button className="btn btn-primary" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 답변 모달 */}
      {isAnswerOpen && (
        <QnaAnswerModal
          faqId={faqId}
          onClose={() => setIsAnswerOpen(false)}
          onSuccess={() => {
            fetchDetail();
            onSuccess?.();
          }}
        />
      )}
    </>
  );
};

export default QnaDetailModal;
