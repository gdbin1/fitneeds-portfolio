SET FOREIGN_KEY_CHECKS = 0;

SELECT user_pass_id, user_id
FROM user_pass
WHERE user_id = '지금 로그인한 userId';

SHOW TABLES;
SELECT COUNT(*) FROM USER_PASS;

SHOW CREATE TABLE PASS_TRADE_TRANSACTION;

SELECT * FROM PAYMENT ORDER BY REG_DT DESC;

SELECT post_id, stts_cd, del_yn
FROM PASS_TRADE_POST
ORDER BY post_id DESC;

SELECT *
FROM PASS_TRADE_TRANSACTION
ORDER BY reg_dt DESC;

SELECT trade_id, buyer_user_id
FROM PASS_TRADE_TRANSACTION;

SELECT *
FROM PASS_TRADE_TRANSACTION
WHERE buyer_user_id = 'user7'
ORDER BY reg_dt DESC;

SELECT * FROM PASS_TRADE_TRANSACTION;

SELECT *
FROM FAVORITE
WHERE user_id = 'dcb5c11e5ecf440d9ac3f9710bf5c0c4';

SELECT *
FROM FAVORITE
ORDER BY user_id, post_id;

-- DROP 순서: FK 걸린 테이블부터 역순 삭제
DROP TABLE IF EXISTS favorite;
DROP TABLE IF EXISTS faq;
DROP TABLE IF EXISTS pass_trade_transaction;
DROP TABLE IF EXISTS pass_trade_post;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS pass_log;
DROP TABLE IF EXISTS user_pass;
DROP TABLE IF EXISTS ticket_product;
DROP TABLE IF EXISTS branch;
DROP TABLE IF EXISTS sport_type;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ======================================================
-- 1) USERS (사용자)
-- ======================================================
CREATE TABLE USERS (
  user_id      VARCHAR(255) NOT NULL COMMENT 'PK, 사용자 고유 ID (UUID 등)',
  user_name    VARCHAR(100) NOT NULL COMMENT '사용자 이름',
  email        VARCHAR(255) NOT NULL COMMENT '사용자 이메일 (UNIQUE)',
  password     VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
  phone_number VARCHAR(20)  NULL     COMMENT '전화번호',
  role         VARCHAR(50)  NOT NULL DEFAULT 'USER' COMMENT '권한(USER, ADMIN 등)',
  cash_point   INT          NOT NULL DEFAULT 0 COMMENT '보유 캐시 포인트',
  grade_point  INT          NOT NULL DEFAULT 0 COMMENT '등급 포인트',
  is_active    TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '활성화 여부(0/1)',
  agree_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개인정보 동의 시각',
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='사용자';

-- ======================================================
-- 2) SPORT_TYPE (운동 종목)
-- ======================================================
CREATE TABLE SPORT_TYPE (
  sport_id   BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK, 스포츠 종목 ID',
  sport_nm   VARCHAR(100) NOT NULL COMMENT '스포츠 종목 이름(헬스, 요가 등)',
  sport_memo VARCHAR(500) NULL     COMMENT '메모',
  use_yn     TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '사용 여부(1:활성,0:비활성)',
  reg_dt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  upd_dt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  del_dt     DATETIME     NULL     COMMENT '삭제/비활성 일시',
  PRIMARY KEY (sport_id),
  KEY idx_sport_type_useyn (use_yn),
  KEY idx_sport_type_sportnm (sport_nm)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='운동 종목';

-- ======================================================
-- 3) BRANCH (지점)
-- ======================================================
CREATE TABLE BRANCH (
  brch_id BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK, 지점ID',
  brch_nm VARCHAR(50)  NOT NULL COMMENT '지점명',
  addr    VARCHAR(255) NOT NULL COMMENT '주소',
  oper_yn TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '운영여부(1:운영,0:미운영)',
  reg_dt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  upd_dt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  phone   VARCHAR(50)  NULL     COMMENT '지점 전화번호',
  PRIMARY KEY (brch_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='지점';

-- ======================================================
-- 4) TICKET_PRODUCT (이용권 상품)
-- ======================================================
CREATE TABLE TICKET_PRODUCT (
  prod_id  BIGINT         NOT NULL AUTO_INCREMENT COMMENT 'PK, 상품ID',
  sport_id BIGINT         NOT NULL COMMENT 'FK, 스포츠ID',
  prod_nm  VARCHAR(100)   NOT NULL COMMENT '상품명',
  prod_amt DECIMAL(19,4)  NOT NULL COMMENT '가격',
  prv_cnt  INT            NOT NULL COMMENT '제공횟수',
  use_yn   TINYINT(1)     NOT NULL DEFAULT 1 COMMENT '판매여부(1:판매,0:미판매)',
  reg_dt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
  upd_dt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (prod_id),
  KEY idx_product_sport (sport_id),
  CONSTRAINT fk_product_sport
    FOREIGN KEY (sport_id) REFERENCES sport_type (sport_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='이용권 상품';

-- ======================================================
-- 5) USER_PASS (보유 이용권)
--   - users 테이블(user_id) 참조
-- ======================================================
CREATE TABLE USER_PASS (
  user_pass_id    BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK, 보유이용권ID',
  user_id         VARCHAR(255) NOT NULL COMMENT 'FK, 사용자ID',
  sport_id        BIGINT       NOT NULL COMMENT 'FK, 스포츠ID',
  pass_status_cd  VARCHAR(50)  NOT NULL COMMENT '상태코드(AVAILABLE/EXPIRED 등)',
  rmn_cnt         INT          NOT NULL DEFAULT 0 COMMENT '잔여횟수',
  lst_prod_id     BIGINT       NULL     COMMENT '마지막구매상품ID(옵션)',
  init_cnt        INT          NOT NULL COMMENT '초기구매수량',
  reg_dt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  upd_dt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (user_pass_id),
  UNIQUE KEY uk_userpass_user_sport (user_id, sport_id),
  KEY idx_userpass_user (user_id),
  KEY idx_userpass_sport (sport_id),
  CONSTRAINT fk_userpass_user
    FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT fk_userpass_sport
    FOREIGN KEY (sport_id) REFERENCES sport_type (sport_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='보유 이용권';

-- ======================================================
-- 6) PASS_LOG (이용권 로그)
-- ======================================================
CREATE TABLE PASS_LOG (
  pass_log_id  BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK, 이력ID',
  user_pass_id BIGINT       NOT NULL COMMENT 'FK, 보유이용권ID',
  chg_type_cd  VARCHAR(30)  NOT NULL COMMENT '변경유형(사용/구매/예약취소 등)',
  chg_cnt      INT          NOT NULL COMMENT '변경수량(+/-)',
  chg_rsn      VARCHAR(255) NULL     COMMENT '변경사유',
  pocs_usr_id  VARCHAR(255) NULL     COMMENT '처리자ID(직원 등) - users.user_id 형태 권장',
  reg_dt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  PRIMARY KEY (pass_log_id),
  KEY idx_passlog_userpass (user_pass_id),
  CONSTRAINT fk_passlog_userpass
    FOREIGN KEY (user_pass_id) REFERENCES user_pass (user_pass_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='이용권 로그';

-- ======================================================
-- 7) PAYMENT (결제)
--   - users(user_id) 참조
-- ======================================================
CREATE TABLE PAYMENT (
  pay_id      BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK, 결제ID',
  ord_no      VARCHAR(100)  NOT NULL COMMENT '주문번호(UNIQUE)',
  usr_id      VARCHAR(255)  NOT NULL COMMENT 'FK, 결제자 user_id',
  pay_type_cd VARCHAR(20)   NOT NULL COMMENT '결제유형(상품구매/단건결제/이용권거래)',
  ref_id      BIGINT        NULL     COMMENT '참조ID(상품/스케줄/거래 등)',
  pay_amt     DECIMAL(19,4) NOT NULL COMMENT '결제금액',
  pay_method  VARCHAR(20)   NOT NULL COMMENT '결제수단(무통장/포인트/카드 등)',
  stts_cd     VARCHAR(20)   NOT NULL COMMENT '상태코드(READY/COMPLETE/CANCEL 등)',
  reg_dt      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  pg_order_no VARCHAR(100)  NULL     COMMENT 'PG 주문번호(옵션)',
  target_id   BIGINT        NOT NULL COMMENT '결제 대상 ID',
  target_name VARCHAR(100)  NOT NULL COMMENT '결제 대상 이름',
  PRIMARY KEY (pay_id),
  UNIQUE KEY uk_payment_ordno (ord_no),
  KEY idx_payment_user (usr_id),
  CONSTRAINT fk_payment_user
    FOREIGN KEY (usr_id) REFERENCES users (user_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='결제';

-- ======================================================
-- 8) PASS_TRADE_POST (이용권 거래 게시글)
-- ======================================================
CREATE TABLE PASS_TRADE_POST (
  post_id      BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK, 게시글ID',
  seller_id    VARCHAR(255)  NOT NULL COMMENT 'FK, 판매자 users.user_id',
  user_pass_id BIGINT        NOT NULL COMMENT 'FK, 판매대상 user_pass.user_pass_id',
  title        VARCHAR(255)  NOT NULL COMMENT '게시글 제목',
  cntnt        TEXT          NOT NULL COMMENT '게시글 본문/판매사유',
  sell_qty     INT           NOT NULL COMMENT '판매수량',
  sale_amt     DECIMAL(19,4) NOT NULL COMMENT '판매희망가',
  stts_cd      VARCHAR(20)   NOT NULL COMMENT '상태(SELLING/RESERVED/SOLD 등)',
  del_yn       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '삭제여부(soft delete)',
  reg_dt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  upd_dt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (post_id),
  KEY idx_post_seller (seller_id),
  KEY idx_post_userpass (user_pass_id),
  CONSTRAINT fk_trade_post_seller
    FOREIGN KEY (seller_id) REFERENCES users (user_id),
  CONSTRAINT fk_trade_post_userpass
    FOREIGN KEY (user_pass_id) REFERENCES user_pass (user_pass_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='이용권 거래 게시글';

ALTER TABLE PASS_TRADE_POST
MODIFY upd_dt DATETIME
NOT NULL
DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP;

SELECT post_id, stts_cd, del_yn
FROM PASS_TRADE_POST
ORDER BY post_id DESC;


-- ======================================================
-- 9) PASS_TRADE_TRANSACTION (이용권 거래 내역)
-- ======================================================
CREATE TABLE PASS_TRADE_TRANSACTION (
  trade_id     BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK, 거래ID',
  post_id      BIGINT        NOT NULL COMMENT 'FK, 게시글ID',
  buyer_usr_id VARCHAR(255)  NOT NULL COMMENT 'FK, 구매자 users.user_id',
  trade_amt    DECIMAL(19,4) NOT NULL COMMENT '실거래금액',
  stts_cd      VARCHAR(20)   NOT NULL COMMENT '상태(COMPLETE/CANCEL 등)',
  reg_dt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '거래일시',
  buy_qty      INT           NOT NULL COMMENT '구매 장수(결제 수량)',
  payment_id   BIGINT        NOT NULL COMMENT 'FK, payment.pay_id',
  PRIMARY KEY (trade_id),
  KEY idx_trade_post (post_id),
  KEY idx_trade_buyer (buyer_usr_id),
  KEY idx_trade_payment (payment_id),
  CONSTRAINT fk_trade_post
    FOREIGN KEY (post_id) REFERENCES pass_trade_post (post_id),
  CONSTRAINT fk_trade_buyer
    FOREIGN KEY (buyer_usr_id) REFERENCES users (user_id),
  CONSTRAINT fk_trade_payment
    FOREIGN KEY (payment_id) REFERENCES payment (pay_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='이용권 거래 내역';

-- ======================================================
-- 10) FAQ
-- ======================================================
CREATE TABLE FAQ (
  faq_id    BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK, FAQ 식별자',
  title     VARCHAR(255) NOT NULL COMMENT 'FAQ 제목',
  content   TEXT         NOT NULL COMMENT 'FAQ 내용',
  category  VARCHAR(100) NOT NULL COMMENT '카테고리(PURCHASE/USAGE/TRADE/GENERAL)',
  view_cnt  INT          NOT NULL DEFAULT 0 COMMENT '조회수',
  reg_dt    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  upd_dt    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  ans_stat  VARCHAR(20)  NOT NULL DEFAULT 'WAIT' COMMENT '답변상태(WAIT/DONE)',
  ans_by    VARCHAR(255) NULL COMMENT '답변자 users.user_id',
  ans_at    DATETIME     NULL COMMENT '답변일시',
  PRIMARY KEY (faq_id),
  KEY idx_faq_category (category)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='이용권 FAQ';

ALTER TABLE FAQ
ADD COLUMN ans_at DATETIME NULL COMMENT '답변일시';
ALTER TABLE FAQ
ADD COLUMN ans_by VARCHAR(255) NULL COMMENT '답변자';
ALTER TABLE FAQ
ADD COLUMN ans_stat VARCHAR(20) NOT NULL COMMENT '답변 상태 (WAIT / DONE)';
ALTER TABLE FAQ
ADD COLUMN content TEXT NOT NULL COMMENT '문의 내용';
ALTER TABLE FAQ
ADD COLUMN reg_dt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시';
ALTER TABLE FAQ
-- 제목
ADD COLUMN title VARCHAR(255) NOT NULL COMMENT '질문 제목',


-- 조회수
ADD COLUMN view_cnt INT NOT NULL DEFAULT 0 COMMENT '조회수',

-- 수정일
ADD COLUMN upd_dt DATETIME NULL COMMENT '수정일시';



-- ======================================================
-- 11) FAVORITE (즐겨찾기)
-- ======================================================
CREATE TABLE FAVORITE (
  favorite_id BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK, 즐겨찾기ID',
  user_id     VARCHAR(255) NOT NULL COMMENT 'FK, users.user_id',
  post_id     BIGINT       NOT NULL COMMENT 'FK, pass_trade_post.post_id',
  PRIMARY KEY (favorite_id),
  UNIQUE KEY uk_favorite_user_post (user_id, post_id),
  KEY idx_favorite_post (post_id),
  CONSTRAINT fk_favorite_user
    FOREIGN KEY (user_id) REFERENCES users (user_id),
  CONSTRAINT fk_favorite_post
    FOREIGN KEY (post_id) REFERENCES pass_trade_post (post_id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci
COMMENT='즐겨찾기';

-- 샘플 데이터
INSERT INTO sport_type(sport_nm, sport_memo, use_yn, reg_dt, upd_dt)
    VALUES ('헬스', '근력 증강 및 유산소 운동을 기본으로 하는 운동입니다.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO sport_type(sport_nm, sport_memo, use_yn, reg_dt, upd_dt)
    VALUES ('요가', '몸과 마음을 이완하는 운동입니다.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO sport_type(sport_nm, sport_memo, use_yn, reg_dt, upd_dt)
    VALUES ('수영', '생존 수영부터 다양한 영법까지 수영에 대한 모든 것', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    
SET @LOGIN_USER_ID = 'adb075fd08a5493e85d3c49bd0960da6';

INSERT INTO user_pass
(
  user_id,
  sport_id,
  pass_status_cd,
  rmn_cnt,
  init_cnt,
  lst_prod_id,
  reg_dt,
  upd_dt
)
VALUES
(
  @LOGIN_USER_ID,   -- ✅ 실제 users.user_id
  1,                -- 피트니스
  'AVAILABLE',
  10,
  10,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

SELECT user_id FROM users;
SELECT * FROM users;

SELECT *
FROM user_pass
WHERE user_id = @LOGIN_USER_ID;

SELECT * FROM fitneedsdb.users WHERE user_id = 'adb075fd08a5493e85d3c49bd0960da6';

SHOW CREATE TABLE user_pass;

SELECT *
FROM user_pass
WHERE user_id = 'adb075fd08a5493e85d3c49bd0960da6';
SELECT user_id FROM user_pass;

select user_id
from users
where user_id = 'adb075fd08a5493e85d3c49bd0960da6';

select up.*
from user_pass up
join users u on up.user_id = u.user_id
where u.user_id = 'adb075fd08a5493e85d3c49bd0960da6';
desc users;
desc user_pass;

SELECT user_pass_id, user_id
FROM fitneedsdb.user_pass;

