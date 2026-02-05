import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

function AdminCommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 게시글
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 댓글
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // 모집 참여자
  const [recruitUsers, setRecruitUsers] = useState([]);

  /* =========================
     게시글 상세 조회
  ========================= */
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await api.get(`/admin/community/${id}`);
        setPost(response.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  /* =========================
     ADMIN 댓글 목록 조회
  ========================= */
  const fetchComments = async (page = 1) => {
    try {
      const response = await api.get(
        `/admin/community/comments/${id}`,
        { params: { page } }
      );

      setComments(response.data.list);
      setTotalCount(response.data.totalCount);
      setCurrentPage(page);
    } catch (err) {
      console.error("댓글 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  /* =========================
     ADMIN 모집 참여자 조회
  ========================= */
  const fetchRecruitUsers = async () => {
    try {
      const res = await api.get(`/admin/community/${id}/recruit-users`);
      setRecruitUsers(res.data || []);
    } catch (err) {
      console.error("모집 참여자 조회 실패", err);
    }
  };

  useEffect(() => {
    if (post?.category === "모집") {
      fetchRecruitUsers();
    }
  }, [post]);

  /* =========================
     댓글 숨김 / 보이기
  ========================= */
  const toggleVisible = async (commentId, currentVisible) => {
    const nextVisible = currentVisible === 1 ? 0 : 1;

    try {
      await api.put(
        `/admin/community/comments/${commentId}/visible`,
        null,
        { params: { commentVisible: nextVisible } }
      );
      fetchComments(currentPage);
    } catch (err) {
      console.error("댓글 숨김/보이기 실패", err);
    }
  };

  /* =========================
     댓글 삭제
  ========================= */
  const deleteComment = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/admin/community/comments/${commentId}`);
      fetchComments(currentPage);
    } catch (err) {
      console.error("댓글 삭제 실패", err);
    }
  };

  /* =========================
     모집 참여자 삭제
  ========================= */
  const deleteRecruitUser = async (joinId) => {
    if (!window.confirm("해당 참여자를 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/admin/community/recruit-users/${joinId}`);
      await fetchRecruitUsers();
      alert("모집 참여자가 삭제되었습니다.");
    } catch (err) {
      console.error("모집 참여자 삭제 실패", err);
    }
  };

  /* =========================
     페이징
  ========================= */
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div>로딩 중...</div>;
  if (error || !post) return <div>게시글을 불러오지 못했습니다.</div>;

  return (
    <>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "15px" }}>
        ← 목록으로
      </button>

      <h2>{post.title}</h2>

      <div style={{ marginBottom: "20px", color: "#777" }}>
        <div>카테고리: {post.category}</div>
        <div>작성자: {post.writerEmail}</div>
        <div>작성일: {post.createdAt}</div>
        <div>조회수: {post.views}</div>
      </div>

      <div
        style={{
          padding: "15px",
          background: "#f8f8f8",
          marginBottom: "30px",
          whiteSpace: "pre-line",
          lineHeight: 1.6
        }}
      >
        {post.content}
      </div>

      {/* 모집 참여자 */}
      {post.category === "모집" && (
        <>
          <h3>모집 참여자 ({recruitUsers.length})</h3>

          <table className="admin-table" style={{ marginBottom: "40px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>회원 ID</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {recruitUsers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    참여자가 없습니다.
                  </td>
                </tr>
              )}

              {recruitUsers.map((u) => (
                <tr key={u.joinId}>
                  <td>{u.joinId}</td>
                  <td>{u.userEmail || u.userName || u.userId}</td>
                  <td>
                    <button
                      style={{ color: "red" }}
                      onClick={() => deleteRecruitUser(u.joinId)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* 댓글 */}
      <h3>댓글 ({totalCount})</h3>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>작성자</th>
            <th>내용</th>
            <th>작성일</th>
            <th>노출</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr
              key={c.commentId}
              style={{ opacity: c.commentVisible === 1 ? 1 : 0.4 }}
            >
              <td>{c.commentId}</td>
              <td>{c.writerEmail || c.writerId}</td>
              <td style={{ whiteSpace: "pre-line" }}>{c.content}</td>
              <td>{c.createdAt}</td>
              <td>
                <button
                  onClick={() => toggleVisible(c.commentId, c.commentVisible)}
                >
                  {c.commentVisible === 1 ? "숨김" : "보이기"}
                </button>
              </td>
              <td>
                <button
                  style={{ color: "red" }}
                  onClick={() => deleteComment(c.commentId)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 댓글 페이징 */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => fetchComments(page)}
            style={{
              margin: "0 5px",
              fontWeight: page === currentPage ? "bold" : "normal"
            }}
          >
            {page}
          </button>
        ))}
      </div>
    </>
  );
}

export default AdminCommunityDetailPage;
