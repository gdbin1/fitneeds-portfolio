CREATE TABLE USERS (
    user_id       VARCHAR(50)  NOT NULL PRIMARY KEY,           -- 사용자 ID (50자, 필수, PK)
    user_name     VARCHAR(100) NOT NULL,                        -- 사용자 이름 (100자, 필수)
    email         VARCHAR(255) NOT NULL UNIQUE,                 -- 이메일 (255자, 필수, 고유)
    password      VARCHAR(255) NOT NULL,                        -- 비밀번호 (255자, 필수)
    phone_number  VARCHAR(20)  NULL,                           -- 전화번호 (20자, NULL 허용)
    role          VARCHAR(50)  NOT NULL DEFAULT 'USER',        -- 역할 (엔티티의 @ColumnDefault("'USER'"), nullable=false)
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,             -- 활성 상태 (TINYINT(1) -> boolean, 기본값 1, 필수)
    agree_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP -- 동의 일시 (TIMESTAMP, 기본값 현재 시각, 필수)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (user_id, user_name, email, password, phone_number, role, is_active, agree_at) VALUES
('user1', '유저1', 'user1@naver.com', '$2a$10$eEaIHpehlukt9PmwzF0hseewJ9LN8CKP1GzjwqdLp.iXBJnBmy/m2', '01012345678', 'USER', 1, NOW());

INSERT INTO users (user_id, user_name, email, password, phone_number, role, is_active, agree_at) VALUES
('user2', '유저2', 'user2@naver.com', '$2a$10$Kn7N3NC.fywYcfiT1ZfLqeD0C7XWxp.S41Fno7XD6OoDBXwY6utGi', '01098765432', 'ADMIN', 1, NOW());