// file: src/pages/Teachers/AdminTeachersDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./css/AdminTeachers.css";
import {
    getTeacherDetail,
    getTeacherAssignedSchedules,
    retireTeacher,
    updateTeacherStatus,
} from "../../api/teachers";
import { ACCESS_TOKEN_KEY } from "../../store/authSlice";

function statusLabel(sttsCd) {
    switch (sttsCd) {
        case "ACTIVE":
            return "재직";
        case "LEAVE":
            return "휴직";
        case "RESIGNED":
            return "퇴사";
        default:
            return sttsCd || "-";
    }
}

function safeArr(v) {
    return Array.isArray(v) ? v : [];
}

function fmtTime(v) {
    if (!v) return "-";
    if (typeof v === "string" && v.length >= 5) return v.slice(0, 5);
    return String(v);
}

function base64UrlDecode(str) {
    try {
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const pad = "=".repeat((4 - (base64.length % 4)) % 4);
        return atob(base64 + pad);
    } catch {
        return "";
    }
}

function getCurrentUserIdFromToken() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return "";
    const parts = token.split(".");
    if (parts.length !== 3) return "";
    try {
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        return payload?.sub || payload?.userId || payload?.username || "";
    } catch {
        return "";
    }
}

// ✅ URL 표시 축약(중간 생략)
function truncateMiddle(str, maxLen = 54) {
    if (!str) return "";
    const s = String(str);
    if (s.length <= maxLen) return s;
    const keep = maxLen - 3;
    const head = Math.ceil(keep * 0.6);
    const tail = Math.floor(keep * 0.4);
    return `${s.slice(0, head)}...${s.slice(s.length - tail)}`;
}

function isHttpUrl(str) {
    return /^https?:\/\//i.test(String(str || ""));
}

async function copyToClipboard(text) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        alert("프로필 URL이 복사되었습니다.");
    } catch {
        // 구형 브라우저 fallback
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            alert("프로필 URL이 복사되었습니다.");
        } catch {
            alert("복사에 실패했습니다.");
        }
    }
}

export default function AdminTeachersDetailPage() {
    const navigate = useNavigate();
    const params = useParams();

    // 라우트 param 이름이 userId/teacherId 등 섞여있을 수 있어 방어
    const targetUserId = params.userId || params.teacherId;

    // 배정 수업 기간 기본: 이번 달 1일 ~ 오늘
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const firstDay = `${y}-${m}-01`;

    const [from, setFrom] = useState(firstDay);
    const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

    const [teacher, setTeacher] = useState(null);
    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(false); // 상세 로딩
    const [schLoading, setSchLoading] = useState(false); // 배정수업 로딩
    const [errMsg, setErrMsg] = useState("");

    // 퇴사 처리 입력
    const [leaveDt, setLeaveDt] = useState(() => new Date().toISOString().slice(0, 10));
    const [leaveRsn, setLeaveRsn] = useState("");

    // 상태 변경
    const [nextStatus, setNextStatus] = useState("ACTIVE");

    // ✅ 프로필 이미지 로드 실패(onError) 상태
    const [imgLoadError, setImgLoadError] = useState(false);

    const loadDetailOnly = async () => {
        if (!targetUserId) return;

        setLoading(true);
        setErrMsg("");
        try {
            const data = await getTeacherDetail(targetUserId);
            setTeacher(data || null);

            setNextStatus(data?.sttsCd || "ACTIVE");

            const serverLeaveDt = data?.leaveDt;
            const serverLeaveRsn = data?.leaveRsn;
            if (serverLeaveDt) setLeaveDt(serverLeaveDt);
            if (serverLeaveRsn) setLeaveRsn(serverLeaveRsn);
        } catch (e) {
            setErrMsg(e?.response?.data?.message || e?.message || "상세 조회 중 오류가 발생했습니다.");
            setTeacher(null);
        } finally {
            setLoading(false);
        }
    };

    const loadSchedulesOnly = async () => {
        if (!targetUserId) return;

        setSchLoading(true);
        setErrMsg("");
        try {
            const sch = await getTeacherAssignedSchedules(targetUserId, {
                from: from || undefined,
                to: to || undefined,
            });
            setSchedules(safeArr(sch));
        } catch (e) {
            setErrMsg(e?.response?.data?.message || e?.message || "배정 수업 조회 중 오류가 발생했습니다.");
            setSchedules([]);
        } finally {
            setSchLoading(false);
        }
    };

    const loadAll = async () => {
        if (!targetUserId) return;

        setLoading(true);
        setSchLoading(true);
        setErrMsg("");
        try {
            const [d, sch] = await Promise.all([
                getTeacherDetail(targetUserId),
                getTeacherAssignedSchedules(targetUserId, {
                    from: from || undefined,
                    to: to || undefined,
                }),
            ]);

            setTeacher(d || null);
            setSchedules(safeArr(sch));

            setNextStatus(d?.sttsCd || "ACTIVE");

            const serverLeaveDt = d?.leaveDt;
            const serverLeaveRsn = d?.leaveRsn;
            if (serverLeaveDt) setLeaveDt(serverLeaveDt);
            if (serverLeaveRsn) setLeaveRsn(serverLeaveRsn);
        } catch (e) {
            setErrMsg(e?.response?.data?.message || e?.message || "강사 상세/배정수업 조회 중 오류가 발생했습니다.");
            setTeacher(null);
            setSchedules([]);
        } finally {
            setLoading(false);
            setSchLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUserId]);

    const vm = useMemo(() => {
        const t = teacher || {};
        const sportsText = safeArr(t?.sports)
            .slice()
            .sort((a, b) => (a?.sortNo ?? 999) - (b?.sortNo ?? 999))
            .map((s) => s?.sportNm)
            .filter(Boolean)
            .join(", ");

        return {
            userId: t?.userId ?? t?.user_id ?? "-",
            userName: t?.userName ?? t?.user_name ?? "-",
            brchNm: t?.brchNm ?? t?.brch_nm ?? "-",
            sportsText,
            phoneNumber: t?.phoneNumber ?? t?.phone_number ?? "-",
            email: t?.email ?? "-",
            hireDt: t?.hireDt ?? t?.hire_dt ?? "-",
            sttsCd: t?.sttsCd ?? t?.stts_cd ?? "-",
            intro: t?.intro ?? "",
            leaveDt: t?.leaveDt ?? t?.leave_dt ?? "",
            leaveRsn: t?.leaveRsn ?? t?.leave_rsn ?? "",
            profileImgUrl: t?.profileImgUrl ?? t?.profile_img_url ?? "",
        };
    }, [teacher]);

    // ✅ URL이 바뀌면 에러 상태 리셋(새 이미지 재시도 가능)
    useEffect(() => {
        setImgLoadError(false);
    }, [vm.profileImgUrl]);

    const isResigned = vm.sttsCd === "RESIGNED";
    const isBusy = loading || schLoading;

    const onChangeStatus = async () => {
        if (!targetUserId) return;

        const ok = window.confirm(`상태를 '${nextStatus}'로 변경할까요?`);
        if (!ok) return;

        try {
            await updateTeacherStatus(targetUserId, { sttsCd: nextStatus });
            await loadDetailOnly();
            alert("상태가 변경되었습니다.");
        } catch (e) {
            alert(e?.response?.data?.message || e?.message || "상태 변경 중 오류가 발생했습니다.");
        }
    };

    const onRetire = async () => {
        if (!targetUserId) return;

        if (isResigned) {
            alert("이미 퇴사 처리된 강사입니다.");
            return;
        }

        const ok = window.confirm("퇴사 처리 하시겠습니까?");
        if (!ok) return;

        if (!leaveDt) {
            alert("퇴사일은 필수입니다.");
            return;
        }
        if (!leaveRsn.trim()) {
            alert("퇴사 사유는 필수입니다.");
            return;
        }

        let updaterId = getCurrentUserIdFromToken();
        if (!updaterId) {
            updaterId = window.prompt("업데이터 ID(updaterId)를 입력하세요 (필수)", "");
            if (!updaterId || !updaterId.trim()) {
                alert("updaterId는 필수입니다.");
                return;
            }
        }

        try {
            await retireTeacher(targetUserId, { leaveDt, leaveRsn: leaveRsn.trim(), updaterId });
            await loadDetailOnly();
            alert("퇴사 처리되었습니다.");
        } catch (e) {
            alert(e?.response?.data?.message || e?.message || "퇴사 처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="teachers-page">
            <div className="teachers-header">
                <div>
                    <div className="teachers-breadcrumb">TEACHERS - 강사 상세</div>
                    <h2 className="teachers-title">강사 상세</h2>
                </div>

                <div className="teachers-header-actions">
                    <button
                        className="btn-sm"
                        onClick={() => navigate(`/teachers/${targetUserId}/edit`)}
                        disabled={!targetUserId || isBusy}
                    >
                        수정
                    </button>
                    <button className="btn-sm" onClick={() => navigate("/teachers")} disabled={isBusy}>
                        목록으로
                    </button>
                </div>
            </div>

            <div className="teachers-content">
                {errMsg && <div className="teachers-error">{errMsg}</div>}

                {loading && !teacher ? (
                    <div className="teachers-loading">로딩 중...</div>
                ) : !teacher ? (
                    <div className="teachers-empty">데이터가 없습니다.</div>
                ) : (
                    <>
                        <div className="detail-grid">
                            {/* 좌측: 강사 기본정보 + 프로필 이미지 */}
                            <div className="panel">
                                <div className="panel-title">강사 정보</div>

                                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 12 }}>
                                    <div
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 12,
                                            overflow: "hidden",
                                            background: "#f3f4f6",
                                        }}
                                    >
                                        {vm.profileImgUrl && !imgLoadError ? (
                                            <img
                                                src={vm.profileImgUrl}
                                                alt="profile"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                onLoad={() => setImgLoadError(false)}
                                                onError={() => setImgLoadError(true)}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#6b7280",
                                                    fontSize: 12,
                                                }}
                                            >
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div className="kv">
                                            <div className="kv-row">
                                                <div className="kv-k">USER_ID</div>
                                                <div className="kv-v" style={{ wordBreak: "break-all" }}>
                                                    {vm.userId}
                                                </div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">강사명</div>
                                                <div className="kv-v">{vm.userName}</div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">소속 지점</div>
                                                <div className="kv-v">{vm.brchNm}</div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">주요 종목</div>
                                                <div className="kv-v">{vm.sportsText || "-"}</div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">연락처</div>
                                                <div className="kv-v">{vm.phoneNumber}</div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">이메일</div>
                                                <div className="kv-v">{vm.email}</div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">입사일</div>
                                                <div className="kv-v">{vm.hireDt}</div>
                                            </div>
                                            <div className="kv-row">
                                                <div className="kv-k">상태</div>
                                                <div className="kv-v">{statusLabel(vm.sttsCd)}</div>
                                            </div>

                                            {/* ✅ 프로필 URL: 짧게 표시 + 새탭 열기 + 복사 */}
                                            <div className="kv-row">
                                                <div className="kv-k">프로필 URL</div>
                                                <div className="kv-v">
                                                    {vm.profileImgUrl ? (
                                                        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                                                            {isHttpUrl(vm.profileImgUrl) ? (
                                                                <a
                                                                    href={vm.profileImgUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title={vm.profileImgUrl}
                                                                    style={{
                                                                        flex: 1,
                                                                        minWidth: 0,
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {truncateMiddle(vm.profileImgUrl, 54)}
                                                                </a>
                                                            ) : (
                                                                <span
                                                                    title={vm.profileImgUrl}
                                                                    style={{
                                                                        flex: 1,
                                                                        minWidth: 0,
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {truncateMiddle(vm.profileImgUrl, 54)}
                                                                </span>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="link-btn"
                                                                onClick={() => copyToClipboard(vm.profileImgUrl)}
                                                                title="URL 복사"
                                                            >
                                                                복사
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </div>

                                            {/* ✅ URL이 있는데 로드 실패한 경우 사용자에게 명확히 표시 */}
                                            {vm.profileImgUrl && imgLoadError && (
                                                <div className="hint" style={{ marginTop: 6 }}>
                                                    프로필 이미지 로드에 실패했습니다. (URL 오류/외부 차단(CORS) 가능)
                                                </div>
                                            )}

                                            <div className="kv-row">
                                                <div className="kv-k">한줄 소개</div>
                                                <div className="kv-v">{vm.intro || "-"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 우측: 상태·퇴사 관리 (기존 유지) */}
                            <div className="panel">
                                <div className="panel-title">상태 · 퇴사 관리</div>

                                <div className="sub-panel">
                                    <div className="sub-title">상태 변경</div>
                                    <div className="inline-controls">
                                        <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                                            <option value="ACTIVE">재직</option>
                                            <option value="LEAVE">휴직</option>
                                            <option value="RESIGNED" disabled>
                                                퇴사(퇴사처리로만)
                                            </option>
                                        </select>

                                        <button className="btn-primary" onClick={onChangeStatus} disabled={isBusy || !targetUserId}>
                                            상태변경
                                        </button>
                                    </div>
                                    <div className="hint">퇴사는 아래 "퇴사 처리"를 사용하세요.</div>
                                </div>

                                <div className="sub-panel">
                                    <div className="sub-title">퇴사 처리</div>
                                    <div className="inline-controls">
                                        <input
                                            type="date"
                                            value={leaveDt}
                                            onChange={(e) => setLeaveDt(e.target.value)}
                                            disabled={isResigned || isBusy}
                                        />
                                        <input
                                            value={leaveRsn}
                                            onChange={(e) => setLeaveRsn(e.target.value)}
                                            placeholder="퇴사 사유 (필수)"
                                            disabled={isResigned || isBusy}
                                        />
                                        <button className="danger-btn" onClick={onRetire} disabled={isResigned || isBusy}>
                                            퇴사처리
                                        </button>
                                    </div>
                                    <div className="hint">
                                        퇴사 처리 시 상태는 RESIGNED로 변경됩니다.
                                        {isResigned && (
                                            <>
                                                {" "}
                                                (퇴사일: {vm.leaveDt || "-"}, 사유: {vm.leaveRsn || "-"})
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 경력/자격증 (기존 유지) */}
                        <div className="panel panel-wide">
                            <div className="panel-title">경력 · 자격증</div>

                            <div className="two-col">
                                <div className="sub-panel">
                                    <div className="sub-title">경력</div>
                                    <div className="simple-list">
                                        {safeArr(teacher?.careers).length === 0 ? (
                                            <div className="hint">등록된 경력이 없습니다.</div>
                                        ) : (
                                            safeArr(teacher?.careers).map((c) => (
                                                <div key={c?.careerId ?? `${c?.orgNm}-${c?.strtDt}`} className="simple-row">
                                                    <div>
                                                        {(c?.strtDt || "-")} ~ {(c?.endDt || "-")}
                                                    </div>
                                                    <div>
                                                        {c?.orgNm || "-"} / {c?.roleNm || "-"}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="sub-panel">
                                    <div className="sub-title">자격증</div>
                                    <div className="simple-list">
                                        {safeArr(teacher?.certificates).length === 0 ? (
                                            <div className="hint">등록된 자격증이 없습니다.</div>
                                        ) : (
                                            safeArr(teacher?.certificates).map((c) => (
                                                <div key={c?.certId ?? `${c?.certNm}-${c?.acqDt}`} className="simple-row">
                                                    <div>{c?.certNm || "-"}</div>
                                                    <div>
                                                        {c?.issuer || "-"} / {c?.acqDt || "-"}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 배정 수업 목록 (기존 유지) */}
                        <div className="panel panel-wide">
                            <div className="panel-title">배정 수업 목록</div>

                            <div className="teachers-filter" style={{ marginBottom: 12 }}>
                                <div className="filter-row" style={{ alignItems: "end" }}>
                                    <div className="filter-item">
                                        <label>기간(From)</label>
                                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={schLoading} />
                                    </div>
                                    <div className="filter-item">
                                        <label>기간(To)</label>
                                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={schLoading} />
                                    </div>
                                    <div className="filter-item filter-btn">
                                        <button className="btn-primary" onClick={loadSchedulesOnly} disabled={schLoading || !targetUserId}>
                                            {schLoading ? "조회 중..." : "검색"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="teachers-table-wrap">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>스케줄ID</th>
                                        <th>수업명</th>
                                        <th>지점</th>
                                        <th>일자</th>
                                        <th>시간</th>
                                        <th>정원</th>
                                        <th>예약</th>
                                        <th>상태</th>
                                        <th>보기</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {schLoading ? (
                                        <tr>
                                            <td colSpan={9} style={{ padding: 20 }}>
                                                조회 중...
                                            </td>
                                        </tr>
                                    ) : schedules.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ padding: 20 }}>
                                                조회 결과가 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.map((s, idx) => {
                                            const schdId = s.schdId ?? s.schd_id ?? idx;
                                            return (
                                                <tr key={schdId}>
                                                    <td>{s.schdId ?? s.schd_id}</td>
                                                    <td>{s.progNm ?? s.prog_nm}</td>
                                                    <td>{s.brchNm ?? s.brch_nm}</td>
                                                    <td>{s.strtDt ?? s.strt_dt}</td>
                                                    <td>
                                                        {fmtTime(s.strtTm ?? s.strt_tm)} ~ {fmtTime(s.endTm ?? s.end_tm)}
                                                    </td>
                                                    <td>{s.maxNopCnt ?? s.max_nop_cnt}</td>
                                                    <td>{s.rsvCnt ?? s.rsv_cnt}</td>
                                                    <td>{s.sttsCd ?? s.stts_cd}</td>
                                                    <td className="teachers-actions">
                                                        <button
                                                            className="link-btn"
                                                            onClick={() => navigate(`/myclass/schedules/${s.schdId ?? s.schd_id}`)}
                                                        >
                                                            수업상세
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="teachers-paging-hint">페이징은 추후 연동</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}