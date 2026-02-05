import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarModal.css';

const CalendarModal = ({ sessions: rawSessions = [], isOpen, onClose, strtDt, endDt, onSelectDate, selectedDate, onProceedToPayment }) => {
    // 캘린더에 표시될 날짜 (prop selectedDate와 별개로, 캘린더 내부 상태)
    const [calendarValue, setCalendarValue] = useState(selectedDate || new Date());

    if (!isOpen) return null;

    const sessions = Array.isArray(rawSessions)
        ? rawSessions
        : (rawSessions?.data || rawSessions?.sessions || []);

    // 2. 이제 sessions.length 체크
    if (sessions.length === 0) {
        console.log("전달받은 데이터:", rawSessions); // 디버깅용
    }

    const activeDates = new Set(sessions.map(s => s.date));

    const minDate = strtDt ? new Date(strtDt + 'T00:00:00') : null;
    const maxDate = endDt ? new Date(endDt + 'T00:00:00') : null;

    // 특정 날짜에 스케줄이 있는지 확인하는 함수
    const isDateActive = (calendarDate) => {
        const year = calendarDate.getFullYear();
        const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
        const day = String(calendarDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        return activeDates.has(dateString); // sessions에 포함된 날짜인지 확인
    };

    // 각 날짜 타일에 적용할 CSS 클래스를 반환
    const tileClassName = ({ date: calendarDate, view }) => {
        if (view === 'month') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDate = new Date(calendarDate);
            checkDate.setHours(0, 0, 0, 0);

            if (checkDate.getTime() < today.getTime()) return true;
            if (minDate && checkDate < new Date(new Date(minDate).setHours(0, 0, 0, 0))) return true;
            if (maxDate && checkDate > new Date(new Date(maxDate).setHours(0, 0, 0, 0))) return true;

            // 여기서 sessions에 없는 날짜는 모두 비활성화됩니다.
            if (!isDateActive(calendarDate)) {
                return true;
            }

        }
        return false;
    };

    // 각 날짜 타일을 비활성화할지 여부 반환
    const tileDisabled = ({ date: calendarDate, view }) => {
        if (view === 'month') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 오늘 날짜의 시/분/초를 0으로 초기화

            // 복사본을 만들어 비교 (원본 변조 방지)
            const checkDate = new Date(calendarDate);
            checkDate.setHours(0, 0, 0, 0);

            // 1. 오늘보다 이전 날짜만 비활성화 (오늘 포함)
            if (checkDate.getTime() < today.getTime()) {
                return true;
            }

            // 2. minDate/maxDate 범위 밖 비활성화
            // minDate와 maxDate도 위에서 T00:00:00을 붙여 생성했으므로 비교 가능합니다.
            if (minDate && checkDate < new Date(new Date(minDate).setHours(0, 0, 0, 0))) {
                return true;
            }
            if (maxDate && checkDate > new Date(new Date(maxDate).setHours(0, 0, 0, 0))) {
                return true;
            }

            // 3. 백엔드 예약 가능 여부 확인
            if (!isDateActive(calendarDate)) {
                return true;
            }
        }
        return false;
    };

    const handleDateChange = (value) => {
        setCalendarValue(value);
        onSelectDate(value); // 부모 컴포넌트로 선택된 날짜 전달
    };

    const customFormatShortWeekday = (locale, date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <h2>날짜 선택</h2>

                {/* sessions가 비어있다면 데이터가 없는 것으로 간주 */}
                {sessions.length === 0 ? (
                    <p className="error-message">선택 가능한 예약 날짜가 없습니다.</p>
                ) : (
                    <Calendar
                        locale="ko-KR"
                        onChange={handleDateChange}
                        value={calendarValue}
                        minDate={minDate}
                        maxDate={maxDate}
                        calendarType="gregory"
                        className="react-calendar-custom"
                        formatDay={(locale, date) => date.getDate()}
                        formatShortWeekday={customFormatShortWeekday}
                        tileClassName={tileClassName}
                        tileDisabled={tileDisabled}
                    />
                )}

                <div className="modal-footer">
                    <button
                        className="payment-button"
                        onClick={onProceedToPayment}
                        disabled={!selectedDate} // 날짜를 선택해야만 결제 가능
                    >
                        결제하기
                    </button>
                    <button onClick={onClose} className="close-button">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;