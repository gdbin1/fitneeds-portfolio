
-- 지점 테이블 생성
CREATE TABLE BRANCH (
    brch_id  BIGINT        NOT NULL AUTO_INCREMENT,
    brch_nm  VARCHAR(50)   NOT NULL,
    addr     VARCHAR(255)  NOT NULL,
    oper_yn  TINYINT(1)    NOT NULL DEFAULT 1,
    reg_dt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    upd_dt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (brch_id),
    
    INDEX idx_branch_nm (brch_nm),   -- 지점명으로 검색하거나 정렬할 때 사용
    INDEX idx_branch_oper (oper_yn)  -- 운영 중인 지점만 필터링할 때 사용
);

-- 지점 예시 데이터
INSERT INTO branch (
    brch_nm,
    addr,
    oper_yn,
    reg_dt,
    upd_dt
) VALUES
('피트니즈 수원', '경기도 수원시', 1, '2025-10-01 01:00:00', '2025-10-01 01:00:00'),
('피트니즈 동탄', '경기도 화성시 동탄동', 1, '2025-10-01 01:00:00', '2025-10-01 01:00:00'),
('피트니즈 합정', '서울특별시 마포구 합정동', 1, '2025-10-01 01:00:00', '2025-10-01 01:00:00'),
('피트니즈 청담', '서울특별시 강남구 청담동', 1, '2025-10-01 01:00:00', '2025-10-01 01:00:00');