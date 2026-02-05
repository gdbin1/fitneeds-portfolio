USE fitneedsdb;

-- =========================================================
-- ✅ 세션/문자열 비교를 UTF8MB4_UNICODE_CI로 강제 (혼합 collation 대응)
-- =========================================================
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 배정된 수업(SCHEDULE) 더미 데이터 생성
-- =========================================================

-- 더미 강사(USERS_ADMIN.user_id) - 문자열 변수도 unicode_ci로 고정
SET @T1 := _utf8mb4 '3A1C1111-2222-3333-4444-555555555555' COLLATE utf8mb4_unicode_ci;
SET @T2 := _utf8mb4 '7B2D1111-2222-3333-4444-555555555555' COLLATE utf8mb4_unicode_ci;

-- 지점/종목 ID 조회 (비교 양쪽에 COLLATE 강제)
SET @BR1 := (
    SELECT brch_id
    FROM BRANCH
    WHERE brch_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_강남점' COLLATE utf8mb4_unicode_ci
    ORDER BY brch_id DESC
    LIMIT 1
);

SET @BR2 := (
    SELECT brch_id
    FROM BRANCH
    WHERE brch_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_홍대점' COLLATE utf8mb4_unicode_ci
    ORDER BY brch_id DESC
    LIMIT 1
);

SET @SP1 := (
    SELECT sport_id
    FROM SPORT_TYPE
    WHERE sport_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_PT' COLLATE utf8mb4_unicode_ci
    ORDER BY sport_id DESC
    LIMIT 1
);

SET @SP2 := (
    SELECT sport_id
    FROM SPORT_TYPE
    WHERE sport_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_필라테스' COLLATE utf8mb4_unicode_ci
    ORDER BY sport_id DESC
    LIMIT 1
);

SET @SP3 := (
    SELECT sport_id
    FROM SPORT_TYPE
    WHERE sport_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_요가' COLLATE utf8mb4_unicode_ci
    ORDER BY sport_id DESC
    LIMIT 1
);

-- =========================================================
-- 0) 사전 체크: 지점/종목이 없으면 sport_id NULL 에러가 나므로 가드
--     (DB 담당자 스키마는 건드리지 않고, 더미 스크립트에서만 방어)
-- =========================================================
SELECT
    @BR1 AS br1, @BR2 AS br2,
    @SP1 AS sp1, @SP2 AS sp2, @SP3 AS sp3;

-- =========================================================
-- 1) PROGRAM 생성 (프로그램이 있어야 스케줄 생성 가능)
--    - sport_id가 NULL이면 INSERT 자체를 스킵하도록 WHERE에 가드
-- =========================================================
INSERT INTO PROGRAM (prog_nm, sport_id, brch_id, use_yn, one_time_amt, reg_dt, upd_dt)
SELECT 'DUMMY_강남PT', @SP1, @BR1, 1, 50000.0000, NOW(), NOW()
WHERE @SP1 IS NOT NULL AND @BR1 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM PROGRAM
    WHERE prog_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_강남PT' COLLATE utf8mb4_unicode_ci
);

INSERT INTO PROGRAM (prog_nm, sport_id, brch_id, use_yn, one_time_amt, reg_dt, upd_dt)
SELECT 'DUMMY_강남필라테스', @SP2, @BR1, 1, 40000.0000, NOW(), NOW()
WHERE @SP2 IS NOT NULL AND @BR1 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM PROGRAM
    WHERE prog_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_강남필라테스' COLLATE utf8mb4_unicode_ci
);

INSERT INTO PROGRAM (prog_nm, sport_id, brch_id, use_yn, one_time_amt, reg_dt, upd_dt)
SELECT 'DUMMY_홍대요가', @SP3, @BR2, 1, 35000.0000, NOW(), NOW()
WHERE @SP3 IS NOT NULL AND @BR2 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM PROGRAM
    WHERE prog_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_홍대요가' COLLATE utf8mb4_unicode_ci
);

SET @PROG1 := (
    SELECT prog_id
    FROM PROGRAM
    WHERE prog_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_강남PT' COLLATE utf8mb4_unicode_ci
    ORDER BY prog_id DESC
    LIMIT 1
);

SET @PROG2 := (
    SELECT prog_id
    FROM PROGRAM
    WHERE prog_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_강남필라테스' COLLATE utf8mb4_unicode_ci
    ORDER BY prog_id DESC
    LIMIT 1
);

SET @PROG3 := (
    SELECT prog_id
    FROM PROGRAM
    WHERE prog_nm COLLATE utf8mb4_unicode_ci
              = _utf8mb4 'DUMMY_홍대요가' COLLATE utf8mb4_unicode_ci
    ORDER BY prog_id DESC
    LIMIT 1
);

-- =========================================================
-- 2) SCHEDULE 생성 (강사별 배정된 수업)
--    - 동일 더미가 중복 insert 되는 걸 피하려면 WHERE NOT EXISTS로 막고 싶지만
--      여기서는 UI 확인 목적이므로 "기본: 매번 추가" 형태 유지
--    - 대신, prog_id/brch_id/user_id NULL이면 INSERT 스킵 가드
-- =========================================================

-- 더미강사1 (@T1) - 강남점 PT 및 필라테스
INSERT INTO SCHEDULE (prog_id, user_id, brch_id, strt_dt, strt_tm, end_tm, max_nop_cnt, rsv_cnt, stts_cd, description, reg_dt, upd_dt)
SELECT * FROM (
                  SELECT @PROG1 AS prog_id, @T1 AS user_id, @BR1 AS brch_id, DATE_SUB(CURDATE(), INTERVAL 2 DAY) AS strt_dt, '09:00:00' AS strt_tm, '10:00:00' AS end_tm, 5 AS max_nop_cnt, 4 AS rsv_cnt, 'COMPLETED' AS stts_cd, 'PT 개인 레슨' AS description, NOW() AS reg_dt, NOW() AS upd_dt
                  UNION ALL
                  SELECT @PROG1, @T1, @BR1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', 5, 5, 'COMPLETED', 'PT 개인 레슨', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG1, @T1, @BR1, CURDATE(), '14:00:00', '15:00:00', 5, 3, 'CONFIRMED', 'PT 오후 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG2, @T1, @BR1, CURDATE(), '16:00:00', '17:00:00', 10, 7, 'CONFIRMED', '필라테스 그룹 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG1, @T1, @BR1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', 5, 2, 'CONFIRMED', 'PT 개인 레슨', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG2, @T1, @BR1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:00:00', 10, 5, 'CONFIRMED', '필라테스 그룹 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG1, @T1, @BR1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '15:00:00', 5, 1, 'CONFIRMED', 'PT 개인 레슨', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG2, @T1, @BR1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '11:00:00', 10, 0, 'OPEN', '필라테스 그룹 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG1, @T1, @BR1, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '15:00:00', '16:00:00', 5, 0, 'OPEN', 'PT 개인 레슨', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG2, @T1, @BR1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '11:00:00', '12:00:00', 10, 0, 'OPEN', '필라테스 그룹 수업', NOW(), NOW()
              ) x
WHERE @T1 IS NOT NULL
  AND @BR1 IS NOT NULL
  AND @PROG1 IS NOT NULL
  AND @PROG2 IS NOT NULL;

-- 더미강사2 (@T2) - 홍대점 요가
INSERT INTO SCHEDULE (prog_id, user_id, brch_id, strt_dt, strt_tm, end_tm, max_nop_cnt, rsv_cnt, stts_cd, description, reg_dt, upd_dt)
SELECT * FROM (
                  SELECT @PROG3 AS prog_id, @T2 AS user_id, @BR2 AS brch_id, DATE_SUB(CURDATE(), INTERVAL 3 DAY) AS strt_dt, '08:00:00' AS strt_tm, '09:00:00' AS end_tm, 15 AS max_nop_cnt, 12 AS rsv_cnt, 'COMPLETED' AS stts_cd, '아침 요가' AS description, NOW() AS reg_dt, NOW() AS upd_dt
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '18:00:00', '19:00:00', 15, 15, 'COMPLETED', '저녁 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', 15, 10, 'COMPLETED', '요가 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, CURDATE(), '08:00:00', '09:00:00', 15, 8, 'CONFIRMED', '아침 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, CURDATE(), '19:00:00', '20:00:00', 15, 11, 'CONFIRMED', '저녁 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', 15, 6, 'CONFIRMED', '아침 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', 15, 9, 'CONFIRMED', '저녁 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '11:00:00', 15, 3, 'CONFIRMED', '요가 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:00:00', '09:00:00', 15, 0, 'OPEN', '아침 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:00:00', '20:00:00', 15, 0, 'OPEN', '저녁 요가', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00', '11:00:00', 15, 0, 'OPEN', '요가 수업', NOW(), NOW()
                  UNION ALL
                  SELECT @PROG3, @T2, @BR2, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '18:00:00', '19:00:00', 15, 0, 'OPEN', '저녁 요가', NOW(), NOW()
              ) x
WHERE @T2 IS NOT NULL
  AND @BR2 IS NOT NULL
  AND @PROG3 IS NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 검증 쿼리
-- =========================================================
SELECT
    s.schd_id,
    s.user_id,
    ua.user_name AS 강사명,
    p.prog_nm AS 프로그램명,
    b.brch_nm AS 지점명,
    s.strt_dt AS 수업날짜,
    s.strt_tm AS 시작시간,
    s.end_tm AS 종료시간,
    s.max_nop_cnt AS 정원,
    s.rsv_cnt AS 예약인원,
    s.stts_cd AS 상태
FROM SCHEDULE s
         JOIN PROGRAM p ON p.prog_id = s.prog_id
         JOIN BRANCH b ON b.brch_id = s.brch_id
         JOIN USERS_ADMIN ua
              ON ua.user_id COLLATE utf8mb4_unicode_ci
                  = s.user_id COLLATE utf8mb4_unicode_ci
WHERE s.user_id COLLATE utf8mb4_unicode_ci IN (@T1, @T2)
ORDER BY s.strt_dt DESC, s.strt_tm DESC;

-- 강사별 수업 개수 확인
SELECT
    ua.user_name AS 강사명,
    COUNT(*) AS 총수업개수,
    SUM(CASE WHEN s.stts_cd = 'COMPLETED' THEN 1 ELSE 0 END) AS 완료수업,
    SUM(CASE WHEN s.stts_cd = 'CONFIRMED' THEN 1 ELSE 0 END) AS 확정수업,
    SUM(CASE WHEN s.stts_cd = 'OPEN' THEN 1 ELSE 0 END) AS 모집중수업
FROM SCHEDULE s
         JOIN USERS_ADMIN ua
              ON ua.user_id COLLATE utf8mb4_unicode_ci
                  = s.user_id COLLATE utf8mb4_unicode_ci
WHERE s.user_id COLLATE utf8mb4_unicode_ci IN (@T1, @T2)
GROUP BY ua.user_name;

SELECT s.user_id, COUNT(*) AS cnt
FROM SCHEDULE s
WHERE s.user_id COLLATE utf8mb4_unicode_ci IN (
                                               _utf8mb4 '3A1C1111-2222-3333-4444-555555555555' COLLATE utf8mb4_unicode_ci,
                                               _utf8mb4 '7B2D1111-2222-3333-4444-555555555555' COLLATE utf8mb4_unicode_ci
    )
GROUP BY s.user_id;