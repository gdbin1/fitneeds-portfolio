import React, { useState } from "react";
import passApi from "../../api/passApi";

const PassCreateModal = ({ sports, onClose, onSuccess }) => {
  // DTO 구조와 매핑
  const [formData, setFormData] = useState({ userId: "", sportId: "", rmnCnt: 0, status: "ACTIVE" });
  const [userKeyword, setUserKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleUserSearch = async () => {
    try {
      const res = await passApi.searchUsers(userKeyword);
      setSearchResults(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`회원 검색 실패: ${msg}`);
    }
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.userId || !formData.sportId) return alert("회원과 종목을 선택해주세요.");
    
    try {
      await passApi.createPass(formData);
      alert("이용권이 등록되었습니다.");
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`등록 실패: ${msg}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>🎫 이용권 수동 등록</h3>
        <hr />
        
        {/* 1. 회원 검색 및 선택 */}
        <div className="input-group">
          <label>회원 검색 (ID/이름)</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input className="input-field" value={userKeyword} onChange={e => setUserKeyword(e.target.value)} placeholder="회원명 검색" />
            <button type="button" onClick={handleUserSearch}>검색</button>
          </div>
          {searchResults.length > 0 && (
            <select className="input-field" style={{ marginTop: '5px' }} 
                    onChange={e => setFormData({ ...formData, userId: e.target.value })}>
              <option value="">회원 선택</option>
              {searchResults.map(u => <option key={u.userId} value={u.userId}>{u.userName}({u.userId})</option>)}
            </select>
          )}
        </div>

        {/* 2. 스포츠 종목 선택 (스포츠 목록 연동) */}
        <div className="input-group">
          <label>스포츠 종목</label>
          <select className="input-field" onChange={e => setFormData({ ...formData, sportId: Number(e.target.value) })}>
            <option value="">종목 선택</option>
            {sports.map(s => <option key={s.sportId} value={s.sportId}>{s.sportNm}</option>)}
          </select>
        </div>

        {/* 3. 부여 횟수 입력 */}
        <div className="input-group">
          <label>부여 횟수 (rmnCnt)</label>
          <input type="number" className="input-field" min="0" 
                 onChange={e => setFormData({ ...formData, rmnCnt: Number(e.target.value) })} />
        </div>

        <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>취소</button>
          <button className="create-btn" onClick={handleSubmit}>등록 확정</button>
        </div>
      </div>
    </div>
  );
};

export default PassCreateModal;