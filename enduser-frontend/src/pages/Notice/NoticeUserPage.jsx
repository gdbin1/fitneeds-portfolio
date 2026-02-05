import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import CommunitySidebar from "../Community/CommunitySidebar";
import "./Notice.css";

function formatDateYmd(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(dateStr).slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatDateYmdHm(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(dateStr);
  const ymd = formatDateYmd(dateStr);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${ymd} ${hh}:${mm}`;
}

function NoticeUserPage() {
  const [notices, setNotices] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ✅ 프론트 페이징
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const params = useMemo(() => {
    const p = {};
    if (keyword?.trim()) p.keyword = keyword.trim();
    return p;
  }, [keyword]);

  const fetchNotices = async () => {
    setLoadingList(true);
    try {
      const res = await api.get("/user/notice", { params });

      // 🔥 isPinned 안전 매핑
      const mapped = (res.data || []).map((n) => ({
        ...n,
        isPinned: Boolean(n.isPinned),
      }));

      setNotices(mapped);
      setPage(1);
    } catch {
      alert("공지사항 목록 조회 실패");
      setNotices([]);
    } finally {
      setLoadingList(false);
    }
  };

  const openNotice = async (postId) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/user/notice/${postId}`);
      setDetail(res.data);
    } catch {
      alert("공지 상세 조회 실패");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closePopup = () => setDetail(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  // ✅ 페이징 계산
  const totalPages = Math.ceil(notices.length / PAGE_SIZE);
  const pagedNotices = notices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="community-layout">
      <CommunitySidebar />
      <div className="notice-wrap notice-faq-only">
        {/* 상단 타이틀 */}


        <section className="notice-list-section">
          <div className="section-container">
            <div className="notice-page-header">
              <h1 className="page-title">공지사항</h1>
              <p className="page-subtitle">
                더 나은 운동 경험을 위해 준비한,
                <span className="brand-highlight"> FITNEEDS</span>의
                중요한 소식과 지점별 안내를 전해드립니다.
              </p>
            </div>
            {loadingList && <div className="faq-empty">로딩 중...</div>}

            {!loadingList && pagedNotices.length === 0 && (
              <div className="faq-empty">등록된 공지사항이 없습니다.</div>
            )}

            {!loadingList && pagedNotices.length > 0 && (
              <div className="notice-table-wrap">
                <table className="notice-table">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>지점</th>
                      <th>공지 제목</th>
                      <th>게시일</th>
                      <th>종료일</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedNotices.map((n, idx) => {
                      const number =
                        notices.length - ((page - 1) * PAGE_SIZE + idx);

                      return (
                        <tr
                          key={n.postId}
                          className="notice-row"
                          onClick={() => openNotice(n.postId)}
                        >
                          <td>{number}</td>

                          <td>
                            <span
                              className={`category-badge ${n.branchName == null || n.branchName === ""
                                ? "notice-branch-all"
                                : "notice-branch-normal"
                                }`}
                            >
                              {n.branchName == null || n.branchName === ""
                                ? "전체 공지"
                                : n.branchName}
                            </span>
                          </td>

                          <td className="notice-td-title">
                            {/* {n.title} */}
                            {n.isPinned && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginRight: "8px",
                                  padding: "3px 8px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "#9a6a00",
                                  // background: "#fff3c4",
                                  // border: "1px solid #ffd54f",
                                  borderRadius: "12px",
                                  verticalAlign: "middle",
                                  lineHeight: "1"
                                }}
                              >
                                📌
                              </span>
                            )}
                            {n.title}

                          </td>

                          <td>
                            {n.createdAt
                              ? String(n.createdAt).substring(0, 10)
                              : ""}
                          </td>

                          <td>
                            {n.displayEnd && n.displayEnd !== "" ? (
                              <span className="notice-end-date deadline">
                                {String(n.displayEnd).substring(0, 10)}
                              </span>
                            ) : (
                              <span className="notice-end-date always">
                                상시 게시글
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 페이징 */}
          <div className="community-pagination notice-pagination-faq">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={page === pageNum ? "active" : ""}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              다음
            </button>
          </div>
        </section>
      </div>

      {/* 상세 팝업 */}
      {detail && (
        <div className="notice-modal-overlay" onClick={closePopup}>
          <div className="notice-modal-stage" onClick={(e) => e.stopPropagation()}>
            <div className="notice-modal">
              <button className="notice-modal-close" onClick={closePopup}>
                ×
              </button>

              <div className="notice-modal-title">{detail.title}</div>

              <div className="notice-modal-meta">
                <span>등록일 {formatDateYmdHm(detail.createdAt)}</span>
                <span>조회수 {detail.views ?? 0}</span>
              </div>

              <div className="notice-modal-content">
                <div className="notice-content-box">{detail.content}</div>
              </div>

              <div className="notice-modal-actions">
                <button className="notice-ok-btn" onClick={closePopup}>
                  확인
                </button>
              </div>

              {loadingDetail && (
                <div className="notice-loading-mask">로딩 중...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeUserPage;
