-- ======================================================
-- USER_PASS (보유 이용권)
-- ======================================================
DROP TABLE IF EXISTS user_pass;

CREATE TABLE user_pass (
                           user_pass_id BIGINT NOT NULL AUTO_INCREMENT,
                           usr_id       VARCHAR(50) NOT NULL,
                           sport_id     BIGINT NOT NULL,
                           pass_status_cd VARCHAR(50) NOT NULL,
                           rmn_cnt      INT NOT NULL DEFAULT 0,
                           lst_prod_id  BIGINT NULL,
                           init_cnt     INT NOT NULL,
                           reg_dt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           upd_dt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           PRIMARY KEY (user_pass_id),
                           UNIQUE KEY uk_userpass_usr_sport (usr_id, sport_id),
                           CONSTRAINT fk_userpass_user
                               FOREIGN KEY (usr_id) REFERENCES `USERS` (user_id),
                           CONSTRAINT fk_userpass_sport
                               FOREIGN KEY (sport_id) REFERENCES sport_type (sport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='보유 이용권';

-- ======================================================
-- SAMPLE DATA
-- ======================================================
INSERT INTO user_pass
(usr_id, sport_id, pass_status_cd, rmn_cnt, init_cnt)
VALUES
    ('test_user', 1, 'AVAILABLE', 5, 5);
-- ///////////////////////////////////////////////////////////////////////////////////////////////


-- ======================================================
-- PASS_LOG (이용권 로그)
-- ======================================================
DROP TABLE IF EXISTS pass_log;

CREATE TABLE pass_log (
                          pass_log_id  BIGINT NOT NULL AUTO_INCREMENT,
                          user_pass_id BIGINT NOT NULL,
                          chg_type_cd  VARCHAR(30) NOT NULL,
                          chg_cnt      INT NOT NULL,
                          chg_rsn      VARCHAR(255) NULL,
                          pocs_usr_id  VARCHAR(50) NULL,
                          reg_dt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          PRIMARY KEY (pass_log_id),
                          CONSTRAINT fk_passlog_userpass
                              FOREIGN KEY (user_pass_id) REFERENCES user_pass (user_pass_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='이용권 변경 로그';

-- ======================================================
-- SAMPLE DATA
-- ======================================================
INSERT INTO pass_log
(user_pass_id, chg_type_cd, chg_cnt, chg_rsn)
VALUES
    (1, 'USE', -1, '테스트 이용권 사용');
-- ///////////////////////////////////////////////////////////////////////////////////////////////


-- ======================================================
-- PASS_TRADE_POST (이용권 거래 게시글)
-- ======================================================
DROP TABLE IF EXISTS pass_trade_post;

CREATE TABLE pass_trade_post (
                                 post_id      BIGINT NOT NULL AUTO_INCREMENT,
                                 seller_id    VARCHAR(50) NOT NULL,
                                 user_pass_id BIGINT NOT NULL,
                                 title        VARCHAR(255) NOT NULL,
                                 cntnt        TEXT NOT NULL,
                                 sell_qty     INT NOT NULL,
                                 sale_amt     DECIMAL(19,4) NOT NULL,
                                 stts_cd      VARCHAR(20) NOT NULL,
                                 reg_dt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 upd_dt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 PRIMARY KEY (post_id),
                                 CONSTRAINT fk_trade_post_user
                                     FOREIGN KEY (seller_id) REFERENCES `USER` (user_id),
                                 CONSTRAINT fk_trade_post_userpass
                                     FOREIGN KEY (user_pass_id) REFERENCES user_pass (user_pass_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='이용권 거래 게시글';

-- ======================================================
-- SAMPLE DATA
-- ======================================================
INSERT INTO pass_trade_post
(seller_id, user_pass_id, title, cntnt, sell_qty, sale_amt, stts_cd)
VALUES
    ('test_user', 1, '헬스 이용권 팝니다', '잔여 이용권 거래', 2, 20000, 'SELLING');
-- ///////////////////////////////////////////////////////////////////////////////////////////////



-- ======================================================
-- PASS_TRADE_TRANSACTION (이용권 거래 내역)
-- ======================================================
DROP TABLE IF EXISTS pass_trade_transaction;

CREATE TABLE pass_trade_transaction (
                                        trade_id     BIGINT NOT NULL AUTO_INCREMENT,
                                        post_id      BIGINT NOT NULL,
                                        buyer_usr_id VARCHAR(50) NOT NULL,
                                        trade_amt    DECIMAL(19,4) NOT NULL,
                                        stts_cd      VARCHAR(20) NOT NULL,
                                        buy_qty      INT NOT NULL,
                                        reg_dt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        payment_id   BIGINT NULL,
                                        PRIMARY KEY (trade_id),
                                        CONSTRAINT fk_trade_tx_post
                                            FOREIGN KEY (post_id) REFERENCES pass_trade_post (post_id),
                                        CONSTRAINT fk_trade_tx_buyer
                                            FOREIGN KEY (buyer_usr_id) REFERENCES `USER` (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='이용권 거래 내역';

-- ======================================================
-- SAMPLE DATA
-- ======================================================
INSERT INTO pass_trade_transaction
(post_id, buyer_usr_id, trade_amt, stts_cd, buy_qty)
VALUES
    (1, 'buyer_user', 20000, 'COMPLETED', 1);

-- ///////////////////////////////////////////////////////////////////////////////////////////////

-- ======================================================
-- 추가요청 FAQ
-- ======================================================
CREATE TABLE faq (
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

-- ///////////////////////////////////////////////////////////////////////////////////////////////


-- ======================================================
-- 추가요청 FAVORITE (즐겨찾기)
-- ======================================================
CREATE TABLE favorite (
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