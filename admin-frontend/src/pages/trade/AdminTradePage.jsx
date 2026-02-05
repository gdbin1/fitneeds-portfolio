import React, { useState, useEffect, useCallback } from "react";
import marketApi from "../../api/marketApi";
import MarketTradeDetailModal from "./MarketTradeDetailModal";
import "../../styles/erp-common.css";

const AdminTradePage = () => {
  const [trades, setTrades] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  });
  const [searchDto, setSearchDto] = useState({
    buyerId: "",
    sellerId: "",
    status: "",
    "paging.page": 1,
    "paging.size": 10,
  });
  const [selectedTradeId, setSelectedTradeId] = useState(null);

  const fetchTrades = useCallback(
    async (params = searchDto) => {
      try {
        const res = await marketApi.getTrades(params);
        const data = res.data;
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];

        setTrades(list);
        setPageInfo({
          currentPage: data?.currentPage ?? params["paging.page"] ?? 1,
          totalPages: data?.totalPages ?? 1,
          totalElements: data?.totalElements ?? list.length,
          size: data?.size ?? params["paging.size"] ?? 10,
        });
      } catch (err) {
        console.error("거래 내역 로드 실패", err);
      }
    },
    [searchDto]
  );

  const handlePageChange = (newPage) => {
    setSearchDto((prev) => ({ ...prev, "paging.page": newPage }));
  };

  const handleSearch = () => {
    const next = { ...searchDto, "paging.page": 1 };
    setSearchDto(next);
  };

  const handleReset = () => {
    const reset = {
      buyerId: "",
      sellerId: "",
      status: "",
      "paging.page": 1,
      "paging.size": 10,
    };
    setSearchDto(reset);
  };

  useEffect(() => {
    fetchTrades(searchDto);
  }, [searchDto, fetchTrades]);

  return (
    <div className="erp-container">
      <div className="stat-bar">
        <h2>🤝 거래 내역 관리</h2>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div className="input-group">
            <label>구매자 ID</label>
            <input
              type="text"
              value={searchDto.buyerId}
              onChange={(e) =>
                setSearchDto((prev) => ({
                  ...prev,
                  buyerId: e.target.value,
                  "paging.page": 1,
                }))
              }
              placeholder="구매자 아이디"
            />
          </div>
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
              placeholder="판매자 아이디"
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
              <option value="PENDING">대기</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELED">취소</option>
            </select>
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
              <th>거래ID</th>
              <th>스포츠</th>
              <th>구매자</th>
              <th>판매자</th>
              <th>금액</th>
              <th>수량</th>
              <th>상태</th>
              <th>거래일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.tradeId}>
                <td>{t.tradeId}</td>
                <td>{t.sportName}</td>
                <td>{t.buyerId}</td>
                <td>{t.sellerId}</td>
                <td>{t.tradeAmt?.toLocaleString()}원</td>
                <td>{t.buyQty}회</td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "600",
                      backgroundColor:
                        t.sttsCd === "PENDING"
                          ? "#FFF3CD"
                          : t.sttsCd === "COMPLETED"
                          ? "#D1E7DD"
                          : t.sttsCd === "CANCELED"
                          ? "#F8D7DA"
                          : "#E9ECEF",
                      color:
                        t.sttsCd === "PENDING"
                          ? "#997404"
                          : t.sttsCd === "COMPLETED"
                          ? "#0F5132"
                          : t.sttsCd === "CANCELED"
                          ? "#842029"
                          : "#495057",
                    }}
                  >
                    {t.sttsCd === "PENDING"
                      ? "대기"
                      : t.sttsCd === "COMPLETED"
                      ? "완료"
                      : t.sttsCd === "CANCELED"
                      ? "취소"
                      : t.sttsCd}
                  </span>
                </td>
                <td>{t.regDt?.substring(0, 16).replace("T", " ")}</td>
                <td>
                  <button
                    className="detail-btn"
                    onClick={() => setSelectedTradeId(t.tradeId)}
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
            {pageInfo.currentPage} / {pageInfo.totalPages} 페이지 (총{" "}
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

      {selectedTradeId && (
        <MarketTradeDetailModal
          tradeId={selectedTradeId}
          onClose={() => setSelectedTradeId(null)}
          onRefresh={() => fetchTrades(searchDto)}
        />
      )}
    </div>
  );
};

export default AdminTradePage;
