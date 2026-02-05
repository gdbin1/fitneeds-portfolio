-- 기존 테이블 삭제
DROP TABLE IF EXISTS review;

-- 리뷰 테이블 생성
CREATE TABLE review (
    review_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(255),
    content        TEXT,
    user_id        VARCHAR(255) NOT NULL,
    user_type      VARCHAR(50),
    reservation_id BIGINT,
    history_id     BIGINT,
    rating         DECIMAL(2,1),
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
    is_visible     TINYINT(1) NOT NULL DEFAULT 1
);

-- 샘플 데이터 삽입
INSERT INTO review (title, content, user_id, user_type, reservation_id, rating, is_visible)
VALUES ('수업 너무 좋았어요', '강사님 설명이 친절하고 분위기도 좋아서 만족했습니다.',
        '0ef59f5e0bc54abc891236e3a15e3bda', 'USER', 1, 5, 1);

INSERT INTO review (title, content, user_id, user_type, history_id, rating, is_visible)
VALUES ('재등록 의사 있어요', '운동 효과가 확실해서 다음 달에도 이용하려고 합니다.',
        'c9d97230213a4dba98bad77dc63f0b52', 'USER', 2, 4, 1);

-- 테이블 확인
SELECT * FROM review;

