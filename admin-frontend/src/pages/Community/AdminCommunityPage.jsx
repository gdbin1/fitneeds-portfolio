import React, { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

function AdminCommunityPage() {
  const [posts, setPosts] = useState([]);

  // 🔍 필터 상태
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [visibleFilter, setVisibleFilter] = useState("");
  const [orderType, setOrderType] = useState("latest");

  // 📄 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // localstraoge에서, role 확인
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchPosts();
  }, [currentPage, category, keyword, visibleFilter, orderType]);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/admin/community", {
        params: {
          category: category || null,
          keyword: keyword || null,
          visible: visibleFilter || null,
          orderType: orderType || null,
          page: currentPage,
        },
      });

      setPosts(res.data.list || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (e) {
      alert("커뮤니티 목록 조회 실패");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  /* =========================
     숨김 / 보이기
  ========================= */
  const toggleVisible = async (postId, postVisible) => {
    if (!window.confirm("노출 상태를 변경하시겠습니까?")) return;

    try {
      await api.put(`/admin/community/${postId}/visible`, null, {
        params: { postVisible: !postVisible },
      });
      fetchPosts();
    } catch (e) {
      alert("숨김/보이기 업데이트 실패");
    }
  };

  /* =========================
     삭제
  ========================= */
  const deletePost = async (postId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await api.delete(`/admin/community/${postId}`);

      if (res.data === false) {
        alert("댓글 또는 모집 참여자를 먼저 삭제하세요.");
        return;
      }

      alert("삭제되었습니다.");
      fetchPosts();
    } catch (e) {
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // ROLE 권한 체크해서, 출력하는 문
  if (role === "TEACHER") {
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
    <div>
      <h1>커뮤니티 관리</h1>

      {/* 🔍 필터 영역 */}
      <div className="community-filter">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 전체</option>
          <option value="모집">모집</option>
          <option value="자유">자유</option>
          <option value="후기">후기</option>
          <option value="정보공유">정보공유</option>
          <option value="개인정보동의">개인정보동의</option>
        </select>

        <select
          value={visibleFilter}
          onChange={(e) => setVisibleFilter(e.target.value)}
        >
          <option value="">전체 글</option>
          <option value="1">보이기 글</option>
          <option value="0">숨긴 글</option>
        </select>

        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option value="latest">최신 순</option>
          <option value="views">조회수 순</option>
          <option value="comments">댓글 순</option>
        </select>

        <input
          type="text"
          placeholder="제목 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <button onClick={handleSearch}>검색</button>
      </div>

      {/* 📋 테이블 */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성자</th>
            <th>조회수</th>
            <th>노출</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((p) => (
            <tr key={p.postId} style={{ opacity: p.postVisible ? 1 : 0.4 }}>
              <td>{p.postId}</td>
              <td>{p.category || "-"}</td>

              <td>
                <Link
                  to={`/community/detail/${p.postId}`}
                  style={{ textDecoration: "none", color: "#333" }}
                >
                  {p.title}
                </Link>
              </td>

              <td>{p.writerEmail}</td>
              <td>{p.views}</td>

              <td>
                <button onClick={() => toggleVisible(p.postId, p.postVisible)}>
                  {p.postVisible ? "숨김" : "보이기"}
                </button>
              </td>

              <td>
                <button
                  style={{ color: "red" }}
                  onClick={() => deletePost(p.postId)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 페이징 */}
      <div style={{ marginTop: "16px", display: "flex", gap: "6px" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              fontWeight: page === currentPage ? "bold" : "normal",
            }}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          다음
        </button>
      </div>
      <style>{`
  .community-filter {
    border: 1px solid #e3e3e3;
    background: #fafafa;
    padding: 12px;
    margin-bottom: 12px;

    display: flex;
    gap: 8px;
    align-items: center;
  }

  .community-filter select,
  .community-filter input {
    height: 40px;
    padding: 0 10px;
    font-size: 14px;
  }

  .community-filter button {
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    cursor: pointer;
  }
`}</style>
    </div>
  );
}

export default AdminCommunityPage;
