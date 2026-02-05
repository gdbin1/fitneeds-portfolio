import React, { useState, useEffect, useCallback } from "react";
import marketApi from "../../api/marketApi";
import MarketPostDetailModal from "./MarketPostDetailModal";
import "../../styles/erp-common.css";

const AdminMarketPostPage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  });
  const [searchDto, setSearchDto] = useState({
    sellerId: "",
    status: "",
    keyword: "",
    "paging.page": 1,
    "paging.size": 10,
  });

  const fetchPosts = useCallback(
    async (params = searchDto) => {
      try {
        const res = await marketApi.getPosts(params);
        const data = res.data;

        if (data?.content) {
          setPosts(data.content);
          setPageInfo({
            currentPage: data.currentPage ?? params["paging.page"] ?? 1,
            totalPages: data.totalPages ?? 1,
            totalElements: data.totalElements ?? data.content.length ?? 0,
            size: data.size ?? params["paging.size"] ?? 10,
          });
        } else {
          const list = Array.isArray(data) ? data : [];
          setPosts(list);
          setPageInfo((prev) => ({
            ...prev,
            currentPage: params["paging.page"] ?? 1,
            totalPages: data?.totalPages ?? 1,
            totalElements: data?.totalElements ?? list.length,
            size: params["paging.size"] ?? prev.size ?? 10,
          }));
        }
      } catch (err) {
        alert(
          "게시글 목록 조회 실패: " +
            (err.response?.data?.message || err.message)
        );
      }
    },
    [searchDto]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(searchDto);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchDto, fetchPosts]);

  const handleSearch = () => {
    const params = { ...searchDto, "paging.page": 1 };
    setSearchDto(params);
    fetchPosts(params);
  };

  const handleReset = () => {
    const reset = {
      sellerId: "",
      status: "",
      keyword: "",
      "paging.page": 1,
      "paging.size": 10,
    };
    setSearchDto(reset);
    fetchPosts(reset);
  };

  const handlePageChange = (newPage) => {
    setSearchDto((prev) => ({ ...prev, "paging.page": newPage }));
  };

  return (
    <div className="erp-container">
      <div className="stat-bar">
        <h2>🛒 이용권 거래 게시글 관리</h2>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div className="input-group">
            <label>판매자 ID</label>
            <input
              type="text"
              value={searchDto.sellerId}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  sellerId: e.target.value,
                  "paging.page": 1,
                }))
              }
            />
          </div>
          <div className="input-group">
            <label>상태</label>
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
              <option value="">전체</option>
              <option value="ON_SALE">판매중</option>
              <option value="SOLD_OUT">판매완료</option>
            </select>
          </div>
          <div className="input-group">
            <label>검색어</label>
            <input
              type="text"
              value={searchDto.keyword}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  keyword: e.target.value,
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
              <th>판매자</th>
              <th>종목</th>
              <th>제목</th>
              <th>판매금액</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId}>
                <td>{post.postId}</td>
                <td>{post.sellerId}</td>
                <td>{post.sportName}</td>
                <td style={{ textAlign: "left" }}>{post.title}</td>
                <td>{post.saleAmt?.toLocaleString()}원</td>
                <td>
                  <StatusBadge status={post.statusCode} />
                </td>
                <td>
                  <button
                    className="detail-btn"
                    onClick={() => setSelectedPostId(post.postId)}
                  >
                    상세/수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageInfo.totalPages > 0 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(1)}
            disabled={pageInfo.currentPage <= 1}
          >
            처음
          </button>
          <button
            className="page-btn"
            onClick={() =>
              handlePageChange(Math.max(1, pageInfo.currentPage - 1))
            }
            disabled={pageInfo.currentPage <= 1}
          >
            이전
          </button>
          <span className="page-info">
            {pageInfo.currentPage} / {pageInfo.totalPages} (총{" "}
            {pageInfo.totalElements}건)
          </span>
          <button
            className="page-btn"
            onClick={() =>
              handlePageChange(
                Math.min(pageInfo.totalPages, pageInfo.currentPage + 1)
              )
            }
            disabled={pageInfo.currentPage >= pageInfo.totalPages}
          >
            다음
          </button>
          <button
            className="page-btn"
            onClick={() => handlePageChange(pageInfo.totalPages)}
            disabled={pageInfo.currentPage >= pageInfo.totalPages}
          >
            마지막
          </button>
        </div>
      )}

      {selectedPostId && (
        <MarketPostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onRefresh={() => fetchPosts(searchDto)}
        />
      )}
    </div>
  );
};

// 상태 배지 컴포넌트
const StatusBadge = ({ status }) => {
  const config = {
    ON_SALE: { bg: "#e6f4ea", text: "#1e7e34", label: "판매중" },
    SOLD_OUT: { bg: "#fce8e6", text: "#c92a2a", label: "판매완료" },
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

export default AdminMarketPostPage;
