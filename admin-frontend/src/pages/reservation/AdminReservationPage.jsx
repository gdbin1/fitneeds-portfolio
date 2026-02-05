import React, { useState, useEffect, useCallback } from "react";
import reservationApi from "../../api/reservationApi";
import ReservationCreateModal from "./ReservationCreateModal";
import ReservationDetailModal from "./ReservationDetailModal";
import "../../styles/erp-common.css";

const AdminReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRsvId, setSelectedRsvId] = useState(null);
  const [searchDto, setSearchDto] = useState({
    memberName: "",
    sttsCd: "",
    startDate: "",
    "paging.page": 1, // 백엔드 중첩 Record 매핑용
    "paging.size": 10,
  });

  const fetchReservations = useCallback(
    async (params = searchDto) => {
      try {
        const res = await reservationApi.getReservations(params);
        setReservations(res.data.content || []);
        setPageInfo({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements,
        });
      } catch (err) {
        console.error("예약 목록 로드 실패:", err);
      }
    },
    [searchDto]
  );

  // 검색 조건 변경 시 즉시(디바운스) 조회
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReservations(searchDto);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchDto, fetchReservations]);

  // 페이지 변경 처리
  const handlePageChange = (newPage) => {
    setSearchDto((prev) => ({ ...prev, "paging.page": newPage }));
  };

  const handleSearch = () => {
    const next = { ...searchDto, "paging.page": 1 };
    setSearchDto(next);
    fetchReservations(next);
  };

  const handleReset = () => {
    const reset = {
      memberName: "",
      sttsCd: "",
      startDate: "",
      "paging.page": 1,
      "paging.size": 10,
    };
    setSearchDto(reset);
    fetchReservations(reset);
  };

  return (
    <div className="erp-container">
      <div className="stat-bar">
        <h2>📅 예약 현황 관리</h2>
        <button className="create-btn" onClick={() => setIsCreateOpen(true)}>
          + 예약 수동 등록
        </button>
      </div>

      {/* 검색 필터: ReservationSearchRequest 필드 매핑 */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="input-group">
            <label>예약 상태</label>
            <select
              value={searchDto.sttsCd}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  sttsCd: e.target.value,
                  "paging.page": 1,
                }))
              }
            >
              <option value="">전체</option>
              <option value="ACTIVE">예약완료</option>
              <option value="CANCELED">취소됨</option>
            </select>
          </div>
          <div className="input-group">
            <label>시작일</label>
            <input
              type="date"
              value={searchDto.startDate}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                  "paging.page": 1,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label>회원명</label>
            <input
              type="text"
              placeholder="회원명 입력"
              value={searchDto.memberName}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  memberName: e.target.value,
                  "paging.page": 1,
                }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <button className="search-btn" onClick={handleSearch}>
              🔍 검색
            </button>
            <button className="ghost-btn" onClick={handleReset}>
              ↺ 초기화
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <table className="erp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>지점명</th>
              <th>회원명</th>
              <th>종목</th>
              <th>예약일시</th>
              <th>상태</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((rsv) => (
              <tr key={rsv.rsvId}>
                <td>{rsv.rsvId}</td>
                <td>{rsv.branchName}</td>
                <td>
                  <strong>{rsv.memberName}</strong>
                </td>
                <td>{rsv.sportName}</td>
                <td>
                  {rsv.rsvDt} {rsv.rsvTime?.substring(0, 5)}
                </td>
                <td>
                  <StatusBadge status={rsv.sttsCd} />
                </td>
                <td>{rsv.regDt?.substring(0, 10)}</td>
                <td>
                  <button
                    className="detail-btn"
                    onClick={() => setSelectedRsvId(rsv.rsvId)}
                  >
                    상세/수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pageInfo.totalPages > 0 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pageInfo.currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            처음
          </button>
          <button
            className="page-btn"
            disabled={pageInfo.currentPage === 1}
            onClick={() => handlePageChange(pageInfo.currentPage - 1)}
          >
            이전
          </button>
          <span className="page-info">
            {pageInfo.currentPage} / {pageInfo.totalPages} 페이지 (총{" "}
            {pageInfo.totalElements}건)
          </span>
          <button
            className="page-btn"
            disabled={pageInfo.currentPage >= pageInfo.totalPages}
            onClick={() => handlePageChange(pageInfo.currentPage + 1)}
          >
            다음
          </button>
          <button
            className="page-btn"
            disabled={pageInfo.currentPage >= pageInfo.totalPages}
            onClick={() => handlePageChange(pageInfo.totalPages)}
          >
            마지막
          </button>
        </div>
      )}

      {/* 수동 등록 모달 */}
      {isCreateOpen && (
        <ReservationCreateModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => fetchReservations(searchDto)}
        />
      )}

      {/* 상세/수정 모달 */}
      {selectedRsvId && (
        <ReservationDetailModal
          rsvId={selectedRsvId}
          onClose={() => setSelectedRsvId(null)}
          onRefresh={() => fetchReservations(searchDto)}
        />
      )}
    </div>
  );
};

// 예약 상태 배지 컴포넌트
const StatusBadge = ({ status }) => {
  const config = {
    RESERVED: { bg: "#e6f4ea", text: "#1e7e34", label: "예약완료" },
    CANCELED: { bg: "#fce8e6", text: "#c92a2a", label: "취소" },
    // PENDING: { bg: "#fff4e6", text: "#d9480f", label: "대기" },
    COMPLETED: { bg: "#e7f5ff", text: "#1c7ed6", label: "이용완료" },
    NOSHOW: { bg: "#ffe3e3", text: "#c92a2a", label: "노쇼" },
  };
  const s = config[status] || {
    bg: "#f1f3f5",
    text: "#495057",
    label: "알수없음",
  };
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        backgroundColor: s.bg,
        color: s.text,
      }}
    >
      {s.label}
    </span>
  );
};

export default AdminReservationPage;
