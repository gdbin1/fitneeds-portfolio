import React, { useState, useEffect } from "react";
import reservationApi from "../../api/reservationApi";

const ReservationDetailModal = ({ rsvId, onClose, onRefresh }) => {
  const [detail, setDetail] = useState(null);
  const [updateSchdId, setUpdateSchdId] = useState("");
  const [cancelRsn, setCancelRsn] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await reservationApi.getReservationDetail(rsvId);
      setDetail(res.data);
      setUpdateSchdId(res.data.schdId);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`조회 실패: ${msg}`);
      onClose();
    }
  };

  useEffect(() => {
    if (rsvId) fetchDetail();
  }, [rsvId]);

  // 상태 라벨 매핑
  const getStatusLabel = (code) => {
    const labels = {
      ACTIVE: "예약완료",
      CANCELED: "취소",
      PENDING: "대기",
      COMPLETED: "이용완료",
      NOSHOW: "노쇼",
    };
    return labels[code] || code;
  };

  // 상태 변경 (상태별 전환)
  const handleStatusChange = async (newStatus) => {
    if (
      !window.confirm(
        `예약 상태를 '${getStatusLabel(newStatus)}'로 변경하시겠습니까?`
      )
    )
      return;
    setIsUpdating(true);
    try {
      await reservationApi.updateReservationStatus(rsvId, {
        sttsCd: newStatus,
      });
      alert("상태가 변경되었습니다.");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`상태 변경 실패: ${msg}`);
    }
    setIsUpdating(false);
  };

  // 스케줄 변경 (PATCH)
  const handleUpdate = async () => {
    if (!updateSchdId) return alert("변경할 스케줄 ID를 입력해주세요.");
    if (!window.confirm("예약 스케줄을 변경하시겠습니까?")) return;
    setIsUpdating(true);
    try {
      await reservationApi.updateReservation(rsvId, {
        schdId: Number(updateSchdId),
      });
      alert("스케줄이 변경되었습니다.");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`수정 실패: ${msg}`);
    }
    setIsUpdating(false);
  };

  // 예약 취소 (PATCH)
  const handleCancel = async () => {
    if (!cancelRsn.trim()) return alert("취소 사유를 입력해주세요.");
    if (!window.confirm("정말 예약을 취소하시겠습니까?")) return;
    setIsUpdating(true);
    try {
      await reservationApi.cancelReservation(rsvId, { cnclRsn: cancelRsn });
      alert("예약이 취소되었습니다.");
      fetchDetail();
      onRefresh();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`취소 실패: ${msg}`);
    }
    setIsUpdating(false);
  };

  if (!detail) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="stat-bar">
          <h3>🔍 예약 상세/수정</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <hr />
        <div className="detail-grid">
          {/* 정보 조회 및 수정 영역 */}
          <div className="admin-card">
            <h4>⚙️ 상태 관리</h4>
            <div className="input-group">
              <label>회원명</label>
              <input
                className="input-field"
                value={detail.memberName}
                disabled
              />
            </div>
            <div className="input-group">
              <label>종목</label>
              <input
                className="input-field"
                value={detail.sportName}
                disabled
              />
            </div>

            {detail.sttsCd === "RESERVED" && (
              <>
                <div className="input-group">
                  <label>상태 변경</label>
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => handleStatusChange("COMPLETED")}
                      className="success-btn"
                      disabled={isUpdating}
                    >
                      ✅ 이용완료
                    </button>
                    <button
                      onClick={() => handleStatusChange("NOSHOW")}
                      className="warning-btn"
                      disabled={isUpdating}
                    >
                      ⚠️ 노쇼
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label>스케줄 ID 변경</label>
                  <input
                    type="number"
                    className="input-field"
                    value={updateSchdId}
                    onChange={(e) => setUpdateSchdId(e.target.value)}
                  />
                  <button
                    onClick={handleUpdate}
                    className="update-btn"
                    style={{ marginTop: "5px" }}
                    disabled={isUpdating}
                  >
                    스케줄 업데이트
                  </button>
                </div>
                <div className="input-group" style={{ marginTop: "15px" }}>
                  <label>취소 사유 입력</label>
                  <input
                    className="input-field"
                    value={cancelRsn}
                    onChange={(e) => setCancelRsn(e.target.value)}
                    placeholder="사유를 입력하세요"
                  />
                  <button
                    onClick={handleCancel}
                    className="delete-btn"
                    style={{ marginTop: "5px" }}
                    disabled={isUpdating}
                  >
                    🗑️ 예약 취소
                  </button>
                </div>
              </>
            )}
            {detail.sttsCd === "CANCELED" && (
              <div className="input-group">
                <label>취소 사유</label>
                <p style={{ color: "red" }}>{detail.cnclRsn}</p>
              </div>
            )}
            {detail.sttsCd === "COMPLETED" && (
              <div className="input-group">
                <label>상태</label>
                <p style={{ color: "green", fontWeight: "bold" }}>
                  ✅ 이용완료
                </p>
              </div>
            )}
            {detail.sttsCd === "NOSHOW" && (
              <div className="input-group">
                <label>상태</label>
                <p style={{ color: "orange", fontWeight: "bold" }}>⚠️ 노쇼</p>
              </div>
            )}
          </div>

          {/* 시스템 정보 영역 */}
          <div className="history-card">
            <h4>📄 시스템 정보</h4>
            <table className="erp-table mini">
              <tbody>
                <tr>
                  <th>예약 ID</th>
                  <td>{detail.rsvId}</td>
                </tr>
                <tr>
                  <th>예약 일시</th>
                  <td>
                    {detail.rsvDt} {detail.rsvTime?.substring(0, 5)}
                  </td>
                </tr>
                <tr>
                  <th>등록 일시</th>
                  <td>{detail.regDt?.replace("T", " ").substring(0, 16)}</td>
                </tr>
                <tr>
                  <th>최종 변경</th>
                  <td>
                    {detail.updDt?.replace("T", " ").substring(0, 16)} (
                    {detail.updId || "System"})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;
