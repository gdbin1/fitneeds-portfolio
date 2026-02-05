import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";              // 🔥 axios → api
import "./CommunityWrite.css";

function CommunityUserWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get("edit"); // 🔥 수정 모드 판단

  const [category, setCategory] = useState("자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 모집 전용
  const [sportType, setSportType] = useState("");
  const [recruitMax, setRecruitMax] = useState(2);
  const [recruitEndDate, setRecruitEndDate] = useState("");

  /* =========================
     날짜 제한
  ========================= */
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  /* =========================
     🔥 수정 모드: 기존 글 조회
  ========================= */
  useEffect(() => {
    if (!editPostId) return;

    const fetchPost = async () => {
      try {
        const res = await api.get(`/user/community/${editPostId}`);   // 🔥 변경
        const post = res.data;

        setCategory(post.category);
        setTitle(post.title);
        setContent(post.content);
        setSportType(post.sportType || "");
        setRecruitMax(post.recruitMax || 2);
        setRecruitEndDate(post.recruitEndDate || "");
      } catch (e) {
        alert("게시글 정보를 불러오지 못했습니다.");
        navigate(-1);
      }
    };

    fetchPost();
  }, [editPostId, navigate]);

  /* =========================
     등록 / 수정 처리
  ========================= */
  const submitPost = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (category === "모집" && !recruitEndDate) {
      alert("모집 종료일을 선택해주세요.");
      return;
    }

    const loginUserId = localStorage.getItem("userId");
    if (!loginUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const payload = {
      category,
      title,
      content,
      writerId: loginUserId,
      sportType: category === "모집" ? sportType : null,
      recruitMax: category === "모집" ? recruitMax : null,
      recruitEndDate: category === "모집" ? recruitEndDate : null,
    };

    try {
      if (editPostId) {
        // ✏️ 수정
        await api.put(                                      // 🔥 변경
          `/user/community/${editPostId}?userId=${loginUserId}`,
          payload
        );
        alert("수정되었습니다.");
        navigate(`/community/${editPostId}`);
      } else {
        // 🆕 신규 등록
        await api.post("/user/community", payload);         // 🔥 변경
        alert("등록되었습니다.");
        navigate("/community");
      }
    } catch (e) {
      alert(editPostId ? "글 수정 실패" : "글 등록 실패");
    }
  };

  return (
    <div className="write-container">
      <h2 className="write-title">{editPostId ? "글 수정" : "글쓰기"}</h2>
      <p className="write-desc">
        커뮤니티에 글을 작성합니다. 모집 선택 시 추가 항목이 나타납니다.
      </p>

      {/* 카테고리 */}
      <div className="write-group">
        <label>카테고리</label>
        <select
          className={`category-select ${category}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="모집">모집</option>
          <option value="정보공유">정보공유</option>
          <option value="후기">후기</option>
          <option value="자유">자유</option>
        </select>
      </div>

      {/* 제목 */}
      <div className="write-group">
        <label>제목</label>
        <input
          type="text"
          placeholder="게시글 제목을 입력해주세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 내용 */}
      <div className="write-group">
        <label>내용</label>
        <textarea
          rows={6}
          placeholder="내용을 자유롭게 입력해주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* 모집 전용 */}
      {category === "모집" && (
        <div className="recruit-box">
          <h4>모집 글 추가 정보</h4>

          <div className="recruit-grid">
            <input
              type="text"
              placeholder="운동 종목 (예: 풋살, 농구)"
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
            />

            <div className="people-control">
              <span>필요 인원</span>
              <div>
                <button
                  type="button"
                  onClick={() => setRecruitMax((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <strong>{recruitMax}명</strong>
                <button
                  type="button"
                  onClick={() => setRecruitMax((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="recruit-date">
              <label>모집 종료일 설정</label>
              <input
                type="date"
                value={recruitEndDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setRecruitEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="write-actions">
        <button onClick={() => navigate(-1)}>목록으로</button>
        <button className="submit-btn" onClick={submitPost}>
          {editPostId ? "수정하기" : "등록하기"}
        </button>
      </div>
    </div>
  );
}

export default CommunityUserWrite;
