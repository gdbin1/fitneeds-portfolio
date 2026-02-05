import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";            // 🔥 axios → api

function CommunityUserDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");

  // 댓글 수정
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // 🔥 모집 관련
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [joinUsers, setJoinUsers] = useState([]);

  const loginUserId = localStorage.getItem("userId");

  /* =========================
     게시글 상세 조회
  ========================= */
  const fetchPostDetail = async () => {
    const res = await api.get(`/user/community/${postId}`);    // 🔥 변경
    setPost(res.data);
    setLoading(false);
  };

  /* =========================
     댓글 목록 조회
  ========================= */
  const fetchComments = async () => {
    const res = await api.get(`/user/community/${postId}/comments`); // 🔥 변경
    setComments(res.data);
  };

  /* =========================
     🔥 참여 여부 / 참여자 조회
  ========================= */
  const checkJoined = async () => {
    if (!loginUserId) return;

    const res = await api.get(                             // 🔥 변경
      `/user/community/${postId}/join/check`,
      { params: { userId: loginUserId } }
    );
    setAlreadyJoined(res.data.joined === true);
  };

  const fetchJoinUsers = async () => {
    const res = await api.get(                             // 🔥 변경
      `/user/community/${postId}/join/users`
    );
    setJoinUsers(res.data);
  };

  /* =========================
     댓글 작성
  ========================= */
  const submitComment = async () => {
    if (!commentContent.trim()) return alert("댓글 내용을 입력해주세요.");
    if (!loginUserId) return alert("로그인이 필요합니다.");

    await api.post(`/user/community/${postId}/comments`, {   // 🔥 변경
      content: commentContent,
      writerId: loginUserId,
    });

    setCommentContent("");
    fetchComments();
  };

  /* =========================
     댓글 수정 / 삭제
  ========================= */
  const startEditComment = (c) => {
    setEditingCommentId(c.commentId);
    setEditingContent(c.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const saveEditComment = async (commentId) => {
    if (!editingContent.trim()) return;

    await api.put(`/community/comments/${commentId}`, {      // 🔥 변경
      userId: loginUserId,
      content: editingContent,
    });

    cancelEditComment();
    fetchComments();
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    await api.delete(`/community/comments/${commentId}`, {   // 🔥 변경
      data: { userId: loginUserId },
    });

    fetchComments();
  };

  /* =========================
     모집 참여 / 취소
  ========================= */
  const handleApplyRecruit = async () => {
    if (!loginUserId) return alert("로그인이 필요합니다.");
    if (String(post.writerId) === String(loginUserId))
      return alert("작성자는 참여할 수 없습니다.");

    await api.post(`/user/community/${postId}/join`, {       // 🔥 변경
      userId: loginUserId,
    });

    setAlreadyJoined(true);
    fetchJoinUsers();
    fetchPostDetail();
  };

  const handleCancelRecruit = async () => {
    if (!window.confirm("참여 신청을 취소하시겠습니까?")) return;

    await api.delete(`/user/community/${postId}/join`, {     // 🔥 변경
      data: { userId: loginUserId },
    });

    setAlreadyJoined(false);
    fetchJoinUsers();
    fetchPostDetail();
  };

  /* =========================
     게시글 수정 / 삭제
  ========================= */
  const handleEditPost = () => {
    navigate(`/community/write?edit=${post.postId}`);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

    await api.delete(`/user/community/${post.postId}`, {    // 🔥 변경
      params: { userId: loginUserId },
    });

    navigate("/community");
  };

  /* =========================
     초기 로딩
  ========================= */
  useEffect(() => {
    setLoading(true);
    fetchPostDetail();
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (!post || !loginUserId) return;

    const isWriter = String(post.writerId) === String(loginUserId);
    if (post.category === "모집") {
      if (isWriter) fetchJoinUsers();
      else {
        checkJoined();
        fetchJoinUsers();
      }
    }
  }, [post, loginUserId]);

  if (loading) return <div>로딩 중...</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  const isWriter = String(post.writerId) === String(loginUserId);
  const isRecruitPost = post.category === "모집";
  const isRecruitClosed = post.recruitStatus === "모집종료";

  return (
    <div className="community-detail-page" style={{
      marginLeft: "auto",
      marginRight: "auto",
    }}>
      <button
        className="community-action-btn"
        onClick={() => navigate(-1)}
      >
        ← 목록으로
      </button>

      {/* =========================
          게시글 카드
      ========================= */}
      <div className="community-card">
        <div className="post-header">
          <h2 className="post-title">{post.title}</h2>

          <div className="post-meta">
            <span>
              작성자 {post.writerName || post.writerId || "-"} ·{" "}
              {post.createdAt?.substring(0, 10)}
            </span>

            {isWriter && (
              <div>
                <button
                  className="community-action-btn"
                  onClick={handleEditPost}
                >
                  수정
                </button>
                <button
                  className="community-action-btn delete"
                  onClick={handleDeletePost}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="post-body">
          <div className="post-content">{post.content}</div>
        </div>

        {/* 모집 영역 */}
        {isRecruitPost && (
          <div style={{ marginTop: 20 }}>
            <p>모집 인원: {post.recruitMax}</p>

            {!isWriter && !isRecruitClosed && (
              <>
                {!alreadyJoined ? (
                  <button
                    className="recruit-apply-btn"
                    onClick={handleApplyRecruit}
                  >
                    참여 신청하기
                  </button>
                ) : (
                  <button
                    className="recruit-cancel-btn"
                    onClick={handleCancelRecruit}
                  >
                    참여 취소
                  </button>
                )}
              </>
            )}

            {isRecruitClosed && (
              <span className="recruit-status-badge recruit-closed">
                모집 종료
              </span>
            )}
          </div>
        )}
      </div>

      {/* 참여자 목록 (작성자용) */}
      {isRecruitPost && isWriter && (
        <div className="recruit-join-box">
          <div className="recruit-join-header">
            <h4>참여자 목록</h4>
            <span className="recruit-join-count">
              {joinUsers.length} / {post.recruitMax}명
            </span>
          </div>

          {joinUsers.length === 0 ? (
            <p className="recruit-empty-text">아직 참여 신청자가 없습니다.</p>
          ) : (
            <ul className="recruit-join-list">
              {joinUsers.map((u, i) => (
                <li key={i} className="recruit-join-item">
                  <span className="recruit-user-icon">👤</span>
                  <span className="recruit-user-id">{u}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* =========================
          댓글 목록
      ========================= */}
      <div className="community-card comment-list-card">
        <h3>댓글</h3>

        {comments.map((c) => {
          const isMy = String(c.writerId) === String(loginUserId);
          const editing = editingCommentId === c.commentId;

          return (
            <div key={c.commentId} className="comment-item">
              <div className="comment-meta">
                <strong>{c.writerName || c.writerId || "-"}</strong>

                {isMy && !editing && (
                  <>
                    <button
                      className="community-action-btn"
                      onClick={() => startEditComment(c)}
                    >
                      수정
                    </button>
                    <button
                      className="community-action-btn delete"
                      onClick={() => deleteComment(c.commentId)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>

              {editing ? (
                <>
                  <textarea
                    className="comment-textarea"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <button
                    className="community-action-btn"
                    onClick={() => saveEditComment(c.commentId)}
                  >
                    저장
                  </button>
                  <button
                    className="community-action-btn delete"
                    onClick={cancelEditComment}
                  >
                    취소
                  </button>
                </>
              ) : (
                <p className="community-post-content">{c.content}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================
          댓글 작성
      ========================= */}
      <div className="comment-write-box">
        <textarea
          className="comment-textarea"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button className="comment-submit-btn" onClick={submitComment}>
          댓글 작성
        </button>
      </div>
    </div>
  );
}

export default CommunityUserDetail;
