import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HomeAdmin.css";

export default function AdminHomePage() {
    const location = useLocation();
    const [q, setQ] = useState("");

    const groups = useMemo(
        () => [
            {
                title: "회원 관리",
                items: [
                    { label: "사용자(회원) 관리", path: "/users", desc: "사용자 회원 관리" },
                    { label: "운영자 관리", path: "/usersAdmin", desc: "운영자 관리" },
                    { label: "강사(트레이터) 관리", path: "/teachers", desc: "강사(트레이너) 관리" },
                ],
            },
            {
                title: "운동 관리",
                items: [
                    { label: "운동 종목 관리", path: "/sports", desc: "운동 종목(헬스, 요가, ...) 기준정보 관리" },
                ],
            },
            {
                title: "센터 관리",
                items: [
                    { label: "센터 관리(메인)", path: "/branches", desc: "센터(지점) 관리" },
                    { label: "센터 스케줄 관리", path: "/schedules", desc: "일정/스케줄 관리" },
                ],
            },
            {
                title: "예약 관리",
                items: [
                    { label: "예약 관리", path: "/reservations", desc: "회원 운동 예약 현황/처리" },
                ],
            },
            {
                title: "이용권 거래 관리",
                items: [
                    { label: "이용권 거래 내역", path: "/trades", desc: "회원간 이용권 거래 내역" },
                    { label: "이용권 거래 통계", path: "/marketstats", desc: "회원간 이용권 거래 통계" },
                    { label: "이용권 거래 게시판 관리", path: "/markets", desc: "회원 이용권 매매 게시물 관리" },
                ],
            },
            {
                title: "이용권 관리",
                items: [
                    { label: "이용권 현황", path: "/tickets", desc: "이용권 현황 조회 및 관리" },
                    { label: "이용권 상품 관리", path: "/products", desc: "이용권 상품 관리" },
                    { label: "이용권 이용 통계", path: "/ticketstats", desc: "이용권 이용 통계" },
                ],
            },
            {
                title: "결제 관리",
                items: [
                    { label: "결제 내역 관리", path: "/payment", desc: "결제 내역 조회 및 관리" },
                ],
            },            {
                title: "강사 관리",
                items: [
                    { label: "내 수업 관리", path: "/myclass", desc: "강사가 본인의 수업을 관리합니다" },
                    // { label: "출석관리", path: "/attendance", desc: "내 수업 리스트" },
                ],
            },
            {
                title: "공지사항 및 FAQ",
                items: [
                    { label: "커뮤니티", path: "/community", desc: "커뮤니티 게시글 관리" },
                    { label: "FAQ", path: "/AdminFaqPage", desc: "자주 묻는 질문 관리" },
                    { label: "공지사항", path: "/notice", desc: "공지 게시글 등록/관리" },
                ],
            },
        ],
        []
    );

    const normalized = q.trim().toLowerCase();
    const filteredGroups = useMemo(() => {
        if (!normalized) return groups;

        return groups
            .map((g) => ({
                ...g,
                items: g.items.filter((it) => {
                    const hay = `${it.label} ${it.desc ?? ""} ${it.path}`.toLowerCase();
                    return hay.includes(normalized);
                }),
            }))
            .filter((g) => g.items.length > 0);
    }, [groups, normalized]);

    return (
        <div className="admin-home">
            <div className="admin-home__header">
                <div>
                    <h1 className="admin-home__title">관리자 메인</h1>
                    <p className="admin-home__subtitle">
                        원하는 메뉴를 빠르게 찾아 이동하세요. (현재 위치: <code>{location.pathname}</code>)
                    </p>
                </div>

                <div className="admin-home__search">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="메뉴 검색 (예: 예약, 강사, 결제...)"
                        aria-label="메뉴 검색"
                    />
                    {q && (
                        <button type="button" onClick={() => setQ("")}>
                            초기화
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-home__grid">
                {filteredGroups.map((group) => (
                    <section key={group.title} className="admin-home__section">
                        <h2 className="admin-home__section-title">{group.title}</h2>

                        <div className="admin-home__cards">
                            {group.items.map((item) => (
                                <Link key={item.path} to={item.path} className="admin-home__card">
                                    <div className="admin-home__card-top">
                                        <span className="admin-home__card-title">{item.label}</span>
                                        <span className="admin-home__card-path">{item.path}</span>
                                    </div>
                                    {item.desc && <p className="admin-home__card-desc">{item.desc}</p>}
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}

                {filteredGroups.length === 0 && (
                    <div className="admin-home__empty">
                        <p>검색 결과가 없어요.</p>
                        <button type="button" onClick={() => setQ("")}>
                            검색 초기화
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
