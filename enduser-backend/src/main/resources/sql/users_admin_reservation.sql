
-- 어드민 테이블 생성 (강사 테스트용)
CREATE TABLE USERS_ADMIN (
    user_id       VARCHAR(50)   NOT NULL,
    user_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    phone_number  VARCHAR(20),
    role          VARCHAR(50)   NOT NULL DEFAULT 'USER',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    
    -- 등록 시 자동 시간 기록
    agree_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키 (지점 정보)
    brch_id       BIGINT,
    
    PRIMARY KEY (user_id),
    UNIQUE KEY (email), -- 이메일 중복 방지
    
    -- 성능 최적화 인덱스
    INDEX idx_user_name (user_name), -- 이름 검색용
    INDEX idx_user_branch (brch_id), -- 지점별 강사 조회용
    
    -- 외래키 제약 조건
    CONSTRAINT FK_USER_ADMIN_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH(brch_id)
);


-- 어드민 (강사) 예시 데이터
INSERT INTO `users_admin` (
    user_id,
    user_name,
    `password`,
    email,
    phone_number,
    `role`,
    is_active,
    agree_at,
    brch_id
) VALUES
-- branch 1 : 피트니즈 수원
('instructor_su_01', '김헬스', 'pass1234!', 'su01@fitniz.com', '010-1001-0001', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 1),
('instructor_su_02', '이근력', 'pass1234!', 'su02@fitniz.com', '010-1001-0002', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 1),
('instructor_su_03', '박체력', 'pass1234!', 'su03@fitniz.com', '010-1001-0003', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 1),

-- branch 2 : 피트니즈 동탄
('instructor_dt_01', '최요가', 'pass1234!', 'dt01@fitniz.com', '010-1002-0001', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 2),
('instructor_dt_02', '정필라', 'pass1234!', 'dt02@fitniz.com', '010-1002-0002', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 2),
('instructor_dt_03', '한코어', 'pass1234!', 'dt03@fitniz.com', '010-1002-0003', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 2),

-- branch 3 : 피트니즈 합정
('instructor_hj_01', '오스윔', 'pass1234!', 'hj01@fitniz.com', '010-1003-0001', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 3),
('instructor_hj_02', '윤서킷', 'pass1234!', 'hj02@fitniz.com', '010-1003-0002', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 3),
('instructor_hj_03', '장피트', 'pass1234!', 'hj03@fitniz.com', '010-1003-0003', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 3),

-- branch 4 : 피트니즈 청담
('instructor_cd_01', '강테스', 'pass1234!', 'cd01@fitniz.com', '010-1004-0001', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 4),
('instructor_cd_02', '문밸런스', 'pass1234!', 'cd02@fitniz.com', '010-1004-0002', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 4),
('instructor_cd_03', '서바디', 'pass1234!', 'cd03@fitniz.com', '010-1004-0003', 'INSTRUCTOR', 1, CURRENT_TIMESTAMP, 4);