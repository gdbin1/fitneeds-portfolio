import React, { useState, useEffect, useCallback } from "react";
import productApi from "../../api/productApi";
import passApi from "../../api/passApi";
import PassProductCreateModal from "./PassProductCreateModal";
import PassProductDetailModal from "./PassProductDetailModal";
import "../../styles/erp-common.css";

const AdminPassProductPage = () => {
  const [selectedProdId, setSelectedProdId] = useState(null);
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10,
  });
  const [searchDto, setSearchDto] = useState({
    sportName: "",
    useYn: "",
    prodNm: "",
    "paging.page": 1,
    "paging.size": 10,
  });
  const [sports, setSports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = useCallback(
    async (params = searchDto) => {
      try {
        const res = await productApi.getProducts(params);
        
        if (res.data && res.data.content && Array.isArray(res.data.content)) {
          setProducts(res.data.content);
          setPageInfo({
            totalElements: res.data.totalElements || 0,
            totalPages: res.data.totalPages || 0,
            currentPage: res.data.currentPage || 0,
            size: res.data.size || 10,
          });
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          console.error("예상치 못한 응답:", res.data);
          setProducts([]);
        }
      } catch (err) {
        console.error("목록 조회 실패:", err);
        alert(
          "상품 목록 조회에 실패했습니다: " +
            (err.response?.data?.message || err.message)
        );
      }
    },
    [searchDto]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchDto);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchDto, fetchProducts]);

  const handleSearch = () => {
    const next = { ...searchDto, "paging.page": 1 };
    setSearchDto(next);
    fetchProducts(next);
  };

  const handleReset = () => {
    const reset = {
      sportName: "",
      useYn: "",
      prodNm: "",
      "paging.page": 1,
      "paging.size": 10,
    };
    setSearchDto(reset);
    fetchProducts(reset);
  };

  const handlePageChange = (newPage) => {
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
      <div className="stat-bar">
        <h2>🎫 이용권 상품 관리</h2>
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          + 상품 등록
        </button>
      </div>

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
            <label>판매 상태</label>
            <select
              value={searchDto.useYn}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  useYn: e.target.value,
                  "paging.page": 1,
                }))
              }
            >
              <option value="">전체 상태</option>
              <option value="true">판매중</option>
              <option value="false">판매중지</option>
            </select>
          </div>

          <div className="input-group">
            <label>상품명</label>
            <input
              type="text"
              placeholder="상품명 입력"
              value={searchDto.prodNm}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  prodNm: e.target.value,
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
              <th>스포츠 종목</th>
              <th>상품명</th>
              <th>가격</th>
              <th>제공 횟수</th>
              <th>판매 상태</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  조회된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.prodId}>
                  <td>{product.prodId}</td>
                  <td>{product.sportName}</td>
                  <td>
                    <strong>{product.prodNm}</strong>
                  </td>
                  <td style={{ color: "#0056b3", fontWeight: "bold" }}>
                    {product.prodAmt?.toLocaleString()}원
                  </td>
                  <td>{product.prvCnt}회</td>
                  <td>
                    <StatusBadge useYn={product.useYn} />
                  </td>
                  <td>{product.regDt?.substring(0, 10)}</td>
                  <td>
                    <button
                      className="detail-btn"
                      onClick={() => setSelectedProdId(product.prodId)}
                    >
                      상세/수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {selectedProdId && (
        <PassProductDetailModal
          prodId={selectedProdId}
          onClose={() => setSelectedProdId(null)}
          onRefresh={() => fetchProducts(searchDto)}
        />
      )}

      {isModalOpen && (
        <PassProductCreateModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchProducts(searchDto)}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ useYn }) => {
  const statusConfig = {
    true: { bg: "#e6f4ea", text: "#1e7e34", label: "판매중" },
    false: { bg: "#feefe3", text: "#d9480f", label: "판매중지" },
  };
  const config = statusConfig[useYn] || {
    bg: "#f1f3f5",
    text: "#495057",
    label: "알 수 없음",
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

export default AdminPassProductPage;
