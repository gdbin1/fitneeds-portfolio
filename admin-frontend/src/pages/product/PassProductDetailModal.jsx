import React, { useState, useEffect } from "react";
import productApi from "../../api/productApi";
import passApi from "../../api/passApi";

const PassProductDetailModal = ({ prodId, onRefresh, onClose }) => {
  const [product, setProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    prodNm: "",
    prodAmt: 0,
    prvCnt: 0,
  });
  const [sports, setSports] = useState([]);

  useEffect(() => {
    fetchDetail();
    loadSports();
  }, [prodId]);

  const fetchDetail = async () => {
    try {
      const res = await productApi.getProductDetail(prodId);
      setProduct(res.data);
      setEditForm({
        prodNm: res.data.prodNm || "",
        prodAmt: res.data.prodAmt || 0,
        prvCnt: res.data.prvCnt || 0,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`데이터 로드 실패: ${msg}`);
      onClose();
    }
  };

  const loadSports = async () => {
    try {
      const res = await passApi.getActiveSports();
      setSports(res.data || []);
    } catch (err) {
      console.error("스포츠 목록 로드 실패:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editForm.prodNm) {
      return alert("상품명을 입력해주세요.");
    }

    if (editForm.prodAmt <= 0 || editForm.prvCnt <= 0) {
      return alert("가격과 횟수는 0보다 커야 합니다.");
    }

    if (!window.confirm("상품 정보를 수정하시겠습니까?")) return;

    try {
      await productApi.updateProduct(product.prodId, editForm);
      alert("수정 완료!");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`수정 실패: ${msg}`);
    }
  };

  const handleStatusChange = async (useYn) => {
    const msg = useYn ? "상품을 판매 활성화하시겠습니까?" : "상품을 판매 중지하시겠습니까?";
    if (!window.confirm(msg)) return;

    try {
      await productApi.updateStatus(product.prodId, useYn);
      alert("상태가 변경되었습니다.");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`작업 실패: ${msg}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await productApi.deleteProduct(product.prodId);
      alert("삭제되었습니다.");
      onRefresh();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`삭제 실패: ${msg}`);
    }
  };

  if (!product) return null;

  const sportName = sports.find(s => s.sportId === product.sportId)?.sportNm || "알 수 없음";

  return (
    <div className="modal-overlay">
      <div className="modal-content detail-modal">
        <div className="stat-bar">
          <h3>🔍 이용권 상품 상세 관리</h3>
          <button onClick={onClose}>닫기</button>
        </div>

        <div className="detail-grid">
          <div className="admin-card">
            <h4>⚙️ 상품 정보 수정</h4>
            
            <div className="input-group">
              <label>
                스포츠 종목: <strong>{sportName}</strong>
              </label>
              <label>
                상태:{" "}
                <span className={product.useYn ? "status-ACTIVE" : "status-STOP"}>
                  {product.useYn ? "판매중" : "판매중지"}
                </span>
              </label>
            </div>

            <div className="input-group">
              <label>상품명</label>
              <input
                type="text"
                className="input-field"
                value={editForm.prodNm}
                onChange={(e) => setEditForm({ ...editForm, prodNm: e.target.value })}
                placeholder="상품명 입력"
              />
            </div>

            <div className="input-group">
              <label>상품 가격 (원)</label>
              <input
                type="number"
                className="input-field"
                value={editForm.prodAmt}
                onChange={(e) => setEditForm({ ...editForm, prodAmt: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div className="input-group">
              <label>제공 횟수 (회)</label>
              <input
                type="number"
                className="input-field"
                value={editForm.prvCnt}
                onChange={(e) => setEditForm({ ...editForm, prvCnt: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div
              className="button-group"
              style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}
            >
              <button className="update-btn" onClick={handleUpdate}>
                저장
              </button>

              {product.useYn ? (
                <button className="stop-btn" onClick={() => handleStatusChange(false)}>
                  판매 중지
                </button>
              ) : (
                <button className="active-btn" onClick={() => handleStatusChange(true)}>
                  판매 활성화
                </button>
              )}
              <button className="delete-btn" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>

          <div className="history-card">
            <h4>📋 상품 정보</h4>
            <div className="info-table">
              <table className="erp-table mini">
                <tbody>
                  <tr>
                    <th>상품 ID</th>
                    <td>{product.prodId}</td>
                  </tr>
                  <tr>
                    <th>스포츠 ID</th>
                    <td>{product.sportId}</td>
                  </tr>
                  <tr>
                    <th>상품명</th>
                    <td>{product.prodNm}</td>
                  </tr>
                  <tr>
                    <th>가격</th>
                    <td>{product.prodAmt?.toLocaleString()}원</td>
                  </tr>
                  <tr>
                    <th>제공 횟수</th>
                    <td>{product.prvCnt}회</td>
                  </tr>
                  <tr>
                    <th>등록일</th>
                    <td>{product.regDt ? new Date(product.regDt).toLocaleString() : "-"}</td>
                  </tr>
                  <tr>
                    <th>수정일</th>
                    <td>{product.updDt ? new Date(product.updDt).toLocaleString() : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassProductDetailModal;
