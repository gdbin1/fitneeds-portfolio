// file: src/pages/MyClass/AdminMyClassListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Teachers/css/AdminTeachers.css";
import { getMySchedules } from "../../api/myclass";

const SCHEDULE_STATUS_LABEL = { OPEN: "진행", CLOSED: "마감", CANCELED: "취소" };
const fmtTime = (t) => (t ? String(t).slice(0, 5) : "-");
const PAGE_SIZE = 25;

function toYmd(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}
function firstDayOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function lastDayOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function safeArr(v) {
    return Array.isArray(v) ? v : [];
}

function isInvalidRange(fromDt, toDt) {
    return Boolean(fromDt && toDt && fromDt > toDt);
}

/** 페이지 번호 묶음 생성 (현재페이지 기준 앞뒤로 n개) */
function buildPageNumbers(current, total, windowSize = 2) {
    if (total <= 1) return [1];
    const start = Math.max(1, current - windowSize);
    const end = Math.min(total, current + windowSize);
    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
}

function normalizeRow(r) {
    return {
        schdId: r.schdId ?? r.schd_id,
        progId: r.progId ?? r.prog_id,
        progNm: r.progNm ?? r.prog_nm,
        brchId: r.brchId ?? r.brch_id,
        brchNm: r.brchNm ?? r.brch_nm,
        teacherId: r.teacherId ?? r.userId ?? r.user_id,
        teacherName: r.teacherName ?? r.teacher_name ?? r.userName ?? r.user_name,
        strtDt: r.strtDt ?? r.strt_dt,
        strtTm: r.strtTm ?? r.strt_tm,
        endTm: r.endTm ?? r.end_tm,
        maxNopCnt: r.maxNopCnt ?? r.max_nop_cnt,
        rsvCnt: r.rsvCnt ?? r.rsv_cnt,
        sttsCd: r.sttsCd ?? r.stts_cd,
        description: r.description ?? r.DESCRIPTION ?? "",
    };
}

export default function AdminMyClassListPage() {
    const navigate = useNavigate();

    // 기본: 이번 달
    const today = new Date();
    const [fromDt, setFromDt] = useState(toYmd(firstDayOfMonth(today)));
    const [toDt, setToDt] = useState(toYmd(lastDayOfMonth(today)));

    // 필터
    const [progId, setProgId] = useState("");
    const [brchId, setBrchId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [sttsCd, setSttsCd] = useState("");
    const [keyword, setKeyword] = useState("");

    // 목록 데이터
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    // ✅ 옵션 전용 데이터 (기간 전체 기준)
    const [optionRows, setOptionRows] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    // ✅ 페이징 상태
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState({
        fromDt,
        toDt,
        progId: "",
        brchId: "",
        teacherId: "",
        sttsCd: "",
        keyword: "",
    });

    // ✅ 옵션 최신화: 기간만 반영해서 전체 옵션 후보를 확보
    const ensureOptions = async (nextFromDt = fromDt, nextToDt = toDt) => {
        if (isInvalidRange(nextFromDt, nextToDt)) {
            setErrMsg("시작일은 종료일보다 늦을 수 없습니다.");
            return;
        }

        setOptionsLoading(true);
        try {
            const data = await getMySchedules({
                fromDt: nextFromDt,
                toDt: nextToDt,
            });

            const list = Array.isArray(data) ? data : (data?.items ?? data?.list ?? []);
            setOptionRows(safeArr(list).map(normalizeRow));
        } catch (e) {
            // 옵션 로딩 실패는 치명적일 필요 없음 (목록은 별도)
            setOptionRows([]);
        } finally {
            setOptionsLoading(false);
        }
    };

    // ✅ 기간 변경 시 자동 옵션 갱신
    useEffect(() => {
        ensureOptions(fromDt, toDt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDt, toDt]);

    // 목록 조회(필터 포함)
    const load = async (nextPage = page, nextQuery = query) => {
        setLoading(true);
        setErrMsg("");

        if (isInvalidRange(nextQuery.fromDt, nextQuery.toDt)) {
            setErrMsg("시작일은 종료일보다 늦을 수 없습니다.");
            setRows([]);
            setTotalCount(0);
            setLoading(false);
            return;
        }

        try {
            const params = {
                fromDt: nextQuery.fromDt,
                toDt: nextQuery.toDt,
                ...(nextQuery.progId ? { progId: Number(nextQuery.progId) } : {}),
                ...(nextQuery.brchId ? { brchId: Number(nextQuery.brchId) } : {}),
                ...(nextQuery.teacherId ? { teacherId: nextQuery.teacherId } : {}),
                ...(nextQuery.sttsCd ? { sttsCd: nextQuery.sttsCd } : {}),
                ...(nextQuery.keyword?.trim() ? { keyword: nextQuery.keyword.trim() } : {}),
                page: nextPage,
                size: PAGE_SIZE,
            };

            const data = await getMySchedules(params);
            const list = Array.isArray(data) ? data : (data?.items ?? data?.list ?? []);
            setRows(safeArr(list).map(normalizeRow));
            setTotalCount(data?.total ?? list.length);
            setPage(data?.page ?? nextPage);
        } catch (e) {
            setErrMsg(e?.response?.data?.message || e?.message || "목록 조회 중 오류가 발생했습니다.");
            setRows([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // 목록 로딩
    useEffect(() => {
        load(page, query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, query]);

    // ✅ 옵션은 rows가 아니라 optionRows 기반으로 생성 (필터 걸어도 옵션이 줄지 않음)
    const options = useMemo(() => {
        const progMap = new Map();
        const brchMap = new Map();
        const teacherMap = new Map();

        for (const r of optionRows) {
            if (r.progId != null && r.progNm) progMap.set(String(r.progId), r.progNm);
            if (r.brchId != null && r.brchNm) brchMap.set(String(r.brchId), r.brchNm);
            if (r.teacherId && r.teacherName) teacherMap.set(String(r.teacherId), r.teacherName);
        }

        const progs = Array.from(progMap.entries()).map(([id, name]) => ({ id, name }));
        const brchs = Array.from(brchMap.entries()).map(([id, name]) => ({ id, name }));
        const teachers = Array.from(teacherMap.entries()).map(([id, name]) => ({ id, name }));

        progs.sort((a, b) => a.name.localeCompare(b.name, "ko"));
        brchs.sort((a, b) => a.name.localeCompare(b.name, "ko"));
        teachers.sort((a, b) => a.name.localeCompare(b.name, "ko"));

        return { progs, brchs, teachers };
    }, [optionRows]);

    // ✅ 기간 바뀌어서 옵션이 바뀌면, 현재 선택값이 옵션에 없을 경우 자동 초기화
    useEffect(() => {
        if (progId && !options.progs.some((p) => p.id === String(progId))) setProgId("");
        if (brchId && !options.brchs.some((b) => b.id === String(brchId))) setBrchId("");
        if (teacherId && !options.teachers.some((t) => t.id === String(teacherId))) setTeacherId("");
        // sttsCd는 고정 enum이라 굳이 검증 안 해도 됨
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options]);

    const filteredRows = useMemo(() => rows, [rows]);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages, 2), [page, totalPages]);

    return (
        <div className="teachers-page">
            <div className="teachers-header">
                <div>
                    <div className="teachers-breadcrumb">MYCLASS - 수업 목록</div>
                    <h2 className="teachers-title">내 수업 관리</h2>
                </div>
            </div>

            <div className="teachers-content">
                {errMsg && <div className="teachers-error">{errMsg}</div>}

                {/* 필터 패널 */}
                <div className="panel" style={{ marginBottom: 12 }}>
                    <div className="panel-title">조회 필터</div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                            gap: 10,
                            marginTop: 10,
                        }}
                    >
                        <div>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                시작일
                            </div>
                            <input className="input" type="date" value={fromDt} onChange={(e) => setFromDt(e.target.value)} />
                        </div>

                        <div>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                종료일
                            </div>
                            <input className="input" type="date" value={toDt} onChange={(e) => setToDt(e.target.value)} />
                        </div>

                        <div>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                수업명
                            </div>
                            <select className="input" value={progId} onChange={(e) => setProgId(e.target.value)} disabled={optionsLoading}>
                                <option value="">{optionsLoading ? "로딩..." : "전체"}</option>
                                {options.progs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                지점명
                            </div>
                            <select className="input" value={brchId} onChange={(e) => setBrchId(e.target.value)} disabled={optionsLoading}>
                                <option value="">{optionsLoading ? "로딩..." : "전체"}</option>
                                {options.brchs.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                강사명
                            </div>
                            <select className="input" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} disabled={optionsLoading}>
                                <option value="">{optionsLoading ? "로딩..." : "전체"}</option>
                                {options.teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                상태
                            </div>
                            <select className="input" value={sttsCd} onChange={(e) => setSttsCd(e.target.value)}>
                                <option value="">전체</option>
                                <option value="OPEN">진행</option>
                                <option value="CLOSED">마감</option>
                                <option value="CANCELED">취소</option>
                            </select>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                            gap: 10,
                            marginTop: 10,
                        }}
                    >
                        <div style={{ gridColumn: "span 5", minWidth: 0 }}>
                            <div className="kv-k" style={{ marginBottom: 6 }}>
                                검색
                            </div>
                            <input
                                className="input"
                                value={keyword}
                                placeholder="강남점, 강남강사A, 빈야사, 스피닝"
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setPage(1);
                                        setQuery({ fromDt, toDt, progId, brchId, teacherId, sttsCd, keyword });
                                    }
                                }}
                                style={{ width: "50%" }}
                            />
                        </div>

                        <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
                            <button
                                className="btn-sm"
                                onClick={() => {
                                    setPage(1);
                                    setQuery({ fromDt, toDt, progId, brchId, teacherId, sttsCd, keyword });
                                }}
                                disabled={loading}
                                style={{ width: "100%" }}
                            >
                                조회
                            </button>
                        </div>
                    </div>
                </div>

                {/* 목록 */}
                {loading ? (
                    <div className="teachers-loading">로딩 중...</div>
                ) : filteredRows.length === 0 ? (
                    <div className="teachers-empty">데이터가 없습니다.</div>
                ) : (
                    <div className="teachers-table-wrap">
                        <table>
                            <thead>
                            <tr>
                                <th>수업명</th>
                                <th>지점명</th>
                                <th>강사명</th>
                                <th>일자</th>
                                <th>시간</th>
                                <th>정원</th>
                                <th>예약</th>
                                <th>상태</th>
                                <th>보기</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredRows.map((row) => (
                                <tr key={row.schdId}>
                                    <td>{row.progNm || "-"}</td>
                                    <td>{row.brchNm || "-"}</td>
                                    <td>{row.teacherName || "-"}</td>
                                    <td>{row.strtDt || "-"}</td>
                                    <td>
                                        {fmtTime(row.strtTm)} ~ {fmtTime(row.endTm)}
                                    </td>
                                    <td>{row.maxNopCnt ?? "-"}</td>
                                    <td>{row.rsvCnt ?? 0}</td>
                                    <td>{SCHEDULE_STATUS_LABEL[row.sttsCd] || row.sttsCd || "-"}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <button className="btn-sm" onClick={() => navigate(`/myclass/schedules/${row.schdId}`)}>
                                            상세
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="teachers-pagination" style={{ marginTop: 12 }}>
                            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1 || loading} title="처음">
                                {"<<"}
                            </button>
                            <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} title="이전">
                                {"<"}
                            </button>

                            {pageNumbers[0] > 1 && (
                                <>
                                    <button className="page-btn" onClick={() => setPage(1)} disabled={loading}>
                                        1
                                    </button>
                                    {pageNumbers[0] > 2 && <span className="page-ellipsis">...</span>}
                                </>
                            )}

                            {pageNumbers.map((p) => (
                                <button
                                    key={p}
                                    className={`page-btn ${p === page ? "active" : ""}`}
                                    onClick={() => setPage(p)}
                                    disabled={loading}
                                >
                                    {p}
                                </button>
                            ))}

                            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                                <>
                                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="page-ellipsis">...</span>}
                                    <button className="page-btn" onClick={() => setPage(totalPages)} disabled={loading}>
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            <button
                                className="page-btn"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                title="다음"
                            >
                                {">"}
                            </button>
                            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages || loading} title="마지막">
                                {">>"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
