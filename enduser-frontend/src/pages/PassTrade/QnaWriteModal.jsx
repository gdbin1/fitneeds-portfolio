// QnaWriteModal.jsx
import React, { useState } from 'react';
import api from '../../api';
import './PassTradeFaq.css';

const QnaWriteModal = ({ onClose, onSuccess }) => {
  /* =========================
     입력값 상태
     ========================= */
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 공통 FAQ 카테고리 (현재는 고정)
  const CATEGORY = 'GENERAL';

  /* =========================
     문의 등록 처리
     ========================= */
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 공통 DB 기준: title 컬럼이 없어서 question으로 합침
    const question = `[${title.trim()}]\n${content.trim()}`;

    try {
      setIsSubmitting(true);

      await api.post('/passfaq', {
        question,
        category: CATEGORY,
      });

      alert('문의가 등록되었습니다.');

      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      console.error('문의 등록 실패', e);
      alert('문의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="qna-modal-backdrop">
    <div className="qna-modal">
      <div className="qna-modal-header">
        <h3>문의 작성</h3>
       
      </div>

      <div className="qna-modal-section">
        <h4>제목</h4>
        <input
          type="text"
          className="qna-input"
          placeholder="문의 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="qna-modal-section">
        <h4>문의 내용</h4>
        <textarea
          className="qna-textarea"
          placeholder="문의 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="qna-modal-footer">
        <button
          className="qna-btn cancel"
          onClick={onClose}
          disabled={isSubmitting}
        >
          취소
        </button>

        <button
          className="qna-btn submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '등록'}
        </button>
      </div>
    </div>
    </div>
  );
};

export default QnaWriteModal;
