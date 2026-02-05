// BuyModal.jsx
import { useState, useMemo } from 'react';
import './BuyModal.css';


const BuyModal = ({ post, onClose, onBuy }) => {
  const [buyCount, setBuyCount] = useState(1);
  const sellerDisplayName =
    post.sellerName ?? post.sellerId?.slice(0, 3) + '***';

  // 1장 단가 계산
  const unitPrice = useMemo(() => {
    if (!post.sellCount) return 0;
    return Math.floor(post.saleAmount / post.sellCount);
  }, [post]);

  const totalPrice = unitPrice * buyCount;

  return (
    <div className="buy-modal-container">
      
        <div className="buy-modal-content">

          {/* ===== 제목 ===== */}
          <h2 className="buy-title">구매하기</h2>

          {/* ===== 기본 정보 ===== */}
          <div className="buy-info">
            <div className="buy-row">
              <span className="label">이용권</span>
              <span className="value">{post.passName ?? post.title}</span>
            </div>

            <div className="buy-row">
              <span className="label">판매자</span>
              <span className="value">{sellerDisplayName}</span>
            </div>

            <div className="buy-row">
              <span className="label">1장 단가</span>
              <span className="value">
                {unitPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* ===== 수량 선택 ===== */}
          <div className="buy-count-row">
            <label>구매 수량</label>
            <input
              type="number"
              min="1"
              max={post.sellCount}
              value={buyCount}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (Number.isNaN(value)) return;

                if (value < 1) {
                  setBuyCount(1);
                } else if (value > post.sellCount) {
                  setBuyCount(post.sellCount);
                } else {
                  setBuyCount(value);
                }
              }}

            />
          </div>

          {/* ===== 총 금액 ===== */}
          <div className="buy-total">
            <span>총 금액</span>
            <strong>{totalPrice.toLocaleString()}원</strong>
          </div>

          {/* ===== 버튼 ===== */}
          <div className="buy-modal-actions">
            <button
              className="btn-outline"
              onClick={onClose}
            >
              닫기
            </button>

             <button
              className="btn-primary"
              onClick={() => onBuy(buyCount)}
            >
              구매
            </button>

          </div>
        </div>
      </div>
   
  );
};

export default BuyModal;
