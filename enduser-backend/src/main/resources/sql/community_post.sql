=====	커뮤니티/FAQ/공지사항 통합 테이블	========================================

CREATE TABLE COMMUNITY_POST (
post_id BIGINT(20) NOT NULL AUTO_INCREMENT,   -- 게시글 고유 ID (PK)

post_type VARCHAR(20) NOT NULL,               -- 게시글 유형 (NOTICE / FAQ / COMMUNITY / RECRUIT)
category VARCHAR(20),                          -- 커뮤니티 카테고리
title VARCHAR(255) NOT NULL,                   -- 제목
content TEXT NOT NULL,                         -- 내용

writer_id VARCHAR(50) NOT NULL,                -- 작성자 ID (USER / ADMIN 공통, 문자열)
writer_type VARCHAR(20) NOT NULL,              -- 작성자 유형 (USER / ADMIN)

branch_id BIGINT(20),                          -- 지점 ID (지점 공지용)

views INT(11) NOT NULL DEFAULT 0,               -- 조회수

created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 수정일

sport_type VARCHAR(50),                        -- 모집 운동 종목
recruit_max INT(11),                           -- 모집 최대 인원
recruit_datetime DATETIME,                     -- 모집 일시
recruit_end_date DATETIME,                     -- 모집 종료 일시

display_start DATETIME,                        -- 게시글 노출 시작일
display_end DATETIME,                          -- 게시글 노출 종료일

is_visible TINYINT(1) NOT NULL DEFAULT 1,       -- 공지사항 노출 여부 (1: 노출, 0: 숨김)
is_pinned  TINYINT(1) NOT NULL DEFAULT 0, 	   -- 공지사항 상단 고정

post_visible TINYINT(1) NOT NULL DEFAULT 1,    -- 커뮤니티/모집 글 노출 여부

PRIMARY KEY (post_id)                          -- 기본 키
);

---------- community_post (커뮤니티 글) ----------
INSERT INTO COMMUNITY_POST (post_type, category, title, content, writer_id, writer_type, branch_id, views, sport_type, recruit_max, recruit_datetime, recruit_end_date, is_visible, post_visible)
VALUES ('COMMUNITY', '모집', '같이 운동하실 분 모집합니다', '주말에 헬스장에서 같이 운동하실 분 모집합니다.', 'user1', 'USER', 1, 0, '헬스', 5, '2026-01-10 10:00:00', '2026-01-15 23:59:59', 1, 1);

---------- COMMUNITY_POST (공지사항) ----------
INSERT INTO COMMUNITY_POST (post_type, title, content, writer_id, writer_type, branch_id, views, display_start, display_end, is_visible, post_visible)
VALUES ('NOTICE', '체육센터 설 연휴 휴관 안내', '설 연휴 기간 동안 체육센터가 휴관합니다.', 'admin1', 'ADMIN', 1, 0, '2026-01-20 00:00:00', '2026-01-31 23:59:59', 1, 1);

---------- community_post (FAQ) ----------
INSERT INTO COMMUNITY_POST (post_type, category, title, content, writer_id, writer_type, views, is_visible, post_visible)
VALUES ('FAQ', '이용안내', '회원권 환불은 어떻게 하나요?', '회원권 환불은 프론트 데스크를 통해 문의해 주세요.', 'admin1', 'ADMIN', 0, 1, 1);
