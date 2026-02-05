import React, { useEffect, useState } from "react";
import api from "../../api";   // ⚠️ 실제 경로에 맞게 조정하세요

function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  const [category, setCategory] = useState("이용안내");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categoryList = ["이용안내", "결제/환불", "시설이용", "기타"];

  // localstraoge에서, role 확인
  const role = localStorage.getItem("role");

  /* =========================
     FAQ 목록 조회
  ========================= */
  useEffect(() => {
    fetchFaqs();
  }, [page]);

  const fetchFaqs = async () => {
    const res = await api.get("/admin/faq", {
      params: { page }
    });

    setFaqs(res.data.list);
    setTotalPages(res.data.totalPages);
  };

  /* =========================
     FAQ 등록 / 수정
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      category,
      title: question,
      content: answer,
      isvisible: true,
      postVisible: true
    };



    if (editingId) {
      await api.put(`/admin/faq/${editingId}`, data);
    } else {
      await api.post("/admin/faq", data);
    }

    resetForm();
    fetchFaqs();
  };

  const resetForm = () => {
    setCategory("이용안내");
    setQuestion("");
    setAnswer("");
    setEditingId(null);
  };

  /* =========================
     수정
  ========================= */
  const editFaq = (f) => {
    setEditingId(f.postId);
    setCategory(f.category);
    setQuestion(f.title);
    setAnswer(f.content);
    setOpenId(null);
  };

  /* =========================
     삭제
  ========================= */
  const deleteFaq = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await api.delete(`/admin/faq/${id}`);
    fetchFaqs();
  };

  /* =========================
     노출 / 숨김
  ========================= */
  const toggleVisible = async (f) => {
    const message = f.isVisible
      ? "게시글을 숨김 처리하시겠습니까?"
      : "게시글을 다시 노출하시겠습니까?";

    if (!window.confirm(message)) return;

    await api.put(`/admin/faq/${f.postId}/visible`, null, {
      params: { visible: !f.isVisible }
    });

    fetchFaqs();
  };


  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // ROLE 권한 체크해서, 출력하는 문
  if (["TEACHER", "MANAGER"].includes(role)) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>권한이 없습니다.</h2>
        <p style={{ marginTop: "10px", color: "#666" }}>
          해당 페이지에 접근할 수 있는 권한이 없습니다.
        </p>
      </div>
    );
  }



  return (
    <>
      <h1>FAQ 관리</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>카테고리</th>
            <th>질문</th>
            <th>노출</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((f) => (
            <React.Fragment key={f.postId}>
              <tr style={{ opacity: f.isVisible ? 1 : 0.4 }}>
                <td>{f.postId}</td>
                <td>{f.category}</td>
                <td
                  onClick={() => toggleOpen(f.postId)}
                  style={{ cursor: "pointer", fontWeight: "600" }}
                >
                  {f.title}
                </td>
                <td>{f.isVisible ? "노출" : "숨김"}</td>
                <td>
                  <span style={{ display: "inline-flex", gap: "px" }}>
                    <button onClick={() => editFaq(f)}>수정</button>
                    <button onClick={() => toggleVisible(f)}>
                      {f.isVisible ? "숨기기" : "보이기"}
                    </button>
                    <button
                      onClick={() => deleteFaq(f.postId)}
                      style={{ color: "red" }}
                    >
                      삭제
                    </button>
                  </span>
                </td>
              </tr>


              {openId === f.postId && (
                <tr>
                  <td colSpan="5" style={{ background: "#f8f8f8", padding: "15px" }}>
                    <strong>답변</strong>
                    <div style={{
                      marginTop: "10px", whiteSpace: "pre-line",
                      lineHeight: "1.6"
                    }}>{f.content}</div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div style={{ marginTop: "20px" }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ◀
        </button>
        <span style={{ margin: "0 10px" }}>
          {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          ▶
        </button>
      </div>

      {/* 등록 / 수정 */}
      <h2 style={{ marginTop: "30px" }}>
        {editingId ? "FAQ 수정" : "FAQ 등록"}
      </h2>

      {/* 등록 / 수정 */}
      <h2 style={{ marginTop: "30px" }}>
        {editingId ? "FAQ 수정" : "FAQ 등록"}
      </h2>

      <form onSubmit={handleSubmit} className="faq-form">
        <div className="faq-form-row">
          <label>카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryList.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="faq-form-row">
          <label>질문</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="faq-form-row">
          <label>답변</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          {editingId ? "수정완료" : "등록"}
        </button>


        <style>{`
                  .faq-form {
                    margin-top: 20px;
                    padding: 24px;
                    background: #fafafa;
                    border-radius: 8px;
                    width: 700px;
                  }

                  .faq-form-row {
                    margin-bottom: 20px;
                  }

                  .faq-form label {
                    display: block;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 6px;
                  }

                  .faq-form select,
                  .faq-form input,
                  .faq-form textarea {
                    width: 600px;
                    font-size: 14px;
                    padding: 10px 12px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    box-sizing: border-box;
                  }

                  .faq-form select,
                  .faq-form input {
                    height: 42px;
                  }

                  .faq-form textarea {
                    height: 200px;
                    resize: vertical;
                  }

                  .faq-form button {
                    margin-top: 10px;
                    padding: 10px 22px;
                    font-size: 14px;
                    cursor: pointer;
                  }
  `}</style>
      </form>

    </>
  );
}

export default AdminFaqPage;
