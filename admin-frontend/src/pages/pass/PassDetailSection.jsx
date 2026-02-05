import React, { useState, useEffect } from "react";
import passApi from "../../api/passApi";

const PassDetailModal = ({ passId, onRefresh, onClose }) => {
  const [pass, setPass] = useState(null);
  const [editForm, setEditForm] = useState({ rmnCnt: 0, memo: "" });

  // 1. 상세 정보 및 히스토리 자동 로드 함수
  const fetchDetail = async () => {
    try {
      console.log("🔍 fetchDetail 호출 - passId:", passId, "타입:", typeof passId);
      const res = await passApi.getPassDetail(passId);
      console.log("📋 Pass Detail Response:", res.data);
      setPass(res.data);
      setEditForm({ rmnCnt: res.data.remainingCount || 0, memo: "" });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`데이터 로드 실패: ${msg}`);
      onClose();
    }
  };

  useEffect(() => { fetchDetail(); }, [passId]);

  // 2. 횟수 수정 (PUT)
  const handleUpdate = async () => {
    if (!editForm.memo) return alert("변경 사유를 반드시 입력하세요.");
    if (!window.confirm("잔여 횟수를 수정하시겠습니까?")) return;

    try {
      console.log("📤 업데이트 요청 데이터:", editForm);
      await passApi.updatePass(pass.passId, editForm);
      alert("수정 완료!");
      fetchDetail(); // 히스토리 즉시 갱신
      onRefresh();   // 메인 목록 갱신
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`수정 실패: ${msg}`);
    }
  };

  // 3. 상태 변경 및 회수 (PATCH/DELETE)
  const handleAction = async (actionType, param) => {
    const msg = actionType === 'DELETE' ? "이용권을 회수(삭제)하시겠습니까?" : `상태를 ${param}으로 변경하시겠습니까?`;
    if (!window.confirm(msg)) return;

    try {
      if (actionType === 'DELETE') await passApi.deletePass(pass.passId);
      else await passApi.updateStatus(pass.passId, param);
      
      alert("처리 완료!");
      fetchDetail(); 
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`작업 실패: ${msg}`);
    }
  };

  // 4. 삭제된 이용권 복구
  const handleRestore = async () => {
    if (!window.confirm("삭제된 이용권을 복구하시겠습니까?")) return;

    try {
      await passApi.restorePass(pass.passId);
      alert("복구 완료!");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`복구 실패: ${msg}`);
    }
  };

  if (!pass) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content detail-modal">
        <div className="stat-bar">
          <h3>🔍 이용권 상세 관리 [{pass.userName}]</h3>
          <button onClick={onClose}>닫기</button>
        </div>

        <div className="detail-grid">
          {/* 관리 영역 */}
          <div className="admin-card">
            <h4>⚙️ 정보 수정</h4>
            <div className="input-group">
              <label>종목: <strong>{pass.sportName}</strong></label>
              <label>현재 상태: <span className={`status-${pass.passStatusCode}`}>{pass.passStatusCode}</span></label>
            </div>
            
            <div className="input-group">
              <label>현재 잔여 횟수: <strong>{pass.remainingCount}회</strong></label>
            </div>

            <div className="input-group">
              <label>변경할 잔여 횟수</label>
              <input type="number" className="input-field" value={editForm.rmnCnt} 
                     onChange={e => setEditForm({...editForm, rmnCnt: Number(e.target.value)})} 
                     placeholder="변경 후 최종 횟수 입력" />
            </div>
            <div className="input-group">
              <label>변경 사유 (필수)</label>
              <input className="input-field" value={editForm.memo} placeholder="사유 입력" 
                     onChange={e => setEditForm({...editForm, memo: e.target.value})} />
            </div>
            
            <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button className="update-btn" onClick={handleUpdate} disabled={pass.passStatusCode === 'DELETED'}>저장</button>

              {/* 상태에 따른 동적 버튼 제어 */}
              {pass.passStatusCode === 'DELETED' ? (
                <button className="active-btn" onClick={handleRestore}>복구(활성화)</button>
              ) : (
                <>
                  {pass.passStatusCode === 'ACTIVE' ? (
                    <button className="stop-btn" onClick={() => handleAction('STATUS', 'SUSPENDED')}>정지</button>
                  ) : (
                    <button className="active-btn" onClick={() => handleAction('STATUS', 'ACTIVE')}>활성</button>
                  )}
                  <button className="delete-btn" onClick={() => handleAction('DELETE')}>회수(삭제)</button>
                </>
              )}
            </div>
          </div>

          {/* 히스토리 영역 */}
          <div className="history-card">
            <h4>📜 변동 이력 (최신순)</h4>
            <div className="scroll-table">
              <table className="erp-table mini">
                <thead>
                  <tr><th>일시</th><th>구분</th><th>변동</th><th>사유</th></tr>
                </thead>
                <tbody>
                  {pass.histories && pass.histories.length > 0 ? (
                    pass.histories.map(log => (
                      <tr key={log.logId}>
                        <td>{log.regDt?.substring(0, 16).replace('T', ' ')}</td>
                        <td>{log.chgTypeCd}</td>
                        <td className={log.chgCnt > 0 ? 'text-plus' : 'text-minus'}>{log.chgCnt > 0 ? '+' : ''}{log.chgCnt}회</td>
                        <td className="text-left">{log.chgRsn}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>이력이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassDetailModal;