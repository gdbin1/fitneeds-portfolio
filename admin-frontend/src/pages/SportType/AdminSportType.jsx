import {useEffect, useMemo, useState} from "react";
import "./AdminSportType.css";

const API_BASE = "/api/sport-types";

export default function SportTypeList() {
    // 검색 필터
    const [keyword, setKeyword] = useState("");
    const [useYnFilter, setUseYnFilter] = useState("ALL"); // "ALL" | "Y" | "N"

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [mode, setMode] = useState("create");      // "create" | "edit"
    const [editingId, setEditingId] = useState(null);

    // ✅ 모달 표시 여부
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ 등록 폼 상태
    const [form, setForm] = useState({ name: "", memo: "" });
    const [saving, setSaving] = useState(false);


    // 검색 필터
    const filteredItems = useMemo(() => {
        const k = keyword.trim().toLowerCase();

        return items.filter((it) => {
            // ✅ 필드명은 너 백엔드 응답에 맞춰 통일
            const name = (it.sportNm ?? "").toLowerCase();
            const memo = (it.sportMemo ?? "").toLowerCase();

            const matchKeyword = !k || name.includes(k) || memo.includes(k);

            const matchUseYn =
                useYnFilter === "ALL" ||
                (useYnFilter === "Y" && (it.useYn === true || it.useYn === 1)) ||
                (useYnFilter === "N" && (it.useYn === false || it.useYn === 0));

            return matchKeyword && matchUseYn;
        });
    }, [items, keyword, useYnFilter]);


    // 1) 목록 조회
    const fetchList = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(API_BASE, { method: "GET" });
            if (!res.ok) throw new Error(`목록 조회 실패 (${res.status})`);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : (data?.content ?? []));
        } catch (e) {
            setError(e?.message ?? "알 수 없는 오류");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();

        return () => {
            // ✅ 컴포넌트 언마운트 시 정리 작업
            setIsModalOpen(false);
            document.body.style.overflow = "";
        };
    }, []);


    // 등록 모달
    const openCreateModal = () => {
        setMode("create");
        setEditingId(null);
        setForm({ name: "", memo: "" });
        setIsModalOpen(true);
    };

    // ✅ 수정 모달
    const openEditModal = (item) => {
        setMode("edit");
        setEditingId(item.sportId);
        setForm({
            name: item.sportNm ?? "",
            memo: item.sportMemo ?? "",
        });
        setIsModalOpen(true);
    };

    // ✅ 모달 닫기
    const closeModal = () => {
        if (saving) return;
        setIsModalOpen(false);
    };

    const onOverlayClick = (e) => {
        if(e.target === e.currentTarget)
            closeModal();
    }

    // 2) 저장(등록)
    const saveSportType = async () => {
        const name = form.name.trim();
        const memo = form.memo.trim();

        if (!name) {
            alert("종목명은 필수입니다.");
            return;
        }

        setSaving(true);
        try {
            const url =
                mode === "create"
                    ? `${API_BASE}/new`                 // ✅ 너가 쓰는 등록 URL
                    : `${API_BASE}/${editingId}`;       // ✅ 수정 URL (백엔드에 맞춰)

            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, memo: memo === "" ? null : memo }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`저장 실패 (${res.status}) ${text}`);
            }

            setIsModalOpen(false);
            await fetchList();
        } catch (e) {
            alert(e?.message ?? "저장 중 오류");
        } finally {
            setSaving(false);
        }
    };

    // ✅ 비활성화
    const deactivateSportType = async (item) => {
        const name = item.sportNm ?? "해당 종목";

        if (!window.confirm(`'${name}' 종목을 비활성화 하시겠습니까?`)) {
            return; // ❌ 취소
        }

        try {
            const res = await fetch(`${API_BASE}/${item.sportId}/deactivate`, {
                method: "PATCH",
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`비활성화 실패 (${res.status}) ${text}`);
            }
            else {
                alert(`'${name} 종목이 비활성화 되었습니다.`);
            }

            // ✅ 성공 시 목록 다시 조회
            await fetchList();
        } catch (e) {
            alert(e?.message ?? "비활성화 중 오류가 발생했습니다.");
        }
    };


    return (
        <>
            <h1 className="page-title">[관리자] 운동 종목 관리</h1>
            <p className="page-desc">운동 종목 조회, 운동 종목 관리 (등록 / 수정 / 비활성)</p>

            <div className="content-box">
                <div className="toolbar">
                    <div className="toolbar-left">
                        <input
                            className="input"
                            placeholder="종목명/메모 검색"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") e.preventDefault(); // 입력 즉시 필터라 Enter는 UX용
                            }}
                        />

                        {/* ✅ 상태필터(옵션) */}
                        <select
                            className="input"
                            style={{ width: 160 }}
                            value={useYnFilter}
                            onChange={(e) => setUseYnFilter(e.target.value)}
                        >
                            <option value="ALL">전체</option>
                            <option value="Y">활성</option>
                            <option value="N">비활성</option>
                        </select>

                        {/* ✅ "검색" 버튼은 사실 필요 없지만, UX상 남겨도 됨 */}
                        {/*<button className="btn btn-primary" type="button">*/}
                        {/*    검색*/}
                        {/*</button>*/}

                        {/* ✅ 초기화 */}
                        <button
                            className="btn-link"
                            type="button"
                            onClick={() => {
                                setKeyword("");
                                setUseYnFilter("ALL");
                            }}
                        >
                            초기화
                        </button>
                        {/* ✅ 등록 버튼 → 모달 오픈 */}
                        <button className="btn btn-register btn-primary" onClick={openCreateModal}>
                            + 새 운동 종목 등록
                        </button>
                    </div>
                </div>

                {loading && <div style={{ padding: 10 }}>불러오는 중...</div>}
                {error && <div style={{ padding: 10, color: "crimson" }}>{error}</div>}

                <table className="table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>사용</th>
                        <th>종목명</th>
                        <th>메모</th>
                        <th>등록일</th>
                        <th>수정일</th>
                        <th>기능</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(!loading && items.length === 0) ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                                데이터가 없습니다.
                            </td>
                        </tr>
                    ) : (
                        filteredItems.map((it) => (
                            <tr key={it.sportId}>
                                <td>{it.sportId}</td>
                                <td>
                                    {it.useYn ? (
                                        <span style={{ color: "green", fontWeight: 600 }}>Y</span>
                                    ) : (
                                        <span style={{ color: "gray" }}>N</span>
                                    )}
                                </td>
                                <td>{it.sportNm}</td>
                                <td>{it.sportMemo ?? "-"}</td>
                                <td>{it.regDt ?? "-"}</td>
                                <td>{it.updDt ?? "-"}</td>
                                <td>
                                    <button className="btn-link" onClick={() => openEditModal(it)}>수정</button>{" "}
                                    <button className="btn-link"
                                            disabled={it.useYn === false || it.useYn === 0}
                                            onClick={() => deactivateSportType(it)}>
                                        비활성화
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* ✅ 모달: isModalOpen일 때만 보이게 */}
            {isModalOpen && (
                <div className="modal-overlay-sporttype" onClick={onOverlayClick}>
                    <div className="content-box modal-area" onClick={(e) => e.stopPropagation()}>
                        <h2><span className="modal-title">
                            {mode === "create" ? "운동 종목 등록" : "운동 종목 수정"}
                        </span></h2>

                        <div className="form-grid">
                            <label>
                                종목명<span className="required">*</span>
                            </label>
                            <input
                                className="input"
                                placeholder="예: 요가"
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                disabled={saving}
                            />
                        </div>

                        <div className="form-grid">
                            <label>메모</label>
                            <textarea
                                className="input textarea"
                                rows={6}
                                placeholder="설명(선택)"
                                value={form.memo}
                                onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                                disabled={saving}
                            />
                        </div>

                        <div className="modal-form-action" style={{ textAlign: "center", marginTop: 20}}>
                            <button
                                className="btn btn-primary"
                                onClick={saveSportType}
                                disabled={saving}
                            >
                                {saving ? "저장 중..." : "저장"}
                            </button>{" "}
                            <button
                                className="btn-sm"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
