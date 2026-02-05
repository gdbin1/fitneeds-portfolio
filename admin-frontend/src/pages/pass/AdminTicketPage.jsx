import React, { useState, useEffect, useCallback } from "react";
import passApi from "../../api/passApi";
import PassCreateModal from "./PassCreateModal";
import PassDetailModal from "./PassDetailSection";
import "../../styles/erp-common.css";

const AdminTicketPage = () => {
  const [selectedPassId, setSelectedPassId] = useState(null);
  const [passes, setPasses] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10,
  });
  const [searchDto, setSearchDto] = useState({
    username: "",
    sportName: "",
    status: "",
    "paging.page": 1,
    "paging.size": 10,
  });
  const [sports, setSports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPasses = useCallback(
    async (params = searchDto) => {
      try {
        console.log("🔍 fetchPasses 함수 호출, 조건:", params);
        const res = await passApi.getPasses(params);
        console.log("✅ API 응답 전체:", res);
        console.log("✅ res.data.content:", res.data.content);
        console.log("📊 응답 페이징 정보:", {
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
          currentPage: res.data.currentPage,
          size: res.data.size,
        });

        // PagedResponse 구조 처리
        if (res.data && res.data.content && Array.isArray(res.data.content)) {
          console.log("✅ content 배열 감지, 길이:", res.data.content.length);
          setPasses(res.data.content);
          console.log("💾 setPasses 호출됨");
          setPageInfo({
            totalElements: res.data.totalElements || 0,
            totalPages: res.data.totalPages || 0,
            currentPage: res.data.currentPage || 0,
            size: res.data.size || 10,
          });
          console.log("💾 setPageInfo 호출됨");
        } else if (Array.isArray(res.data)) {
          setPasses(res.data);
        } else {
          console.error("❌ 예상치 못한 응답:", res.data);
          setPasses([]);
        }
      } catch (err) {
        console.error("❌ 목록 조회 실패:", err);
        alert(
          "이용권 목록 조회에 실패했습니다: " +
            (err.response?.data?.message || err.message)
        );
      }
    },
    [searchDto]
  );

  // 검색 조건 변경 시 자동 조회 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPasses(searchDto);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchDto, fetchPasses]);

  const handleSearch = () => {
    console.log("🔍 검색 버튼 클릭");
    const next = { ...searchDto, "paging.page": 1 };
    setSearchDto(next);
    fetchPasses(next);
  };

  const handleReset = () => {
    const reset = {
      username: "",
      sportName: "",
      status: "",
      "paging.page": 1,
      "paging.size": 10,
    };
    setSearchDto(reset);
    fetchPasses(reset);
  };

  const handlePageChange = (newPage) => {
    console.log("📄 페이지 변경:", newPage);
    setSearchDto((prev) => ({
      ...prev,
      "paging.page": newPage,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await passApi.getActiveSports();
        setSports(res.data || []);
      } catch (err) {
        console.error("스포츠 목록 로드 실패:", err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="erp-container">
      {/* 상단 바 */}
      <div className="stat-bar">
        <h2>🎟️ 회원 이용권 관리</h2>
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          + 수동 등록
        </button>
      </div>

      {/* 검색 필터 영역 */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="input-group">
            <label>스포츠 종목</label>
            <select
              value={searchDto.sportName}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  sportName: e.target.value,
                  "paging.page": 1,
                }))
              }
            >
              <option value="">전체 종목</option>
              {sports.map((s) => (
                <option key={s.sportId} value={s.sportNm}>
                  {s.sportNm}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>이용권 상태</label>
            <select
              value={searchDto.status}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  status: e.target.value,
                  "paging.page": 1,
                }))
              }
            >
              <option value="">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="STOP">정지</option>
              <option value="DELETED">삭제</option>
            </select>
          </div>

          <div className="input-group">
            <label>회원명</label>
            <input
              type="text"
              placeholder="회원 이름 입력"
              value={searchDto.username}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  username: e.target.value,
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

      {/* 데이터 테이블 */}
      <div className="table-card">
        <table className="erp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>회원명</th>
              <th>스포츠</th>
              <th>잔여 횟수</th>
              <th>상태</th>
              <th>등록일</th>
              <th>최종 변동일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {passes.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  조회된 이용권이 없습니다.
                </td>
              </tr>
            ) : (
              passes.map((pass) => {
                console.log("📋 테이블 렌더링 - Pass 데이터:", pass);
                return (
                <tr key={pass.passId}>
                  <td>{pass.passId}</td>
                  <td>
                    <strong>{pass.userName}</strong>
                  </td>
                  <td>{pass.sportName}</td>
                  <td style={{ color: "#0056b3", fontWeight: "bold" }}>
                    {pass.remainingCount}회
                  </td>
                  <td>
                    <StatusBadge status={pass.passStatusCode} />
                  </td>
                  <td>{pass.regDt?.substring(0, 10)}</td>
                  <td style={{ fontSize: "12px", color: "#666" }}>
                    {pass.lastChgDt
                      ? pass.lastChgDt.substring(0, 16).replace('T', ' ')
                      : pass.regDt?.substring(0, 16).replace('T', ' ')}
                  </td>
                  <td>
                    <button
                      className="detail-btn"
                      onClick={() => {
                        console.log("🔗 상세 조회 클릭 - passId:", pass.passId);
                        setSelectedPassId(pass.passId);
                      }}
                    >
                      상세/수정
                    </button>
                  </td>
                </tr>
              );
              })
            )}
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

      {/* 상세 보기 및 수정 */}
      {selectedPassId && (
        <PassDetailModal
          passId={selectedPassId}
          onClose={() => setSelectedPassId(null)}
          onRefresh={() => fetchPasses(searchDto)}
        />
      )}

      {/* 수동 등록 모달 */}
      {isModalOpen && (
        <PassCreateModal
          sports={sports}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchPasses(searchDto)}
        />
      )}
    </div>
  );
};

// 상태 배지 컴포넌트
const StatusBadge = ({ status }) => {
  const statusConfig = {
    ACTIVE: { bg: "#e6f4ea", text: "#1e7e34", label: "활성" },
    STOP: { bg: "#feefe3", text: "#d9480f", label: "정지" },
    DELETED: { bg: "#fce8e6", text: "#c92a2a", label: "삭제" },
  };
  const config = statusConfig[status] || {
    bg: "#f1f3f5",
    text: "#495057",
    label: status,
  };
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
};

export default AdminTicketPage;
