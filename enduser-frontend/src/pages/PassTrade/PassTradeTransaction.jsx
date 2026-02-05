// passtrade
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api';
import './PassTradeTransaction.css';

const PassTradeTransaction = () => {
  // 로그인 정보
  const { isAuthenticated, userId } = useSelector((state) => state.auth);
  console.log('로그인 userId =', userId);

  const [activeTab, setActiveTab] = useState('buy'); // buy | sell
  const [transactions, setTransactions] = useState([]);

  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  /* ===============================
     거래 내역 API 호출
  =============================== */
  const fetchTransactions = async (type) => {
    if (!isAuthenticated) return;

    try {
      const endpoint =
        type === 'buy'
          ? '/pass-trade-transactions/buy'
          : '/pass-trade-transactions/sell';

      const res = await api.get(endpoint);

      const mapped = res.data.map((tx) => ({
        txId: tx.transactionId,
        type: type === 'buy' ? 'BUY' : 'SELL',
        title: tx.postTitle ?? `게시글 #${tx.postId}`,
        counterParty:
          type === 'buy'
            ? tx.sellerName   // 판매자 이름
            : tx.buyerName,   // 구매자 이름
        quantity: tx.buyQty,
        price: tx.tradeAmt,
        status: tx.sttsCd,
        tradedAt: tx.regDt?.replace('T', ' ')
      }));

      setTransactions(mapped);
    } catch (e) {
      console.error('거래 내역 조회 실패', e);
    }
  };

  useEffect(() => {
    fetchTransactions(activeTab);
  }, [activeTab]);

  // 상태 뱃지 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'CANCELED':
        return 'red';
      default:
        return 'gray';
    }
  };

  // 상세 모달 열기 (API 호출 ❌)
  const openDetail = (tx) => {
    console.log('openDetail called', tx);
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  return (
    <div className="pass-trade-transaction">
      <h1>거래 내역</h1>

      {/* 탭 */}
      <div className="tabs">
        <button
          className={activeTab === 'buy' ? 'active' : ''}
          onClick={() => setActiveTab('buy')}
        >
          구매 내역
        </button>
        <button
          className={activeTab === 'sell' ? 'active' : ''}
          onClick={() => setActiveTab('sell')}
        >
          판매 내역
        </button>
      </div>

      {/* 테이블 헤더 */}
      <div className="transaction-header">
        <span>구분</span>
        <span>이용권</span>
        <span>거래상대</span>
        <span>수량</span>
        <span>금액</span>
        <span>상태</span>
        <span>거래일</span>
      </div>

      {/* 거래 내역 리스트 */}
      <div className="transaction-list">
        {transactions.map((tx) => (
          <div
            key={tx.txId}
            className="transaction-item"
            onClick={() => openDetail(tx)}
          >
            <span className={`transaction-type ${tx.type === 'BUY' ? 'buy' : 'sell'}`}>
              {tx.type === 'BUY' ? '구매' : '판매'}
            </span>
            <span>{tx.title}</span>
            <span>{tx.counterParty}</span>
            <span>{tx.quantity}</span>
            <span>{tx.price.toLocaleString()}원</span>
            <span className={`status ${getStatusColor(tx.status)}`}>
              {tx.status}
            </span>
            <span>{tx.tradedAt}</span>
          </div>
        ))}
      </div>

      {/* 거래 상세 모달 */}
      {isDetailOpen && selectedTx && (
        <div className="transaction-modal-content">
          <div
            className="transaction-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h1>거래 상세</h1>

            <p>거래 ID: {selectedTx.txId}</p>
            <p>구분: {selectedTx.type === 'BUY' ? '구매' : '판매'}</p>
            <p>수량: {selectedTx.quantity}</p>
            <p>금액: {selectedTx.price.toLocaleString()}원</p>
            <p>상태: {selectedTx.status}</p>
            <p>거래일: {selectedTx.tradedAt}</p>

            <button onClick={() => setIsDetailOpen(false)}>닫기</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PassTradeTransaction;
