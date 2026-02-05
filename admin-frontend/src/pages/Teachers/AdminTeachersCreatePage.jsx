// file: src/pages/Teachers/AdminTeachersCreatePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./css/AdminTeachers.css";
import { createTeacher } from "../../api/teachers";
import { branchApi, sportTypeApi } from "../../api"; // 필요 시 "../../api/index"로 변경

/**
 * 백엔드 CreateReq 필수:
 * - userName, email, password, brchId, hireDt
 * sports/certificates/careers는 선택
 */

function safeArr(v) {
    return Array.isArray(v) ? v : [];
}

function newCareer() {
    return { orgNm: "", roleNm: "", strtDt: "", endDt: "" };
}

function newCertificate() {
    return { certNm: "", issuer: "", acqDt: "", certNo: "" };
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

/**
 * 운영용: 업로드 바디/DB 부담 줄이기 위해 리사이즈/압축
 * - maxDim: 긴 변 기준 최대 픽셀
 * - quality: jpeg/webp 품질
 */
async function downscaleDataUrl(dataUrl, maxDim = 512, quality = 0.82, mime = "image/jpeg") {
    const img = new Image();
    img.src = dataUrl;

    await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
    });

    const { width, height } = img;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    // 가능하면 webp로 더 줄이기(브라우저 지원 시)
    try {
        const webp = canvas.toDataURL("image/webp", 0.8);
        if (webp.startsWith("data:image/webp")) return webp;
    } catch {
        // ignore
    }

    return canvas.toDataURL(mime, quality);
}

export default function AdminTeachersCreatePage() {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    // 기본정보 (DTO명에 맞춤)
    const [userName, setUserName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [hireDt, setHireDt] = useState("");
    const [brchId, setBrchId] = useState("");
    const [intro, setIntro] = useState("");

    // 등록 시 필수
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    // sports: SportReq { sportId, mainYn, sortNo }
    // 선택 순서 유지(첫 선택 = mainYn)
    const [sportIds, setSportIds] = useState([]);

    const [careers, setCareers] = useState([newCareer()]);
    const [certificates, setCertificates] = useState([newCertificate()]);

    // profileImgUrl(문자열) + 미리보기
    const [profileImgUrl, setProfileImgUrl] = useState("");
    const previewUrl = useMemo(() => (profileImgUrl ? profileImgUrl : ""), [profileImgUrl]);

    // ✅ 파일 선택/드래그앤드롭용
    const fileRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const openFilePicker = () => fileRef.current?.click();

    const applyFile = async (file) => {
        if (!file) return;

        // 타입 방어(드래그앤드롭 시 특히 중요)
        if (!file.type?.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        try {
            const raw = await fileToDataUrl(file);
            const compact = await downscaleDataUrl(raw, 512, 0.82);
            setProfileImgUrl(compact);
        } catch {
            alert("이미지 처리 중 오류가 발생했습니다.");
        }
    };

    const onPickFile = async (e) => {
        const file = e.target.files?.[0];
        await applyFile(file);
        // 같은 파일 다시 선택 가능하게 reset
        e.target.value = "";
    };

    // drag & drop 이벤트는 기본동작 막아야 drop이 먹습니다.
    const onDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const onDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer?.files?.[0];
        await applyFile(file);
    };

    const clearProfileImg = () => setProfileImgUrl("");

    // 지점/종목 옵션(API 로딩)
    const [branchOptions, setBranchOptions] = useState([{ value: "", label: "지점 선택" }]);
    const [sportOptions, setSportOptions] = useState([]); // [{value,label}]

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const branches = await branchApi.getAll(); // 기대: [{ brchId, brchNm, ... }]
                const opts = [
                    { value: "", label: "지점 선택" },
                    ...safeArr(branches)
                        .map((b) => ({
                            value: String(b.brchId ?? b.brch_id ?? ""),
                            label: b.brchNm ?? b.brch_nm ?? "-",
                        }))
                        .filter((x) => x.value),
                ];
                setBranchOptions(opts);
            } catch {
                setBranchOptions([{ value: "", label: "지점 선택" }]);
            }

            try {
                const sports = await sportTypeApi.getAll(); // 기대: [{ sportId, sportNm, ... }]
                const opts = safeArr(sports)
                    .map((s) => ({
                        value: String(s.sportId ?? s.sport_id ?? ""),
                        label: s.sportNm ?? s.sport_nm ?? "-",
                    }))
                    .filter((x) => x.value);
                setSportOptions(opts);
            } catch {
                setSportOptions([]);
            }
        };

        loadFilters();
    }, []);

    const toggleSport = (id) => {
        const sid = String(id);
        setSportIds((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
    };

    const validate = () => {
        const emailVal = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!userName.trim()) return "강사명은 필수입니다.";
        if (!emailVal) return "이메일은 필수입니다.";
        if (!emailRegex.test(emailVal)) return "이메일 형식이 올바르지 않습니다.";
        if (!password.trim()) return "비밀번호는 필수입니다.";
        if (password !== password2) return "비밀번호 확인이 일치하지 않습니다.";
        if (!hireDt) return "입사일은 필수입니다.";
        if (!brchId) return "소속 지점을 선택해주세요.";
        if (sportIds.length === 0) return "주요 종목을 1개 이상 선택해주세요.";
        return "";
    };

    const onSubmit = async () => {
        const v = validate();
        if (v) {
            setErrMsg(v);
            return;
        }

        setSaving(true);
        setErrMsg("");
        try {
            const sports = sportIds.map((id, idx) => ({
                sportId: Number(id),
                mainYn: idx === 0, // 첫 선택을 메인으로
                sortNo: idx + 1,
            }));

            const payload = {
                userName: userName.trim(),
                email: email.trim(),
                password, // 백엔드에서 암호화 처리
                phoneNumber: phoneNumber?.trim() ? phoneNumber.trim() : null,
                brchId: Number(brchId),
                hireDt, // YYYY-MM-DD
                intro: intro?.trim() ? intro.trim() : null,
                profileImgUrl: profileImgUrl?.trim() ? profileImgUrl.trim() : null,
                // updUserId는 선택(없어도 됨)
                sports,

                certificates: certificates
                    .filter((c) => c.certNm || c.issuer || c.acqDt || c.certNo)
                    .map((c) => ({
                        certNm: c.certNm?.trim() || "",
                        issuer: c.issuer?.trim() || "",
                        acqDt: c.acqDt || null,
                        certNo: c.certNo?.trim() || null,
                    })),

                careers: careers
                    .filter((c) => c.orgNm || c.roleNm || c.strtDt || c.endDt)
                    .map((c) => ({
                        orgNm: c.orgNm?.trim() || "",
                        roleNm: c.roleNm?.trim() || "",
                        strtDt: c.strtDt || null,
                        endDt: c.endDt || null,
                    })),
            };

            const created = await createTeacher(payload);
            const newUserId = created?.userId;
            if (newUserId) navigate(`/teachers/${newUserId}`);
            else navigate("/teachers");
        } catch (e) {
            setErrMsg(e?.response?.data?.message || e?.message || "저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="teachers-page">
            <div className="teachers-header">
                <div>
                    <div className="teachers-breadcrumb">SYS - 강사 등록</div>
                    <h2 className="teachers-title">강사 등록</h2>
                </div>

                <button className="btn-sm" onClick={() => navigate("/teachers")} disabled={saving}>
                    목록으로
                </button>
            </div>

            <div className="teachers-content">
                {errMsg && <div className="teachers-error">{errMsg}</div>}

                <div className="panel panel-wide">
                    <div className="panel-title-row">
                        <div className="panel-title">기본 정보</div>
                        <div className="panel-hint">* 필수 입력 항목</div>
                    </div>

                    <div className="form-block">
                        <div className="form-row">
                            <label>
                                강사명 <span className="req">*</span>
                            </label>
                            <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="강사명" />
                        </div>

                        <div className="form-row">
                            <label>
                                이메일 <span className="req">*</span>
                            </label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
                        </div>

                        <div className="form-row">
                            <label>
                                비밀번호 <span className="req">*</span>
                            </label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
                        </div>

                        <div className="form-row">
                            <label>
                                비밀번호 확인 <span className="req">*</span>
                            </label>
                            <input
                                type="password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                placeholder="비밀번호 확인"
                            />
                        </div>

                        <div className="form-row">
                            <label>연락처</label>
                            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="010-1234-5678" />
                        </div>

                        <div className="form-row">
                            <label>
                                입사일 <span className="req">*</span>
                            </label>
                            <input type="date" value={hireDt} onChange={(e) => setHireDt(e.target.value)} />
                        </div>

                        <div className="form-row">
                            <label>
                                소속 지점 <span className="req">*</span>
                            </label>
                            <select value={brchId} onChange={(e) => setBrchId(e.target.value)}>
                                {branchOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label>
                                주요 종목 <span className="req">*</span>
                            </label>
                            <div className="chips">
                                {sportOptions.length === 0 ? (
                                    <div className="hint">종목 목록을 불러오지 못했습니다.</div>
                                ) : (
                                    sportOptions.map((o) => {
                                        const checked = sportIds.includes(o.value);
                                        return (
                                            <button
                                                type="button"
                                                key={o.value}
                                                className={`chip ${checked ? "on" : ""}`}
                                                onClick={() => toggleSport(o.value)}
                                            >
                                                {o.label}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                            <div className="hint">첫 번째로 선택한 종목을 mainYn=true로 저장합니다.</div>
                        </div>

                        <div className="form-row">
                            <label>한줄 소개</label>
                            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="소개 문구" />
                        </div>
                    </div>
                </div>

                <div className="panel panel-wide">
                    <div className="panel-title-row">
                        <div className="panel-title">경력 · 자격증</div>
                        <div className="panel-hint">* 선택</div>
                    </div>

                    <div className="two-col">
                        <div className="sub-panel">
                            <div className="sub-title-row">
                                <div className="sub-title">경력 추가</div>
                                <button type="button" className="btn-sm" onClick={() => setCareers((p) => [...p, newCareer()])}>
                                    + 추가
                                </button>
                            </div>

                            {careers.map((c, idx) => (
                                <div key={idx} className="row-card">
                                    <div className="row-card-grid">
                                        <input
                                            value={c.orgNm}
                                            onChange={(e) => setCareers((p) => p.map((x, i) => (i === idx ? { ...x, orgNm: e.target.value } : x)))}
                                            placeholder="기관/지점명(orgNm)"
                                        />
                                        <input
                                            value={c.roleNm}
                                            onChange={(e) => setCareers((p) => p.map((x, i) => (i === idx ? { ...x, roleNm: e.target.value } : x)))}
                                            placeholder="직무/설명(roleNm)"
                                        />
                                        <input
                                            type="date"
                                            value={c.strtDt}
                                            onChange={(e) => setCareers((p) => p.map((x, i) => (i === idx ? { ...x, strtDt: e.target.value } : x)))}
                                        />
                                        <input
                                            type="date"
                                            value={c.endDt}
                                            onChange={(e) => setCareers((p) => p.map((x, i) => (i === idx ? { ...x, endDt: e.target.value } : x)))}
                                        />
                                    </div>

                                    <div className="row-card-actions">
                                        <button type="button" className="danger-btn" onClick={() => setCareers((p) => p.filter((_, i) => i !== idx))}>
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sub-panel">
                            <div className="sub-title-row">
                                <div className="sub-title">자격증 추가</div>
                                <button type="button" className="btn-sm" onClick={() => setCertificates((p) => [...p, newCertificate()])}>
                                    + 추가
                                </button>
                            </div>

                            {certificates.map((c, idx) => (
                                <div key={idx} className="row-card">
                                    <div className="row-card-grid">
                                        <input
                                            value={c.certNm}
                                            onChange={(e) => setCertificates((p) => p.map((x, i) => (i === idx ? { ...x, certNm: e.target.value } : x)))}
                                            placeholder="자격증명(certNm)"
                                        />
                                        <input
                                            value={c.issuer}
                                            onChange={(e) => setCertificates((p) => p.map((x, i) => (i === idx ? { ...x, issuer: e.target.value } : x)))}
                                            placeholder="발급기관(issuer)"
                                        />
                                        <input
                                            type="date"
                                            value={c.acqDt}
                                            onChange={(e) => setCertificates((p) => p.map((x, i) => (i === idx ? { ...x, acqDt: e.target.value } : x)))}
                                        />
                                        <input
                                            value={c.certNo}
                                            onChange={(e) => setCertificates((p) => p.map((x, i) => (i === idx ? { ...x, certNo: e.target.value } : x)))}
                                            placeholder="자격증번호(certNo)"
                                        />
                                    </div>

                                    <div className="row-card-actions">
                                        <button type="button" className="danger-btn" onClick={() => setCertificates((p) => p.filter((_, i) => i !== idx))}>
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ✅ 프로필 사진: + 클릭 / 드래그앤드롭 지원 */}
                <div className="panel panel-wide">
                    <div className="panel-title">프로필 사진</div>

                    {/* 숨김 파일 input */}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={onPickFile}
                    />

                    {/* URL 입력도 유지 */}
                    <div className="form-row">
                        <label>이미지 URL(선택)</label>
                        <input
                            value={profileImgUrl}
                            onChange={(e) => setProfileImgUrl(e.target.value)}
                            placeholder="https://... 또는 아래에서 파일 선택/드래그"
                        />
                    </div>

                    <div className="upload-box">
                        <div
                            className={`upload-preview ${dragActive ? "drop-active" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={openFilePicker} // ✅ “+” 눌러도 파일 선택
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") openFilePicker();
                            }}
                            onDragEnter={onDragEnter}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            style={{ cursor: "pointer" }}
                            title="클릭 또는 이미지 파일을 드래그해서 업로드"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="preview" />
                            ) : (
                                <div className="upload-placeholder">
                                    <div style={{ fontSize: 22, lineHeight: "22px" }}>+</div>
                                    <div style={{ fontSize: 12, marginTop: 6, color: "#6b7280" }}>클릭 또는 드래그앤드롭</div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button type="button" className="btn-sm" onClick={openFilePicker}>
                                파일 선택
                            </button>
                            <button type="button" className="btn-sm" onClick={clearProfileImg} disabled={!profileImgUrl}>
                                제거
                            </button>
                        </div>
                    </div>

                    <div className="hint">운영용: 파일 업로드 시 Data URL로 변환해 profileImgUrl에 저장합니다.</div>
                </div>

                <div className="form-actions">
                    <button className="btn-primary" onClick={onSubmit} disabled={saving}>
                        저장
                    </button>
                    <button className="btn-sm" onClick={() => navigate("/teachers")} disabled={saving}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}