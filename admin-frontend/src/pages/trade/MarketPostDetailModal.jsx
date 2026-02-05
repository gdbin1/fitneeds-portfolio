import React, { useState, useEffect } from "react";
import marketApi from "../../api/marketApi";

const MarketPostDetailModal = ({ postId, onClose, onRefresh }) => {
  const [post, setPost] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    saleAmt: 0,
  });

  const fetchDetail = async () => {
    try {
      const res = await marketApi.getPostDetail(postId);
      setPost(res.data);
      setEditForm({
        title: res.data.title,
        content: res.data.content,
        saleAmt: res.data.saleAmt,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`게시글 로드 실패: ${msg}`);
      onClose();
    }
  };

  useEffect(() => {
    if (postId) fetchDetail();
  }, [postId]);

  const handleUpdate = async () => {
    if (!window.confirm("게시글을 수정하시겠습니까?")) return;
    try {
      await marketApi.updatePost(postId, editForm);
      alert("수정되었습니다.");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`수정 실패: ${msg}`);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`상태를 '${newStatus}'로 변경하시겠습니까?`)) return;
    try {
      await marketApi.updatePostStatus(postId, newStatus);
      alert("상태가 변경되었습니다.");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`상태 변경 실패: ${msg}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await marketApi.deletePost(postId);
      alert("삭제되었습니다.");
      onRefresh();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`삭제 실패: ${msg}`);
    }
  };

  if (!post) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="stat-bar">
          <h3>🛒 게시글 상세 관리</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <hr />
        <div className="detail-grid">
          <div className="admin-card">
            <h4>⚙️ 게시글 수정</h4>
            <div className="input-group">
              <label>종목</label>
              <input className="input-field" value={post.sportName} disabled />
            </div>
            <div className="input-group">
              <label>판매자</label>
              <input className="input-field" value={post.sellerId} disabled />
            </div>
            <div className="input-group">
              <label>제목</label>
              <input
                className="input-field"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>내용</label>
              <textarea
                className="input-field"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                rows="4"
              />
            </div>
            <div className="input-group">
              <label>판매 금액 (원)</label>
              <input
                type="number"
                className="input-field"
                value={editForm.saleAmt}
                onChange={(e) =>
                  setEditForm({ ...editForm, saleAmt: Number(e.target.value) })
                }
              />
            </div>

            <div
              className="button-group"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <button className="update-btn" onClick={handleUpdate}>
                정보 저장
              </button>
              {post.statusCode === "ON_SALE" ? (
                <button
                  className="stop-btn"
                  onClick={() => handleStatusChange("SOLD_OUT")}
                >
                  판매 완료 처리
                </button>
              ) : (
                <button
                  className="active-btn"
                  onClick={() => handleStatusChange("ON_SALE")}
                >
                  판매중으로 복구
                </button>
              )}
              <button className="delete-btn" onClick={handleDelete}>
                게시글 삭제
              </button>
            </div>
          </div>

          <div className="history-card">
            <h4>📄 시스템 정보</h4>
            <table className="erp-table mini">
              <tbody>
                <tr>
                  <th>게시글 ID</th>
                  <td>{post.postId}</td>
                </tr>
                <tr>
                  <th>판매수량</th>
                  <td>{post.sellQty}회</td>
                </tr>
                <tr>
                  <th>현재 상태</th>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background:
                          post.statusCode === "ON_SALE"
                            ? "#e6f4ea"
                            : "#fce8e6",
                        color:
                          post.statusCode === "ON_SALE"
                            ? "#1e7e34"
                            : "#c92a2a",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      {post.statusCode}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>등록일</th>
                  <td>{post.regDt?.replace("T", " ").substring(0, 16)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPostDetailModal;
