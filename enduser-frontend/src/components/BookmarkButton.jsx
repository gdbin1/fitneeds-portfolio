import React from 'react';
import './BookmarkButton.css';

function BookmarkButton({ isFavorite, onToggle }) {
  return (
    <button
      className={`bookmark-btn ${isFavorite ? 'active' : ''}`}
      onClick={(e) => {
        e.stopPropagation(); // 카드 클릭 막기
        onToggle();
      }}
      aria-label="즐겨찾기"
    >
      ★
    </button>
  );
}

export default BookmarkButton;
