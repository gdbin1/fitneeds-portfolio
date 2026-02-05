import React, { useState, useEffect } from "react";
import productApi from "../../api/productApi";
import passApi from "../../api/passApi";

const PassProductCreateModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    sportId: "",
    prodNm: "",
    prodAmt: 0,
    prvCnt: 0,
  });
  const [sports, setSports] = useState([]);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const res = await passApi.getActiveSports();
      setSports(res.data || []);
    } catch (err) {
      console.error("스포츠 목록 로드 실패:", err);
      alert("스포츠 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.sportId || !formData.prodNm) {
      return alert("종목과 상품명을 입력해주세요.");
    }

    if (formData.prodAmt <= 0 || formData.prvCnt <= 0) {
      return alert("가격과 횟수는 0보다 커야 합니다.");
    }

    try {
      await productApi.createProduct({
        ...formData,
        sportId: Number(formData.sportId),
      });
      alert("이용권 상품이 등록되었습니다.");
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
        <h3>🎫 이용권 상품 등록</h3>
        <hr />

        <div className="input-group">
          <label>스포츠 종목</label>
          <select
            className="input-field"
            value={formData.sportId}
            onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
          >
            <option value="">종목 선택</option>
            {sports.map((s) => (
              <option key={s.sportId} value={s.sportId}>
                {s.sportNm}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>상품명</label>
          <input
            type="text"
            className="input-field"
            placeholder="예: 골프 30회 이용권"
            value={formData.prodNm}
            onChange={(e) => setFormData({ ...formData, prodNm: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>상품 가격 (원)</label>
          <input
            type="number"
            className="input-field"
            min="0"
            value={formData.prodAmt}
            onChange={(e) => setFormData({ ...formData, prodAmt: Number(e.target.value) })}
          />
        </div>

        <div className="input-group">
          <label>제공 횟수 (회)</label>
          <input
            type="number"
            className="input-field"
            min="0"
            value={formData.prvCnt}
            onChange={(e) => setFormData({ ...formData, prvCnt: Number(e.target.value) })}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ background: "#6c757d", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px" }}>
            취소
          </button>
          <button className="create-btn" onClick={handleSubmit}>
            등록 확정
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassProductCreateModal;
