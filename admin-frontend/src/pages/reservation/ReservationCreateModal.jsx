import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import reservationApi from "../../api/reservationApi";
import passApi from "../../api/passApi";
import scheduleApi from "../../api/scheduleApi";
import "./ReservationCalendar.css";

const ReservationCreateModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: "",
    schdId: "",
    passId: "",
    rsvDt: "",
    rsvTime: "",
  });

  const [userKeyword, setUserKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userPasses, setUserPasses] = useState([]); // 회원의 이용권 목록
  const [selectedPass, setSelectedPass] = useState(null); // 선택된 이용권 정보
  const [availableSchedules, setAvailableSchedules] = useState([]); // 필터링된 스케줄 목록
  const [scheduledDates, setScheduledDates] = useState([]); // 선택 가능 날짜 목록 (종목별)

  // 1. 회원 검색 및 이용권 로드
  const handleUserSearch = async () => {
    try {
      const res = await passApi.searchUsers(userKeyword);
      setSearchResults(res.data || []);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`회원 검색 실패: ${msg}`);
    }
  };

  const handleSelectUser = async (userId) => {
    setFormData({ ...formData, userId });
    try {
      const res = await passApi.getUserPasses(userId);
      setUserPasses(res.data || []);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`이용권 로드 실패: ${msg}`);
    }
  };

  // 2. 이용권 선택 시 종목 정보(sportId) 추출 및 해당 종목의 날짜 조회
  const handlePassSelect = async (passId) => {
    const pass = userPasses.find((p) => p.passId === Number(passId));
    setSelectedPass(pass);
    setFormData({ ...formData, passId: Number(passId), schdId: "", rsvDt: "" });

    if (pass) {
      try {
        // 종목별 스케줄 날짜 조회 (sportId 파라미터 전달)
        const res = await scheduleApi.getScheduledDates(pass.sportId);
        setScheduledDates(res.data || []);
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "오류가 발생했습니다.";
        alert(`날짜 목록 로드 실패: ${msg}`);
      }
    }
  };

  // 3. 캘린더에서 날짜 선택 시 핸들러
  const handleCalendarChange = (date) => {
    // 날짜 객체를 YYYY-MM-DD 형식의 문자열로 변환
    const formattedDate = date.toLocaleDateString("en-CA");
    setFormData({ ...formData, rsvDt: formattedDate, schdId: "" });
    handleDateChange(formattedDate);
  };

  // 4. 핵심 기능: 수업이 없는 날짜는 클릭 불가능하게 설정
  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toLocaleDateString("en-CA");
      return !scheduledDates.includes(dateString);
    }
  };

  // 5. 날짜 아래에 점으로 수업 가능 여부 시각화
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toLocaleDateString("en-CA");
      return scheduledDates.includes(dateStr) ? (
        <div className="dot"></div>
      ) : null;
    }
  };

  // 3. 날짜 선택 시 해당 날짜의 스케줄을 가져와서 종목 필터링
  const onDateChange = (e) => {
    const selectedDate = e.target.value;
    // scheduledDates에 포함되지 않은 날짜라면 경고 후 초기화
    if (selectedDate && !scheduledDates.includes(selectedDate)) {
      alert("해당 종목의 수업이 없는 날짜입니다.");
      setFormData({ ...formData, rsvDt: "" });
      return;
    }
    handleDateChange(selectedDate);
  };

  // 4. 날짜 선택 시 해당 날짜의 스케줄을 가져와서 종목 필터링
  const handleDateChange = async (date) => {
    setFormData({ ...formData, rsvDt: date, schdId: "" });
    if (!selectedPass) {
      alert("이용권을 먼저 선택해주세요.");
      return;
    }

    if (!date) return;

    try {
      const res = await scheduleApi.getSchedulesByDate(date);
      setAvailableSchedules(res.data || []);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`스케줄 로드 실패: ${msg}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 빈 값 제거 및 정제
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    
    // 디버깅 로그
    console.log("📤 예약 생성 요청 데이터:", formData);
    console.log("📤 정제된 데이터:", cleanData);
    console.log("📤 JSON 형식:", JSON.stringify(cleanData));
    
    try {
      await reservationApi.createReservation(cleanData);
      alert("예약이 정상 등록되었습니다.");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ 예약 생성 실패:", err);
      console.error("❌ 응답 상태:", err.response?.status);
      console.error("❌ 응답 데이터:", err.response?.data);
      const msg =
        err.response?.data?.message || err.message || "오류가 발생했습니다.";
      alert(`등록 실패: ${msg}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📅 예약 수동 등록</h3>
        <form onSubmit={handleSubmit}>
          {/* 회원 검색 영역 */}
          <div className="input-group">
            <label>회원 선택</label>
            <div style={{ display: "flex", gap: "5px" }}>
              <input
                value={userKeyword}
                onChange={(e) => setUserKeyword(e.target.value)}
                placeholder="회원명/ID"
              />
              <button type="button" onClick={handleUserSearch}>
                검색
              </button>
            </div>
            {searchResults.length > 0 && (
              <select
                className="input-field"
                onChange={(e) => handleSelectUser(e.target.value)}
              >
                <option value="">회원 선택</option>
                {searchResults.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.userName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 이용권 선택 */}
          <div className="input-group">
            <label>이용권 선택</label>
            <select
              className="input-field"
              onChange={(e) => handlePassSelect(e.target.value)}
            >
              <option value="">사용할 이용권 선택</option>
              {userPasses.map((p) => (
                <option key={p.passId} value={p.passId}>
                  {p.sportName} (잔여: {p.remainingCount}회)
                </option>
              ))}
            </select>
          </div>

          {/* 스케줄 선택 영역 */}
          <div className="input-group">
            <label>수업 날짜 (활성화된 날짜만 가능)</label>
            <input
              type="date"
              className="input-field"
              value={formData.rsvDt}
              onChange={onDateChange}
              disabled={!selectedPass} // 이용권 선택 전에는 비활성화
            />
            <div
              className="calendar-container"
              style={{
                marginTop: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {selectedPass ? (
                <Calendar
                  onChange={handleCalendarChange}
                  value={
                    formData.rsvDt
                      ? new Date(formData.rsvDt + "T00:00:00")
                      : null
                  }
                  tileDisabled={tileDisabled}
                  calendarType="gregory"
                  className="erp-calendar"
                  tileContent={tileContent}
                />
              ) : (
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    padding: "20px",
                    margin: 0,
                  }}
                >
                  이용권을 먼저 선택해주세요
                </p>
              )}
            </div>
            {formData.rsvDt && (
              <small
                style={{ color: "#007bff", display: "block", marginTop: "5px" }}
              >
                선택된 날짜: {formData.rsvDt}
              </small>
            )}
          </div>

          <div className="input-group">
            <label>수업 시간/프로그램 선택</label>
            <select
              className="input-field"
              disabled={!availableSchedules.length}
              onChange={(e) => {
                const s = availableSchedules.find(
                  (sch) => sch.schdId === Number(e.target.value)
                );
                setFormData({
                  ...formData,
                  schdId: s.schdId,
                  rsvTime: s.strtTm,
                });
              }}
            >
              <option value="">수업을 선택하세요</option>
              {availableSchedules.map((s) => (
                <option key={s.schdId} value={s.schdId}>
                  [{s.strtTm?.substring(0, 5)}] {s.programName} (
                  {s.instructorName})
                </option>
              ))}
            </select>
          </div>

          <div
            className="modal-actions"
            style={{ marginTop: "20px", textAlign: "right", display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}
          >
            <button type="button" className="ghost-btn" onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className="create-btn"
              disabled={!formData.userId || !formData.passId || !formData.schdId}
            >
              예약 확정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationCreateModal;
