import React, { useEffect, useState } from "react";
import api from "../../api";

function AdminNoticePage() {
  const [notices, setNotices] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [displayEnd, setDisplayEnd] = useState("");
  const [alwaysDisplay, setAlwaysDisplay] = useState(true);

  // localstraoge에서, role 확인
  const role = localStorage.getItem("role"); // ADMIN | MANAGER | TEACHER
  const rawBranchId = localStorage.getItem("brchId");

  const myBranchId =
    role === "ADMIN" ? null : Number(rawBranchId);




  const [editingBranchId, setEditingBranchId] = useState(null);

  /* =========================
     공지 목록 조회
  ========================= */
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const res = await api.get("/admin/notice");

    const converted = res.data.map((n) => ({
      id: n.postId,
      title: n.title,
      content: n.content,
      visible: n.isVisible,
      pinned: n.isPinned,
      endDate: n.displayEnd ? n.displayEnd.split("T")[0] : "상시",
      createdAt: n.createdAt?.split("T")[0],
      branchId: n.branchId,
      branchName: n.branchName,
      rawDisplayEnd: n.displayEnd,
    }));

    setNotices(converted);
  };

  /* =========================
     UI 핸들러
  ========================= */
  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const editNotice = (n) => {
    if (
      role === "MANAGER" &&
      (n.branchId === null || n.branchId !== myBranchId)
    ) {
      alert("본인 지점 공지만 수정할 수 있습니다.");
      return;
    }

    setEditingId(n.id);
    setEditingBranchId(n.branchId); // ✅ 여기: 절대 null 아님
    setTitle(n.title);
    setContent(n.content);


    if (n.rawDisplayEnd) {
      setAlwaysDisplay(false);
      setDisplayEnd(n.rawDisplayEnd.split("T")[0]);
    } else {
      setAlwaysDisplay(true);
      setDisplayEnd("");
    }
  };


  /* =========================
     등록 / 수정
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!alwaysDisplay && !displayEnd) {
      alert("종료 날짜를 선택하세요.");
      return;
    }

    const payload = {
      title,
      content,
      branchId: editingId
        ? editingBranchId     // 수정 시 기존 지점 유지
        : myBranchId,         // ✅ 등록 시도 동일 기준 사용
      displayEnd: alwaysDisplay ? null : `${displayEnd}T23:59:59`,
    };


    if (editingId) {
      await api.put(`/admin/notice/${editingId}`, payload);
    } else {
      await api.post("/admin/notice", payload);
    }

    setEditingId(null);
    setEditingBranchId(null); // ✅ 이거 꼭 같이 초기화
    setTitle("");
    setContent("");
    setDisplayEnd("");
    setAlwaysDisplay(true);

    fetchNotices();
  };


  /* =========================
     삭제
  ========================= */
  const deleteNotice = async (id) => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    await api.delete(`/admin/notice/${id}`);
    fetchNotices();
  };

  /* =========================
     숨김 / 보이기
  ========================= */
  const toggleVisible = async (n) => {
    if (!window.confirm("노출 상태를 변경하시겠습니까?")) return;

    await api.put(`/admin/notice/${n.id}/visible`, null, {
      params: { visible: !n.visible },
    });

    fetchNotices();
  };

  /* =========================
     📌 상단 고정
  ========================= */
  const togglePinned = async (n) => {
    await api.put(`/admin/notice/${n.id}/pin`, null, {
      params: { pinned: !n.pinned },
    });
    fetchNotices();
  };

  /* =========================
     검색 & 정렬
  ========================= */
  const filteredNotices = notices.filter((n) =>
    n.title.includes(searchKeyword)
  );

  // DB에서도 정렬되지만, UI에서도 한 번 더 안전하게 처리
  const visibleNotices = filteredNotices.filter((n) => {
    if (role === "ADMIN") return true;

    if (role === "MANAGER") {
      return n.branchId === myBranchId || n.branchId === null;
    }

    return false;
  });

  const sortedNotices = [...visibleNotices].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned;
    return b.id - a.id;
  });


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
    <>
      <h1>공지사항 관리</h1>

      <input
        type="text"
        placeholder="제목 검색"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ width: "250px", padding: "6px", marginBottom: "20px" }}
      />

      <table className="admin-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>지점</th>
            <th>제목</th>
            <th>종료일</th>
            <th>노출</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {sortedNotices.flatMap((n) => {
            const rows = [];

            rows.push(
              <tr
                key={n.id}
                style={{
                  background: n.pinned
                    ? "#fff9e6"
                    : !n.visible
                      ? "#f1f1f1"
                      : "white",
                  color: !n.visible ? "#999" : "#000",
                  opacity: !n.visible ? 0.5 : 1,
                }}
              >
                <td>{n.id}</td>
                <td>{n.branchName ?? "전체 공지"}</td>
                <td
                  onClick={() => n.visible && toggleOpen(n.id)}
                  style={{ cursor: "pointer", fontWeight: "600" }}
                >
                  {n.pinned && "📌 "}
                  {n.title}
                </td>
                <td>{n.endDate}</td>
                <td>{n.visible ? "노출" : "숨김"}</td>
                <td>
                  <span style={{ display: "inline-flex", gap: "6px" }}>
                    {(role === "ADMIN" ||
                      (role === "MANAGER" && n.branchId === myBranchId)) && (
                        <>
                          <button onClick={() => editNotice(n)}>수정</button>

                          <button onClick={() => toggleVisible(n)}>
                            {n.visible ? "숨기기" : "보이기"}
                          </button>
                        </>
                      )}

                    {role === "ADMIN" && (
                      <button onClick={() => togglePinned(n)}>
                        {n.pinned ? "고정해제" : "상단고정"}
                      </button>
                    )}

                    {(role === "ADMIN" ||
                      (role === "MANAGER" && n.branchId === myBranchId)) && (
                        <button
                          onClick={() => deleteNotice(n.id)}
                          style={{ color: "red" }}
                        >
                          삭제
                        </button>
                      )}
                  </span>
                </td>

              </tr>
            );

            if (openId === n.id) {
              rows.push(
                <tr key={`detail-${n.id}`}>
                  <td colSpan="6" style={{ background: "#fafafa", padding: "15px" }}>
                    <strong>내용</strong>
                    <div style={{ marginTop: "10px", whiteSpace: "pre-line" }}>
                      {n.content}
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "13px", color: "#777" }}>
                      작성일: {n.createdAt}
                    </div>
                  </td>
                </tr>
              );
            }

            return rows;
          })}
        </tbody>
      </table>

      <h2 style={{ marginTop: "30px" }}>
        {editingId ? "공지 수정" : "공지 등록"}
      </h2>

      <form onSubmit={handleSubmit} className="notice-form">
        <div className="form-row">
          <label style={{ fontSize: "25px", fontWeight: "600" }}>제목</label>
          <br />
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label style={{ fontSize: "25px", fontWeight: "600" }}>내용</label><br />
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="always-display-label">
            <span className="always-display-box">
              <input
                type="checkbox"
                checked={alwaysDisplay}
                onChange={(e) => setAlwaysDisplay(e.target.checked)}
              />
            </span>

            <span className="always-display-text">상시 게시</span>
          </label>
        </div>



        <div className="form-row">
          <label style={{ fontSize: "20px", fontWeight: "600" }}>종료 날짜</label><br />
          <input
            type="date"
            disabled={alwaysDisplay}
            value={displayEnd}
            onChange={(e) => setDisplayEnd(e.target.value)}
          />
        </div>

        <button type="submit">
          {editingId ? "수정 완료" : "등록"}
        </button>

        {/* ✅ 스타일 한 번에 */}
        <style>{`
    .notice-form {
      margin-top: 20px;
    }

    .notice-form .form-row {
      margin-bottom: 20px;
    }

    .notice-form label {
      font-size: 14px;
      font-weight: 600;
    }

    .notice-form input[type="text"],
    .notice-form input[type="date"],
    .notice-form textarea {
      width: 600px;
      font-size: 14px;
      padding: 10px 12px;
      margin-top: 6px;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
    }

    .notice-form input[type="text"],
    .notice-form input[type="date"] {
      height: 42px;
    }

    .notice-form textarea {
      height: 200px;
      resize: vertical;
    }

    .notice-form button {
      padding: 10px 22px;
      font-size: 14px;
      cursor: pointer;
    }
     .always-display-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .always-display-box {
    width: 22px;
    height: 22px;
    border: 2px solid #555;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .always-display-box input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  /* 체크된 상태 강조 */
  .always-display-box input:checked {
    accent-color: #5c6ac4;
  }

  .always-display-text {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }  
  `}</style>
      </form>

    </>
  );
}

export default AdminNoticePage;
