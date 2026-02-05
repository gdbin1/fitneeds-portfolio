
-- 프로그램 테이블 생성
CREATE TABLE PROGRAM (
    prog_id       BIGINT          NOT NULL AUTO_INCREMENT,
    prog_nm       VARCHAR(255)    NOT NULL,
    sport_id      BIGINT          NOT NULL,
    brch_id       BIGINT          NOT NULL,
    use_yn        TINYINT(1)      DEFAULT 1,
    one_time_amt  INT             NOT NULL DEFAULT 0,
    rwd_game_pnt  INT             NOT NULL DEFAULT 0,
    reg_dt        DATETIME        NOT NULL,
    upd_dt        DATETIME        NOT NULL,
    
    PRIMARY KEY (prog_id),
    
    -- 외래키 제약 조건
    CONSTRAINT FK_PROGRAM_SPORT  FOREIGN KEY (sport_id) REFERENCES SPORT_TYPE(sport_id),
    CONSTRAINT FK_PROGRAM_BRANCH FOREIGN KEY (brch_id)  REFERENCES BRANCH(brch_id)
);

-- 프로그램 예시 데이터
INSERT INTO PROGRAM
(prog_nm, brch_id, sport_id, use_yn, one_time_amt, rwd_game_pnt, reg_dt, upd_dt)
VALUES
('초보자 웨이트 트레이닝', 1, 1, 1, 20000, 200, NOW(), NOW()), -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('중급 필라테스 리포머', 1, 3, 1, 25000, 250, NOW(), NOW()),   -- 수원 (brch_id:1), 필라테스 (sport_id:3)
('요가 릴렉스 명상', 1, 2, 1, 18000, 180, NOW(), NOW()),     -- 수원 (brch_id:1), 요가 (sport_id:2)
('고급 크로스핏', 1, 1, 1, 30000, 300, NOW(), NOW()),        -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('바디 웨이트 집중반', 1, 1, 1, 22000, 220, NOW(), NOW()),    -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('줌바 댄스 피트니스', 1, 1, 1, 17000, 170, NOW(), NOW()),    -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('TRX 전신 코어', 1, 1, 1, 23000, 230, NOW(), NOW()),         -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('GX 스피닝', 1, 1, 1, 19000, 190, NOW(), NOW()),             -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('폼롤러 스트레칭', 1, 2, 1, 15000, 150, NOW(), NOW()),      -- 수원 (brch_id:1), 요가 (sport_id:2)
('PT 심화 트레이닝', 1, 1, 1, 35000, 350, NOW(), NOW()),      -- 수원 (brch_id:1), 피트니스 (sport_id:1)

('체지방 감량 Bootcamp', 2, 1, 1, 28000, 280, NOW(), NOW()), -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('맨즈 요가', 2, 2, 1, 20000, 200, NOW(), NOW()),           -- 동탄 (brch_id:2), 요가 (sport_id:2)
('소도구 필라테스', 2, 3, 1, 21000, 210, NOW(), NOW()),      -- 동탄 (brch_id:2), 필라테스 (sport_id:3)
('재활 트레이닝', 2, 1, 1, 32000, 320, NOW(), NOW()),        -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('타바타 고강도 인터벌', 2, 1, 1, 20000, 200, NOW(), NOW()), -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('발레핏 베이직', 2, 3, 1, 24000, 240, NOW(), NOW()),        -- 동탄 (brch_id:2), 필라테스 (sport_id:3)
('케틀벨 파워 트레이닝', 2, 1, 1, 26000, 260, NOW(), NOW()), -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('근력 향상 서킷', 2, 1, 1, 21000, 210, NOW(), NOW()),      -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('골프 피트니스', 2, 1, 1, 30000, 300, NOW(), NOW()),       -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('성장기 운동 교실', 2, 1, 1, 22000, 220, NOW(), NOW()),     -- 동탄 (brch_id:2), 피트니스 (sport_id:1)

('키즈 요가', 3, 2, 1, 16000, 160, NOW(), NOW()),            -- 합정 (brch_id:3), 요가 (sport_id:2)
('시니어 스트레칭', 3, 2, 1, 14000, 140, NOW(), NOW()),       -- 합정 (brch_id:3), 요가 (sport_id:2)
('임산부 필라테스', 3, 3, 1, 27000, 270, NOW(), NOW()),      -- 합정 (brch_id:3), 필라테스 (sport_id:3)
('복싱 다이어트', 3, 1, 1, 23000, 230, NOW(), NOW()),       -- 합정 (brch_id:3), 피트니스 (sport_id:1)
('주말 집중 PT', 3, 1, 1, 28000, 280, NOW(), NOW()),        -- 합정 (brch_id:3), 피트니스 (sport_id:1)
('댄스 에어로빅', 3, 1, 1, 18000, 180, NOW(), NOW()),         -- 합정 (brch_id:3), 피트니스 (sport_id:1)
('스쿼시 입문', 3, 1, 1, 20000, 200, NOW(), NOW()),         -- 합정 (brch_id:3), 피트니스 (sport_id:1)
('테니스 기본기', 3, 1, 1, 22000, 220, NOW(), NOW()),        -- 합정 (brch_id:3), 피트니스 (sport_id:1)
('스포츠 마사지 이론', 3, 1, 1, 15000, 150, NOW(), NOW()),   -- 합정 (brch_id:3), 피트니스 (sport_id:1)
('부트 캠프 스페셜', 3, 1, 1, 30000, 300, NOW(), NOW()),    -- 합정 (brch_id:3), 피트니스 (sport_id:1)

('체형 교정 필라테스', 4, 3, 1, 26000, 260, NOW(), NOW()), -- 청담 (brch_id:4), 필라테스 (sport_id:3)
('그룹 PT (초급)', 4, 1, 1, 20000, 200, NOW(), NOW()),     -- 청담 (brch_id:4), 피트니스 (sport_id:1)
('그룹 PT (중급)', 4, 1, 1, 22000, 220, NOW(), NOW()),     -- 청담 (brch_id:4), 피트니스 (sport_id:1)
('그룹 PT (고급)', 4, 1, 1, 25000, 250, NOW(), NOW()),     -- 청담 (brch_id:4), 피트니스 (sport_id:1)
('개인 PT (맞춤형)', 4, 1, 1, 40000, 400, NOW(), NOW()),   -- 청담 (brch_id:4), 피트니스 (sport_id:1)
('오피스 스트레칭', 4, 2, 1, 16000, 160, NOW(), NOW()),    -- 청담 (brch_id:4), 요가 (sport_id:2)
('수영 강습 (자유형)', 4, 4, 1, 28000, 280, NOW(), NOW()),  -- 청담 (brch_id:4), 수영 (sport_id:4)
('런닝 크루 (야외)', 4, 1, 1, 10000, 100, NOW(), NOW()),   -- 청담 (brch_id:4), 피트니스 (sport_id:1)
('고강도 코어 운동', 4, 1, 1, 24000, 240, NOW(), NOW()),    -- 청담 (brch_id:4), 피트니스 (sport_id:1)
('필라테스 (매트)', 4, 3, 1, 19000, 190, NOW(), NOW()),     -- 청담 (brch_id:4), 필라테스 (sport_id:3)

('아침 요가', 1, 2, 1, 17000, 170, NOW(), NOW()),          -- 수원 (brch_id:1), 요가 (sport_id:2)
('저녁 힐링 요가', 1, 2, 1, 18000, 180, NOW(), NOW()),       -- 수원 (brch_id:1), 요가 (sport_id:2)
('직장인 맞춤 운동', 1, 1, 1, 25000, 250, NOW(), NOW()),    -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('다이어트 복싱', 1, 1, 1, 21000, 210, NOW(), NOW()),       -- 수원 (brch_id:1), 피트니스 (sport_id:1)
('주말 특강 (선착순)', 1, 1, 1, 30000, 300, NOW(), NOW()),   -- 수원 (brch_id:1), 피트니스 (sport_id:1)

('바른 자세 교정', 2, 3, 1, 23000, 230, NOW(), NOW()),    -- 동탄 (brch_id:2), 필라테스 (sport_id:3)
('그룹 PT (여성)', 2, 1, 1, 20000, 200, NOW(), NOW()),      -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('그룹 PT (남성)', 2, 1, 1, 20000, 200, NOW(), NOW()),      -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('부상 방지 트레이닝', 2, 1, 1, 27000, 270, NOW(), NOW()),   -- 동탄 (brch_id:2), 피트니스 (sport_id:1)
('집중 코어 강화', 2, 1, 1, 24000, 240, NOW(), NOW());     -- 동탄 (brch_id:2), 피트니스 (sport_id:1)