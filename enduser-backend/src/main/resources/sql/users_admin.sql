CREATE TABLE USERS_ADMIN (
    user_id       VARCHAR(50)  NOT NULL PRIMARY KEY,           -- 사용자 ID (엔티티의 @Id, length=50)
    user_name     VARCHAR(100) NOT NULL,                        -- 사용자 이름 (length=100)
    email         VARCHAR(255) NOT NULL UNIQUE,                 -- 이메일 (length=255, 엔티티의 unique=true 반영)
    password      VARCHAR(255) NOT NULL,                        -- 비밀번호 (length=255)
    phone_number  VARCHAR(20)  NULL,                           -- 전화번호 (length=20, NULL 허용)
    role          VARCHAR(50)  NOT NULL DEFAULT 'USER',        -- 역할 (엔티티의 @ColumnDefault("'USER'"), nullable=false)
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,             -- 활성 상태 (엔티티의 @ColumnDefault("1"), nullable=false)
    agree_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 동의 일시 (기본값 CURRENT_TIMESTAMP, NOT NULL)
    brch_id       BIGINT       NULL,                           -- 지점 ID (UserAdmin 엔티티의 private Branch brchId; @JoinColumn(nullable = true) 반영)

    FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BRANCH 테이블 샘플 데이터 삽입
INSERT INTO branch ( brch_nm, addr, oper_yn, reg_dt, upd_dt) VALUES ( '본사 지점', '서울 강남구 테헤란로 1', TRUE, NOW(),NOW());
INSERT INTO branch ( brch_nm, addr, oper_yn, reg_dt, upd_dt) VALUES ( '수원 지점', '경기 수원시 영통구 2', TRUE, NOW(),NOW());
INSERT INTO branch ( brch_nm, addr, oper_yn, reg_dt, upd_dt) VALUES ( '서울 지점', '미정', FALSE, NOW(),NOW());

INSERT INTO users_admin (user_id, user_name, email, password, phone_number, role, is_active, agree_at, brch_id) VALUES
('admin', 'ADMIN', 'admin@naver.com', '$2a$10$4QZNS6s/P6njiiuSb0gTo.cq1rEfjKL4/F5/oyn071gK2aQuTbV5.', '01012345678', 'ADMIN', 1, NOW(), 1);

INSERT INTO users_admin (user_id, user_name, email, password, phone_number, role, is_active, agree_at, brch_id) VALUES
('fitneeds', 'FITNEEDS', 'fitneeds@fitneeds.com', '$2a$10$8XNVo70v3uAH3RZZzVSl1O0.VoYAe.asLZGGuKSbv4STDesP4DgPS', '01098765432', 'ADMIN', 1, NOW(), 2);
