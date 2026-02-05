// PassTradeFaq.jsx
import React, { useEffect, useState } from 'react';
import { mockFaqs } from './mockFaqs'; // 🔥 FAQ는 아직 mock 데이터 유지
import './PassTradeFaq.css';
import PassTradeQna from './PassTradeQna';

const PassTradeFaq = () => {
  // 전체 FAQ 데이터
  const [faqs, setFaqs] = useState([]);
  // 카테고리 필터링된 FAQ
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  // 카테고리 목록
  const [categories, setCategories] = useState([]);
  // 선택된 카테고리
  const [selectedCategory, setSelectedCategory] = useState('all');

  /* =========================
     FAQ 데이터 로드 (mock)
     ========================= */
  const fetchFaqs = async () => {
    // ❗ 추후 API로 교체 예정
    const data = mockFaqs;

    setFaqs(data);
    setFilteredFaqs(data);

    // 카테고리 목록 추출
    const cats = [...new Set(data.map((faq) => faq.category))];
    setCategories(cats);
  };

  // 최초 1회 로드
  useEffect(() => {
    fetchFaqs();
  }, []);

  // 카테고리 변경 시 필터링
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredFaqs(faqs);
    } else {
      setFilteredFaqs(
        faqs.filter((faq) => faq.category === selectedCategory)
      );
    }
  }, [selectedCategory, faqs]);

  return (
    <div className="pass-trade-faq">
      {/* =========================
          FAQ 영역 (읽기 전용)
         ========================= */}
      <div className="faq-section">
        <h1>이용권 FAQ</h1>

        {/* 카테고리 필터 */}
        <div className="category-filter">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? 'active' : ''}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ 아코디언 */}
      <div className="accordion" id="faqAccordion">
        {filteredFaqs.map((faq, index) => (
          <div key={faq.id} className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
              >
                {faq.question}
              </button>
            </h2>

            <div
              id={`collapse${index}`}
              className="accordion-collapse collapse"
            >
              <div className="accordion-body">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          🔥 QnA 영역 연결
         ========================= */}
      <PassTradeQna />
    </div>
  );
};

export default PassTradeFaq;
