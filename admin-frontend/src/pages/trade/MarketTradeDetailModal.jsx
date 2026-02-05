import React, { useState, useEffect } from "react";
import marketApi from "../../api/marketApi"; //

const MarketTradeDetailModal = ({ tradeId, onClose, onRefresh }) => {
  const [trade, setTrade] = useState(null);

  // 1. 거래 상세 정보 로드
  const fetchDetail = async () => {
    try {
      const res = await marketApi.getTradeDetail(tradeId); //
      setTrade(res.data); // 기반 데이터
    } catch (err) {
      alert("거래 내역을 불러오는데 실패했습니다.");
      onClose();
    }
  };

  useEffect(() => {
    if (tradeId) fetchDetail();
  }, [tradeId]);

  // 2. 거래 상태 변경 (PATCH /api/market/trades/{id}/status)
  const handleStatusChange = async (newStatus) => {
    let confirmMsg = "";
    if (newStatus === "COMPLETED") {
      confirmMsg = "거래를 '완료' 처리하시겠습니까?\n판매자의 이용권이 차감되고 구매자에게 부여됩니다."; //
    } else if (newStatus === "CANCELED") {
      confirmMsg = "거래를 '취소'하시겠습니까?\n이미 완료된 거래라면 구매자의 이용권이 회수되고 판매자에게 복구됩니다."; //
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      // @RequestParam String status 형식이므로 params로 전송
      await marketApi.updateTradeStatus(tradeId, newStatus); 
      alert("거래 상태가 성공적으로 변경되었습니다.");
      fetchDetail(); // 현재 모달 정보 갱신
      onRefresh();   // 부모 목록 페이지 갱신
    } catch (err) {
      const errorMsg = err.response?.data?.message || "상태 변경 중 오류가 발생했습니다.";
      alert(`처리 실패: ${errorMsg}`); //에서 던지는 예외 메시지 출력
    }
  };

  if (!trade) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="stat-bar">
          <h3>🤝 거래 내역 상세 관리</h3>
          <button className="ghost-btn" onClick={onClose}>닫기</button>
        </div>
        <hr />

        <div className="detail-grid">
          {/* 거래 정보 영역 */}
          <div className="admin-card">
            <h4>📄 거래 정보</h4>
            <div className="input-group">
              <label>관련 게시글</label>
              <div className="input-field" style={{ backgroundColor: '#e9ecef' }}>{trade.postTitle}</div>
            </div>
            <div className="input-group" style={{ marginTop: '10px' }}>
              <label>스포츠 종목</label>
              <div className="input-field" style={{ backgroundColor: '#fff' }}>{trade.sportName}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div className="input-group">
                <label>판매자 ID</label>
                <div className="input-field" style={{ backgroundColor: '#fff' }}>{trade.sellerId}</div>
              </div>
              <div className="input-group">
                <label>구매자 ID</label>
                <div className="input-field" style={{ backgroundColor: '#fff' }}>{trade.buyerId}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div className="input-group">
                <label>거래 수량</label>
                <div className="input-field" style={{ fontWeight: 'bold' }}>{trade.buyQty}회</div>
              </div>
              <div className="input-group">
                <label>거래 금액</label>
                <div className="input-field" style={{ color: '#0d6efd', fontWeight: 'bold' }}>
                  {trade.tradeAmt?.toLocaleString()}원
                </div>
              </div>
            </div>

            {/* 상태 변경 버튼 그룹 로직 반영 */}
            <div className="button-group" style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
              {trade.sttsCd !== 'COMPLETED' && (
                <button className="success-btn" style={{ flex: 1 }} onClick={() => handleStatusChange('COMPLETED')}>
                  거래 완료 승인
                </button>
              )}
              {trade.sttsCd !== 'CANCELED' && (
                <button className="delete-btn" style={{ flex: 1 }} onClick={() => handleStatusChange('CANCELED')}>
                  거래 취소/회수
                </button>
              )}
            </div>
          </div>

          {/* 시스템 기록 영역 */}
          <div className="history-card" style={{ padding: '15px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <h4>📜 처리 현황</h4>
            <table className="erp-table mini">
              <tbody>
                <tr>
                  <th>거래 번호</th>
                  <td>{trade.tradeId}</td>
                </tr>
                <tr>
                  <th>현재 상태</th>
                  <td>
                    <strong style={{ color: trade.sttsCd === 'COMPLETED' ? '#28a745' : trade.sttsCd === 'CANCELED' ? '#dc3545' : '#333' }}>
                      {trade.sttsCd}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <th>최초 요청일</th>
                  <td>{trade.regDt?.replace('T', ' ').substring(0, 16)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: '20px', padding: '12px', background: '#fff9db', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
              <strong>관리자 주의사항:</strong><br />
              '거래 완료' 시 시스템이 자동으로 판매자의 남은 횟수를 차감하고 구매자에게 새로운 이용권을 생성하거나 기존 이용권에 합산합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTradeDetailModal;