
-- 운동 종목 테이블 생성 쿼리
CREATE TABLE IF NOT EXISTS sport_type (
    sport_id   BIGINT NOT NULL AUTO_INCREMENT,
    sport_nm   VARCHAR(100) NOT NULL,
    sport_memo VARCHAR(500) NULL,
    use_yn     TINYINT(1) NOT NULL DEFAULT 1,
    reg_dt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    upd_dt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    del_dt     DATETIME NULL,
    PRIMARY KEY (sport_id),
    INDEX idx_sport_type_useyn (use_yn),
    INDEX idx_sport_type_sportnm (sport_nm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=UTF8MB4_GENERAL_CI;


INSERT INTO sport_type
(sport_nm, sport_memo, use_yn, reg_dt, upd_dt)
VALUES
('피트니스', '웨이트 트레이닝', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('요가', '유연성 및 호흡 중심 수련', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('필라테스', '코어 강화 및 체형 교정', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('수영', '전신 유산소 운동', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('주짓수', '그래플링 기반 무술 스포츠', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

