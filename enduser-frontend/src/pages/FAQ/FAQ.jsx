import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import api from "../../api";
import CommunitySidebar from "../Community/CommunitySidebar";
import "./FAQ.css";

function FAQ() {
  const [expandedItems, setExpandedItems] = useState({});
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const toggleItem = (postId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const res = await api.get("/user/faq");
        setFaqList(res.data || []);
        setPage(1);
      } catch {
        setFaqList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, []);

  const totalPages = Math.ceil(faqList.length / PAGE_SIZE);
  const pagedFaqs = faqList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Helmet>
        <title>FAQ - FITNEEDS</title>
      </Helmet>

      <div className="community-layout">
        <CommunitySidebar />
        <div className="faq-wrap notice-faq-only">
          {/* =========================
              타이틀 (공지사항과 동일)
             ========================= */}


          {/* =========================
            FAQ 리스트 (Grid 유지)
           ========================= */}
          <section className="faq-list-section">
            <div className="section-container">
              <div className="faq-page-header">
                <h1 className="page-title">FAQ</h1>
                <p className="page-subtitle">
                  당신의 운동이 더 합리적일 수 있도록,
                  <span className="brand-highlight"> FITNEEDS</span>가
                  자주 묻는 질문에 답합니다.
                </p>
              </div>
              <div className="faq-board">
                <div className="faq-header">
                  <span>번호</span>
                  <span>카테고리</span>
                  <span>질문</span>
                  <span>작성일</span>
                </div>

                {loading && <div className="faq-empty">로딩 중...</div>}

                {!loading && pagedFaqs.length === 0 && (
                  <div className="faq-empty">등록된 FAQ가 없습니다.</div>
                )}

                {!loading &&
                  pagedFaqs.map((item, index) => {
                    const isOpen = expandedItems[item.postId];
                    const number =
                      faqList.length - ((page - 1) * PAGE_SIZE + index);

                    return (
                      <div
                        key={item.postId}
                        className={`faq-item ${isOpen ? "open" : ""}`}
                      >
                        <div
                          className="faq-question"
                          onClick={() => toggleItem(item.postId)}
                        >
                          <div className="faq-number">{number}</div>

                          <div className="faq-category">
                            <span className="category-badge">
                              {item.category}
                            </span>
                          </div>

                          <div className="faq-title">
                            <strong>Q.</strong> {item.title}
                          </div>

                          <div className="faq-date">
                            {item.createdAt?.substring(0, 10)}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="faq-answer">
                            <strong>A.</strong>
                            <p>{item.content}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* =========================
              페이징 (공지와 동일)
             ========================= */}
            <div className="community-pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={p === page ? "active" : ""}
                    onClick={() => setPage(p)}
                  >
                    {p}
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
      </div>
    </>
  );
}

export default FAQ;
