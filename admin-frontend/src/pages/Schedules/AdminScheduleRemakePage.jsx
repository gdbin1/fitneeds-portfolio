import React, { useEffect, useState } from 'react';
import api from '../../api';
import './css/AdminScheduleRemakePage.css';
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

const AdminScheduleRemakePage = () => {
    // ===================== 상태 / 필드 선언 ==============================
    // 지점 데이터 (지점 필터용) 상태
    const [branches, setBranches] = useState([]);
    const [branchLoading, setBranchLoading] = useState(false);
    const [branchError, setBranchError] = useState(null);
    // 지점 필터 선택 지점 상태
    const [selectedBranch, setSelectedBranch] = useState({
        brchId: 'ALL',
        brchNm: '전체 지점',
    });

    // 스케줄 데이터 상태
    const [calendarSchedules, setCalendarSchedules] = useState([]);

    // 캘린더 모드 상태
    const [viewMode, setViewMode] = useState('month');

    // 모달 상태
    const [showModal, setShowModal] = useState(false);

    // 날짜 상태
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    // ===================== 상태 / 필드 선언 ==============================


    // ================================= 지점 관련 =================================//
    // 지점 데이터 불러오기 API 호출
    const loadAllBranches = async () => {
        setBranchLoading(true);
        setBranchError(null);
        try {
            const data = await api.get('/branch');
            setBranches(data.data);
        } catch (e) {
            console.error(e.message);
            setBranchError(e.message);
        } finally {
            setBranchLoading(false);
        }
    }

    // 지점 필터 변환 함수
    const handleChangeBranch = (e) => {
        const value = e.target.value;

        if (value === "ALL") {
            setSelectedBranch({ brchId: "ALL", brchNm: "전체 지점" });
            return;
        }

        const found = branches.find((b) => String(b.brchId) === String(value));
        setSelectedBranch({ brchId: value, brchNm: found?.brchNm ?? "" });
    };
    // ================================= 지점 관련 =================================//

    // ================================= 스케줄 관련 =================================//
    const loadCalendarSchedule = async () => {
        const from = viewMode === "month"
            ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
            : startOfWeek(currentDate, { weekStartsOn: 0 })

        const to = viewMode === "month"
            ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
            : endOfWeek(currentDate, { weekStartsOn: 0 });

        const params = {
            fromDt: format(from, "yyyy-MM-dd"),
            toDt: format(to, "yyyy-MM-dd"),
        }

        if (selectedBranch?.brchId && selectedBranch.brchId !== "ALL") {
            params.brchId = Number(selectedBranch.brchId);
        }

        try {
            const res = await api.get(`/schedule/calendar`, { params });
            setCalendarSchedules(res.data);
        } catch (e) {
            console.error(e.message);
        }
    }
    // ================================= 스케줄 관련 =================================//

    // 데이터 호출
    useEffect(() => {
        loadAllBranches();
    }, []);

    useEffect(() => {
        loadCalendarSchedule();
    }, [selectedBranch, viewMode, currentDate]);

    // ================= 캘린더 페이징 버튼 =====================
    const handlePrev = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
        } else {
            setCurrentDate(subWeeks(currentDate, 1))
        }
    }

    const handleNext = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
        } else {
            setCurrentDate(addWeeks(currentDate, 1))
        }
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }
    // ================= 캘린더 페이징 버튼 =====================

    const getKoreanHolidayName = (date) => {
        const month = date.getMonth() + 1
        const day = date.getDate()
        const year = date.getFullYear()

        const fixedHolidays = {
            '1-1': '신정',
            '3-1': '삼일절',
            '5-5': '어린이날',
            '6-6': '현충일',
            '8-15': '광복절',
            '10-3': '개천절',
            '10-9': '한글날',
            '12-25': '크리스마스'
        }

        const key = `${month}-${day}`
        if (fixedHolidays[key]) return fixedHolidays[key]

        const lunarHolidays = {
            2024: [
                { month: 2, day: 10, name: '설날' },
                { month: 2, day: 11, name: '설날' },
                { month: 2, day: 12, name: '설날' },
                { month: 5, day: 15, name: '부처님오신날' },
                { month: 9, day: 16, name: '추석' },
                { month: 9, day: 17, name: '추석' },
                { month: 9, day: 18, name: '추석' }
            ],
            2025: [
                { month: 1, day: 28, name: '설날' },
                { month: 1, day: 29, name: '설날' },
                { month: 1, day: 30, name: '설날' },
                { month: 5, day: 5, name: '부처님오신날' },
                { month: 10, day: 5, name: '추석' },
                { month: 10, day: 6, name: '추석' },
                { month: 10, day: 7, name: '추석' }
            ],
            2026: [
                { month: 2, day: 16, name: '설날' },
                { month: 2, day: 17, name: '설날' },
                { month: 2, day: 18, name: '설날' },
                { month: 5, day: 24, name: '부처님오신날' },
                { month: 9, day: 24, name: '추석' },
                { month: 9, day: 25, name: '추석' },
                { month: 9, day: 26, name: '추석' }
            ]
        }

        const yearHolidays = lunarHolidays[year] || []
        const holiday = yearHolidays.find(h => h.month === month && h.day === day)
        return holiday ? holiday.name : null
    }

    const isKoreanHoliday = (date) => getKoreanHolidayName(date) !== null

    const getSchedulesForDate = (date) => {
        if (!calendarSchedules) return []
        const dateStr = format(date, 'yyyy-MM-dd')
        return calendarSchedules.filter(s => s.strtDt === dateStr)
    }

    const getStatusColor = (sttsCd) => {
    switch (sttsCd) {
      case 'OPEN': return '#28a745'
      case 'CLOSED': return '#dc3545'
      case 'UNAVAILABLE': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedDate(null)
  }

  const handleDateClick = (date) => {
    if (isKoreanHoliday(date)) {
      alert('공휴일 및 휴일에는 스케줄을 등록할 수 없습니다.')
      return
    }
    
    setSelectedDate(date)
    const dateStr = format(date, 'yyyy-MM-dd')
    setFormData({
      scheduleDate: dateStr,
      startDate: dateStr,
      endDate: dateStr,
      repeatType: 'none',
      selectedDays: []
    })
    setShowModal(true)
  }

  const handleScheduleClick = (schedule) => {
    const strtDt = schedule.strtDt || schedule.scheduleDate || ''
    const endDt = schedule.endDt || schedule.scheduleDate || ''
    // 시작일과 종료일이 다르면 기간, 같으면 단일
    const isRange = strtDt !== endDt && endDt
    setShowModal(true)
  }

    // 월간 보기 기능
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
        const days = []
        let day = calendarStart
        while (day <= calendarEnd) {
            days.push(new Date(day))
            day = addDays(day, 1)
        }

        const weekDays = ['일', '월', '화', '수', '목', '금', '토']

        return (
            <div className="sch-card">
                <div className="sch-month-weekdays">
                    {weekDays.map((d) => (
                        <div
                            key={d}
                            className={[
                                "sch-weekday",
                                d === "일" ? "is-sun" : "",
                                d === "토" ? "is-sat" : "",
                            ].join(" ")}
                        >
                            {d}
                        </div>
                    ))}
                </div>

                <div className="sch-month-grid">
                    {days.map((d, idx) => {
                        const daySchedules = getSchedulesForDate(d);
                        const isHoliday = isKoreanHoliday(d);
                        const isToday = isSameDay(d, new Date());
                        const isCurrMonth = isSameMonth(d, currentDate);

                        return (
                            <div
                                key={idx}
                                onClick={() => handleDateClick(d)}
                                className={[
                                    "sch-day-cell",
                                    isToday ? "is-today" : "",
                                    isHoliday ? "is-holiday" : "",
                                    !isCurrMonth ? "is-outside" : "",
                                    isHoliday ? "is-disabled" : "",
                                ].join(" ")}
                            >
                                <div className="sch-day-top">
                                    <span
                                        className={[
                                            "sch-day-num",
                                            isHoliday ? "is-holiday-text" : "",
                                            !isCurrMonth ? "is-outside-text" : "",
                                        ].join(" ")}
                                    >
                                        {format(d, "d")}
                                    </span>

                                    {isHoliday && (
                                        <span className="sch-holiday-name">
                                            {getKoreanHolidayName(d)}
                                        </span>
                                    )}
                                </div>

                                <div className="sch-day-items">
                                    {daySchedules.slice(0, 3).map((s, i) => {
                                        return (
                                            <div
                                                key={s.schdId}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleScheduleClick(s);
                                                }}
                                                className="sch-chip"
                                                style={{ background: getStatusColor(s.sttsCd) }} // 색상은 기존 함수 유지
                                            >
                                                {daySchedules[i].strtTm} - {daySchedules[i].progNm}
                                            </div>
                                        );
                                    })}
                                    {daySchedules.length > 3 && (
                                        <div className="sch-more">+{daySchedules.length - 3}개 더보기</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // 주간 보기 기능
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
        const weekDaysLabels = ['일', '월', '화', '수', '목', '금', '토']

        return (
            <div className="sch-card">
                <div className="sch-week-grid">
                    {weekDays.map((d, idx) => {
                        const daySchedules = getSchedulesForDate(d);
                        const isHoliday = isKoreanHoliday(d);
                        const isToday = isSameDay(d, new Date());

                        return (
                            <div
                                key={idx}
                                className={[
                                    "sch-week-col",
                                    isToday ? "is-today" : "",
                                    isHoliday ? "is-holiday" : "",
                                ].join(" ")}
                            >
                                <div className="sch-week-head">
                                    <div className="sch-week-label">{weekDaysLabels[idx]}</div>
                                    <div className="sch-week-date">{format(d, "d")}</div>
                                    {isHoliday && (
                                        <div className="sch-holiday-name">
                                            {getKoreanHolidayName(d)}
                                        </div>
                                    )}
                                </div>

                                <div className="sch-week-body">
                                    {daySchedules.map((s) => {
                                        const prog =
                                            programs.find((p) => p.progId === s.progId) ||
                                            allPrograms.find((p) => p.progId === s.progId);

                                        return (
                                            <div
                                                key={s.schdId}
                                                onClick={() => handleScheduleClick(s)}
                                                className="sch-week-item"
                                                style={{ background: getStatusColor(s.sttsCd) }}
                                            >
                                                <div className="sch-week-item-time">
                                                    {s.strtTm?.substring(0, 5)} - {s.endTm?.substring(0, 5)}
                                                </div>
                                                <div className="sch-week-item-title">
                                                    {prog?.progNm || "수업"}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {!isHoliday && (
                                        <button
                                            onClick={() => handleDateClick(d)}
                                            className="sch-add-btn"
                                            type="button"
                                        >
                                            + 추가
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="sch-page">
            {/* 헤더 영역 */}
            <div className="sch-header">
                <div>
                    <h1 className="sch-title">
                        <span className="sch-branch">
                            [{selectedBranch === "ALL" ? "전체 지점" : selectedBranch?.brchNm}]
                        </span>{" "}
                        스케줄 관리
                    </h1>
                    <p className="sch-subtitle">{format(currentDate, "yyyy년 MM월", { locale: ko })}</p>
                </div>


                <div className="sch-header-actions">
                    <select
                        value={selectedBranch.brchId || ""}
                        onChange={handleChangeBranch}
                        className="sch-select"
                    >
                        <option value="ALL">전체 지점</option>
                        {branchError ? (
                            <option value="error">
                                데이터를 불러오는 데 실패 했습니다.
                            </option>
                        ) : (
                            branchLoading ? (
                                <option value="loading">
                                    로딩 중
                                </option>
                            ) : (
                                branches.map((branch) => (
                                    <option
                                        key={branch.brchId}
                                        value={branch.brchId}
                                    >
                                        {branch.brchNm}
                                    </option>
                                ))
                            ))}
                    </select>

                    <button
                        onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}
                        className="sch-primary-btn"
                        type="button"
                    >
                        {viewMode === "month" ? "주간 보기" : "월간 보기"}
                    </button>
                </div>
            </div>

            {/* 네비 영역 */}
            <div className="sch-nav">
                <button onClick={handlePrev} className="sch-ghost-btn" type="button">이전</button>
                <button onClick={handleToday} className="sch-ghost-btn" type="button">오늘</button>
                <button onClick={handleNext} className="sch-ghost-btn" type="button">다음</button>
            </div>

            {viewMode === "month" ? renderMonthView() : renderWeekView()}

            {/* {showModal && (
                <div className="sch-modal-overlay" onClick={handleCloseModal}>
                    <div className="sch-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sch-modal-head">
                            <h2 className="sch-modal-title">{editingSchedule ? "스케줄 수정" : "스케줄 추가"}</h2>
                            <button className="sch-modal-close" onClick={handleCloseModal} type="button">✕</button>
                        </div>

                        <div className="sch-form">
                        </div>

                        <div className="sch-modal-actions">
                            {editingSchedule && (
                                <button onClick={handleDelete} className="sch-danger-btn" type="button">
                                    🗑️ {dateMode === "range" ? "기간 삭제" : "삭제"}
                                </button>
                            )}
                            <button onClick={handleCloseModal} className="sch-secondary-btn" type="button">취소</button>
                            <button onClick={handleSave} className="sch-primary-btn" type="button">저장</button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default AdminScheduleRemakePage;