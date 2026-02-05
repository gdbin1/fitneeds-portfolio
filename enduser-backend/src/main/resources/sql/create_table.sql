use fitneedsdb;

-- ==========================================
-- 0. DISABLE FOREIGN KEY CHECKS
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. DROP TABLES
-- ==========================================

DROP TABLE IF EXISTS teacher_settlement_item;
DROP TABLE IF EXISTS teacher_settlement;
DROP TABLE IF EXISTS teacher_certificate;
DROP TABLE IF EXISTS teacher_career;
DROP TABLE IF EXISTS teacher_sport;
DROP TABLE IF EXISTS teacher_profile;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS favorite;
DROP TABLE IF EXISTS faq;
DROP TABLE IF EXISTS COMMUNITY_COMMENT;
DROP TABLE IF EXISTS community_recruit_join;
DROP TABLE IF EXISTS COMMUNITY_POST;
DROP TABLE IF EXISTS pass_trade_transaction;
DROP TABLE IF EXISTS pass_trade_post;
DROP TABLE IF EXISTS pass_log;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS class_attendance;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS user_pass;
DROP TABLE IF EXISTS pass_product;
DROP TABLE IF EXISTS program;
DROP TABLE IF EXISTS branch_info;
DROP TABLE IF EXISTS users_admin;
DROP TABLE IF EXISTS branch;
DROP TABLE IF EXISTS sport_type;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS branch_info;
DROP TABLE IF EXISTS reservation_history;
DROP TABLE IF EXISTS user;

commit;
-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- 1. SPORT_TYPE (운동 종목)
CREATE TABLE IF NOT EXISTS SPORT_TYPE (
    sport_id   BIGINT AUTO_INCREMENT NOT NULL COMMENT '스포츠 종목 ID',
    sport_nm   VARCHAR(100) NOT NULL COMMENT '스포츠 종목 이름',
    sport_memo VARCHAR(500) NULL     COMMENT '메모',
    use_yn     TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '종목 사용 여부',
    reg_dt     DATETIME     NOT NULL COMMENT '등록일시',
    upd_dt     DATETIME     NOT NULL COMMENT '수정일시',
    del_dt     DATETIME     NULL     COMMENT '삭제일시',
    PRIMARY KEY (sport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. BRANCH (지점) - USERS_ADMIN 보다 먼저 생성되어야 함
CREATE TABLE IF NOT EXISTS BRANCH (
    brch_id BIGINT AUTO_INCREMENT NOT NULL COMMENT '지점ID',
    brch_nm VARCHAR(50)  NOT NULL COMMENT '지점명',
    addr    VARCHAR(255) NOT NULL COMMENT '주소',
    oper_yn TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '운영여부',
    reg_dt  DATETIME     NOT NULL COMMENT '등록일시',
    upd_dt  DATETIME     NOT NULL COMMENT '수정일시',
    phone   VARCHAR(50)  NULL     COMMENT '지점 전화번호',
    PRIMARY KEY (brch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;




-- 3. USERS (회원 유저)
CREATE TABLE IF NOT EXISTS USERS (
    user_id      VARCHAR(50)  NOT NULL COMMENT '사용자 고유 ID',
    user_name    VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    email        VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일',
    password     VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    phone_number VARCHAR(20)  NULL     COMMENT '전화번호',
    role         VARCHAR(50)  NOT NULL DEFAULT 'USER' COMMENT '사용자 권한',
    is_active    TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '활성화 여부',
    agree_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개인정보 동의 시각',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. USERS_ADMIN (관리자 유저)
CREATE TABLE IF NOT EXISTS USERS_ADMIN (
    user_id      VARCHAR(50)  NOT NULL COMMENT '사용자 고유 ID',
    user_name    VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    email        VARCHAR(255) NOT NULL UNIQUE COMMENT '사용자 이메일',
    password     VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    phone_number VARCHAR(20)  NULL     COMMENT '전화번호',
    role         VARCHAR(50)  NOT NULL DEFAULT 'USER' COMMENT '권한(ADMIN, MANAGER, TEACHER)',
    brch_id      BIGINT       NULL     COMMENT '지점ID',
    is_active    TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '활성화 여부',
    agree_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개인정보 동의 시각',
    PRIMARY KEY (user_id),
    CONSTRAINT FK_ADMIN_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. BRANCH_INFO (지점 상세)
CREATE TABLE IF NOT EXISTS BRANCH_INFO (
    br_info_id       BIGINT AUTO_INCREMENT NOT NULL COMMENT '지점 정보 ID',
    brch_id          BIGINT NOT NULL COMMENT '지점 ID',
    open_time        TIME   NOT NULL DEFAULT '06:00:00' COMMENT '오픈 시간',
    close_time       TIME   NOT NULL DEFAULT '23:00:00' COMMENT '마감 시간',
    break_start_time TIME   NULL     COMMENT '휴게 시작 시간',
    break_end_time   TIME   NULL     COMMENT '휴게 종료 시간',
    holiday_info     TEXT   NULL     COMMENT '휴일 정보',
    policy_info      TEXT   NULL     COMMENT '정책 정보',
    creat_at         DATETIME NOT NULL COMMENT '생성 일시',
    upd_at           DATETIME NOT NULL COMMENT '수정 일시',
    PRIMARY KEY (br_info_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. PROGRAM (지점 운동 프로그램)
CREATE TABLE IF NOT EXISTS PROGRAM (
    prog_id      BIGINT AUTO_INCREMENT NOT NULL COMMENT '프로그램ID',
    prog_nm      VARCHAR(255)   NOT NULL COMMENT '프로그램명',
    sport_id     BIGINT         NOT NULL COMMENT '스포츠 아이디',
    brch_id      BIGINT         NOT NULL COMMENT '지점 아이디',
    use_yn       TINYINT(1)     NOT NULL DEFAULT 1 COMMENT '사용여부',
    one_time_amt DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '단건결제금액',
    reg_dt       DATETIME       NOT NULL COMMENT '등록일시',
    upd_dt       DATETIME       NOT NULL COMMENT '수정일시',
    PRIMARY KEY (prog_id),
    CONSTRAINT FK_PROGRAM_SPORT FOREIGN KEY (sport_id) REFERENCES SPORT_TYPE (sport_id),
    CONSTRAINT FK_PROGRAM_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. PASS_PRODUCT (이용권 상품)
CREATE TABLE IF NOT EXISTS PASS_PRODUCT (
    prod_id  BIGINT AUTO_INCREMENT NOT NULL COMMENT '상품ID',
    sport_id BIGINT         NOT NULL COMMENT '스포츠ID',
    prod_nm  VARCHAR(100)   NOT NULL COMMENT '상품명',
    prod_amt DECIMAL(19, 4) NOT NULL COMMENT '가격',
    prv_cnt  INT            NOT NULL COMMENT '제공횟수',
    use_yn   TINYINT(1)     NOT NULL DEFAULT 1 COMMENT '판매여부',
    reg_dt   DATETIME       NOT NULL COMMENT '등록일시',
    upd_dt   DATETIME       NOT NULL COMMENT '수정일시',
    PRIMARY KEY (prod_id),
    CONSTRAINT FK_PASS_PRODUCT_SPORT FOREIGN KEY (sport_id) REFERENCES SPORT_TYPE (sport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. USER_PASS (회원 이용권)
CREATE TABLE IF NOT EXISTS USER_PASS (
    user_pass_id   BIGINT AUTO_INCREMENT NOT NULL COMMENT '보유이용권ID',
    user_id        VARCHAR(50) NOT NULL COMMENT '회원ID',
    sport_id       BIGINT      NOT NULL COMMENT '스포츠ID',
    pass_status_cd VARCHAR(50) NOT NULL COMMENT '상태코드',
    rmn_cnt        INT         NOT NULL DEFAULT 0 COMMENT '잔여횟수',
    lst_prod_id    BIGINT      NULL     COMMENT '마지막구매상품ID',
    reg_dt         DATETIME    NOT NULL COMMENT '등록일시',
    upd_dt         DATETIME    NOT NULL COMMENT '수정일시',
    init_cnt       INT         NOT NULL COMMENT '초기구매수량',
    PRIMARY KEY (user_pass_id),
    UNIQUE KEY UK_USER_PASS_USER_SPORT (user_id, sport_id),
    CONSTRAINT FK_USER_PASS_USER FOREIGN KEY (user_id) REFERENCES USERS (user_id),
    CONSTRAINT FK_USER_PASS_SPORT FOREIGN KEY (sport_id) REFERENCES SPORT_TYPE (sport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. SCHEDULE (스케줄)
CREATE TABLE IF NOT EXISTS SCHEDULE (
    schd_id     BIGINT AUTO_INCREMENT NOT NULL COMMENT '스케줄ID',
    prog_id     BIGINT      NOT NULL COMMENT '프로그램ID',
    user_id     VARCHAR(50) NOT NULL COMMENT '강사ID',
    brch_id     BIGINT      NOT NULL COMMENT '지점ID',
    strt_dt     DATE        NOT NULL COMMENT '시작 날짜',
    strt_tm     TIME        NOT NULL COMMENT '시작 시간',
    end_tm      TIME        NOT NULL COMMENT '종료 시간',
    max_nop_cnt INT         NOT NULL COMMENT '정원',
    rsv_cnt     INT         NOT NULL DEFAULT 0 COMMENT '현재예약인원',
    stts_cd     VARCHAR(20) NOT NULL COMMENT '상태코드',
    description TEXT        NULL     COMMENT '수업 설명',
    reg_dt      DATETIME    NOT NULL COMMENT '등록일시',
    upd_dt      DATETIME    NOT NULL COMMENT '수정일시',
    PRIMARY KEY (schd_id),
    CONSTRAINT FK_SCHEDULE_PROGRAM FOREIGN KEY (prog_id) REFERENCES PROGRAM (prog_id),
    CONSTRAINT FK_SCHEDULE_TEACHER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id),
    CONSTRAINT FK_SCHEDULE_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. RESERVATION (예약)
CREATE TABLE IF NOT EXISTS RESERVATION (
    rsv_id    BIGINT AUTO_INCREMENT NOT NULL COMMENT '예약ID',
    user_id   VARCHAR(50) NOT NULL COMMENT '회원ID',
    schd_id   BIGINT      NOT NULL COMMENT '스케줄ID',
    brch_id   BIGINT      NOT NULL COMMENT '지점ID',
    user_pass_id   BIGINT      NULL     COMMENT '사용이용권ID',
    stts_cd   VARCHAR(20) NOT NULL COMMENT '상태코드',
    rsv_dt    DATE        NOT NULL COMMENT '예약날짜',
    rsv_time  TIME        NOT NULL COMMENT '예약시간',
    attendance_status VARCHAR(50) NULL COMMENT '출석관리',
    review_written    TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '리뷰작성',
    reg_dt    DATETIME    NOT NULL COMMENT '등록일시',
    upd_dt    DATETIME    NOT NULL COMMENT '수정일시',
    cncl_rsn  VARCHAR(255) NULL    COMMENT '취소/변경사유',
    upd_id    VARCHAR(50) NULL     COMMENT '수정자ID(관리자)',
    PRIMARY KEY (rsv_id),
    CONSTRAINT FK_RESERVATION_USER FOREIGN KEY (user_id) REFERENCES USERS (user_id),
    CONSTRAINT FK_RESERVATION_SCHEDULE FOREIGN KEY (schd_id) REFERENCES SCHEDULE (schd_id),
    CONSTRAINT FK_RESERVATION_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id),
    CONSTRAINT FK_RESERVATION_PASS FOREIGN KEY (user_pass_id) REFERENCES USER_PASS (user_pass_id),
    CONSTRAINT FK_RESERVATION_UPDATER FOREIGN KEY (upd_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 11. CLASS_ATTENDANCE (출석)
CREATE TABLE IF NOT EXISTS CLASS_ATTENDANCE (
    atnd_id    BIGINT AUTO_INCREMENT NOT NULL COMMENT '출석 ID',
    rsv_id     BIGINT      NOT NULL UNIQUE COMMENT '예약 ID',
    atnd_yn    TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '출석 여부',
    checkin_at DATETIME    NULL     COMMENT '체크인 일시',
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (atnd_id),
    CONSTRAINT FK_ATTENDANCE_RESERVATION FOREIGN KEY (rsv_id) REFERENCES RESERVATION (rsv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 12. PAYMENT (결제)
CREATE TABLE IF NOT EXISTS PAYMENT (
    pay_id      BIGINT AUTO_INCREMENT NOT NULL COMMENT '결제ID',
    ord_no      VARCHAR(100)   NOT NULL UNIQUE COMMENT '주문번호',
    user_id     VARCHAR(50)    NOT NULL COMMENT '회원ID',
    pay_type_cd VARCHAR(20)    NOT NULL COMMENT '결제유형',
    pay_amt     DECIMAL(19, 4) NOT NULL COMMENT '결제금액',
    pay_method  VARCHAR(20)    NOT NULL COMMENT '결제수단',
    target_name VARCHAR(100)   NOT NULL COMMENT '결제 대상 이름',
    stts_cd     VARCHAR(20)    NOT NULL COMMENT '상태코드',
    reg_dt      DATETIME       NOT NULL COMMENT '등록일시',
    pg_order_no VARCHAR(100)   NULL     COMMENT 'PG 주문번호',
    target_id   BIGINT         NULL     COMMENT '대상 ID',
    PRIMARY KEY (pay_id),
    CONSTRAINT FK_PAYMENT_USER FOREIGN KEY (user_id) REFERENCES USERS (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 13. PASS_LOG (이용권 로그)
CREATE TABLE IF NOT EXISTS PASS_LOG (
    pass_log_id  BIGINT AUTO_INCREMENT NOT NULL COMMENT '이력ID',
    user_pass_id BIGINT       NOT NULL COMMENT '이용권ID',
    chg_type_cd  VARCHAR(30)  NOT NULL COMMENT '변경유형',
    chg_cnt      INT          NOT NULL COMMENT '변경수량',
    chg_rsn      VARCHAR(255) NULL     COMMENT '변경사유',
    pocs_user_id VARCHAR(50)  NULL     COMMENT '처리자ID',
    reg_dt       DATETIME     NOT NULL COMMENT '등록일시',
    PRIMARY KEY (pass_log_id),
    CONSTRAINT FK_PASS_LOG_PASS FOREIGN KEY (user_pass_id) REFERENCES USER_PASS (user_pass_id),
    CONSTRAINT FK_PASS_LOG_ADMIN FOREIGN KEY (pocs_user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 14. PASS_TRADE_POST (이용권 거래 게시글)
CREATE TABLE IF NOT EXISTS PASS_TRADE_POST (
    post_id      BIGINT AUTO_INCREMENT NOT NULL COMMENT '게시글ID',
    seller_id    VARCHAR(50)    NOT NULL COMMENT '판매자ID',
    user_pass_id BIGINT         NOT NULL COMMENT '이용권ID',
    title        VARCHAR(255)   NOT NULL COMMENT '제목',
    cntnt        TEXT           NOT NULL COMMENT '본문',
    sell_qty     INT            NOT NULL COMMENT '판매수량',
    sale_amt     DECIMAL(19, 4) NOT NULL COMMENT '판매희망가',
    stts_cd      VARCHAR(20)    NOT NULL COMMENT '상태코드',
    del_yn       TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '삭제여부',
    reg_dt       DATETIME       NOT NULL COMMENT '등록일시',
    upd_dt       DATETIME       NOT NULL COMMENT '수정일시',
    PRIMARY KEY (post_id),
    CONSTRAINT FK_TRADE_POST_SELLER FOREIGN KEY (seller_id) REFERENCES USERS (user_id),
    CONSTRAINT FK_TRADE_POST_PASS FOREIGN KEY (user_pass_id) REFERENCES USER_PASS (user_pass_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 15. PASS_TRADE_TRANSACTION (거래 내역)
CREATE TABLE IF NOT EXISTS PASS_TRADE_TRANSACTION (
    transaction_id BIGINT AUTO_INCREMENT NOT NULL COMMENT '거래ID',
    post_id       BIGINT         NOT NULL COMMENT '게시글ID',
    buyer_id VARCHAR(50)    NOT NULL COMMENT '구매자ID',
    seller_id VARCHAR(50)    NOT NULL COMMENT '판매자ID',
    trade_amt     DECIMAL(19, 4) NOT NULL COMMENT '실거래금액',
    stts_cd       VARCHAR(20)    NOT NULL COMMENT '상태',
    reg_dt        DATETIME       NOT NULL COMMENT '거래일시',
    upd_dt        DATETIME       NOT NULL COMMENT '거래일시',
    buy_qty       INT            NOT NULL COMMENT '구매수량',
    payment_id    BIGINT         NOT NULL COMMENT '결제ID',
    PRIMARY KEY (transaction_id),
    CONSTRAINT FK_TRADE_TRANS_POST FOREIGN KEY (post_id) REFERENCES PASS_TRADE_POST (post_id),
    CONSTRAINT FK_TRADE_TRANS_BUYER FOREIGN KEY (buyer_id) REFERENCES USERS (user_id),
    CONSTRAINT FK_TRADE_TRANS_PAYMENT FOREIGN KEY (payment_id) REFERENCES PAYMENT (pay_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 16. COMMUNITY_POST (커뮤니티)
CREATE TABLE IF NOT EXISTS COMMUNITY_POST (
    post_id          BIGINT AUTO_INCREMENT NOT NULL COMMENT '게시글ID',
    post_type        VARCHAR(20)  NOT NULL COMMENT '게시글 유형',
    category         VARCHAR(20)  NULL     COMMENT '카테고리',
    title            VARCHAR(255) NOT NULL COMMENT '제목',
    content          TEXT         NOT NULL COMMENT '내용',
    writer_id        VARCHAR(50)  NOT NULL COMMENT '작성자ID',
    writer_type      VARCHAR(20)  NOT NULL COMMENT '작성자구분',
    branch_id        BIGINT       NULL     COMMENT '소속 지점 ID',
    views            INT          NOT NULL DEFAULT 0 COMMENT '조회수',
    created_at       DATETIME     NOT NULL COMMENT '생성일',
    updated_at       DATETIME     NOT NULL COMMENT '수정일',
    sport_type       VARCHAR(50)  NULL     COMMENT '운동종목',
    recruit_max      INT          NULL     COMMENT '모집 인원 수',
    recruit_datetime DATETIME     NULL     COMMENT '운동 날짜/시간(모집)',
    recruit_end_date DATETIME     NULL     COMMENT '모집 마감일',
    display_start    DATETIME     NULL     COMMENT '공지 게시 시작일',
    display_end      DATETIME     NULL     COMMENT '공지 게시 종료일',
    is_visible       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '공지 노출 여부',
    is_pinned		 TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '상단 고정기능',
    post_visible     TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '관리자 숨김 여부',
    PRIMARY KEY (post_id),
    CONSTRAINT FK_COMMUNITY_POST_BRANCH FOREIGN KEY (branch_id) REFERENCES BRANCH (brch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 17. COMMUNITY_RECRUIT_JOIN (모집 참여)
CREATE TABLE IF NOT EXISTS COMMUNITY_RECRUIT_JOIN (
    join_id   BIGINT AUTO_INCREMENT NOT NULL COMMENT '참여ID',
    post_id   BIGINT      NOT NULL COMMENT '게시글ID',
    user_id   VARCHAR(50) NOT NULL COMMENT '참여자ID',
    join_type VARCHAR(20) NOT NULL DEFAULT 'JOIN' COMMENT '참여유형',
    PRIMARY KEY (join_id),
    CONSTRAINT FK_RECRUIT_JOIN_POST FOREIGN KEY (post_id) REFERENCES COMMUNITY_POST (post_id),
    CONSTRAINT FK_RECRUIT_JOIN_USER FOREIGN KEY (user_id) REFERENCES USERS (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 18. COMMUNITY_COMMENT (댓글)
CREATE TABLE IF NOT EXISTS COMMUNITY_COMMENT (
    comment_id      BIGINT AUTO_INCREMENT NOT NULL COMMENT '댓글ID',
    post_id         BIGINT      NOT NULL COMMENT '게시글ID',
    writer_id       VARCHAR(50) NOT NULL COMMENT '작성자ID',
    writer_type     VARCHAR(20) NOT NULL COMMENT '작성자구분',
    content         TEXT        NOT NULL COMMENT '내용',
    created_at      DATETIME    NOT NULL COMMENT '작성일',
    comment_visible TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '공개여부(Default 1)',
    PRIMARY KEY (comment_id),
    CONSTRAINT FK_COMMUNITY_COMMENT_POST FOREIGN KEY (post_id) REFERENCES COMMUNITY_POST (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 19. FAQ
CREATE TABLE IF NOT EXISTS FAQ (
    faq_id     BIGINT AUTO_INCREMENT NOT NULL COMMENT 'FAQ ID',
    user_id    VARCHAR(50)  NOT NULL COMMENT '작성자ID',
    category   VARCHAR(255) NOT NULL COMMENT '카테고리',
    question   TEXT         NOT NULL COMMENT '질문',
    answer     TEXT         NULL     COMMENT '답변',
    created_at DATETIME     NOT NULL COMMENT '작성시간',
    sort_order INT          NOT NULL COMMENT '정렬순서',
    PRIMARY KEY (faq_id),
    CONSTRAINT FK_FAQ_USER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 20. FAVORITE (즐겨찾기)
CREATE TABLE IF NOT EXISTS FAVORITE (
    favorite_id BIGINT AUTO_INCREMENT NOT NULL COMMENT '즐겨찾기ID',
    user_id     VARCHAR(50) NOT NULL COMMENT '회원ID',
    post_id     BIGINT      NOT NULL COMMENT '게시글ID',
    PRIMARY KEY (favorite_id),
    CONSTRAINT FK_FAVORITE_USER FOREIGN KEY (user_id) REFERENCES USERS (user_id),
    CONSTRAINT FK_FAVORITE_POST FOREIGN KEY (post_id) REFERENCES PASS_TRADE_POST (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 21. REVIEW (리뷰)
CREATE TABLE IF NOT EXISTS REVIEW (
    rvw_id  BIGINT AUTO_INCREMENT NOT NULL COMMENT '리뷰ID',
    rsv_id  BIGINT         NOT NULL COMMENT '예약ID',
    rating  DECIMAL(2, 1)  NOT NULL COMMENT '별점',
    content TEXT           NULL     COMMENT '내용',
    inst_id VARCHAR(50)    NOT NULL COMMENT '강사ID',
    reg_dt  DATETIME       NOT NULL COMMENT '작성일',
    PRIMARY KEY (rvw_id),
    CONSTRAINT FK_REVIEW_RESERVATION FOREIGN KEY (rsv_id) REFERENCES RESERVATION (rsv_id),
    CONSTRAINT FK_REVIEW_INSTRUCTOR FOREIGN KEY (inst_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 22. TEACHER_PROFILE (강사 프로필)
CREATE TABLE IF NOT EXISTS TEACHER_PROFILE (
    user_id         VARCHAR(50)  NOT NULL COMMENT '강사ID',
    brch_id         BIGINT       NOT NULL COMMENT '지점ID',
    stts_cd         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '상태코드',
    hire_dt         DATE         NOT NULL COMMENT '입사일',
    leave_dt        DATE         NULL     COMMENT '퇴사일',
    leave_rsn       VARCHAR(255) NULL     COMMENT '퇴사사유',
    intro           VARCHAR(255) NULL     COMMENT '소개',
    profile_img_url VARCHAR(500) NULL     COMMENT '이미지URL',
    reg_dt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id     VARCHAR(50)  NULL     COMMENT '수정자ID',
    PRIMARY KEY (user_id),
    CONSTRAINT FK_TEACHER_PROFILE_USER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id),
    CONSTRAINT FK_TEACHER_PROFILE_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id),
    CONSTRAINT FK_TEACHER_PROFILE_UPDATER FOREIGN KEY (upd_user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 23. TEACHER_SPORT (강사 운동 종목)
CREATE TABLE IF NOT EXISTS TEACHER_SPORT (
    user_id  VARCHAR(50) NOT NULL COMMENT '강사ID',
    sport_id BIGINT      NOT NULL COMMENT '운동종목ID',
    main_yn  TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '대표종목여부',
    sort_no  INT         NOT NULL DEFAULT 1 COMMENT '표시순서',
    reg_dt   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (user_id, sport_id),
    CONSTRAINT FK_TEACHER_SPORT_USER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id),
    CONSTRAINT FK_TEACHER_SPORT_TYPE FOREIGN KEY (sport_id) REFERENCES SPORT_TYPE (sport_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 24. TEACHER_CAREER (강사 경력)
CREATE TABLE IF NOT EXISTS TEACHER_CAREER (
    career_id   BIGINT AUTO_INCREMENT NOT NULL COMMENT '경력ID',
    user_id     VARCHAR(50)  NOT NULL COMMENT '강사ID',
    org_nm      VARCHAR(255) NOT NULL COMMENT '기관명',
    role_nm     VARCHAR(255) NULL     COMMENT '역할',
    strt_dt     DATE         NOT NULL COMMENT '시작일',
    end_dt      DATE         NULL     COMMENT '종료일',
    reg_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id VARCHAR(50)  NULL     COMMENT '수정자ID',
    PRIMARY KEY (career_id),
    CONSTRAINT FK_TEACHER_CAREER_USER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id),
    CONSTRAINT FK_TEACHER_CAREER_UPDATER FOREIGN KEY (upd_user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 25. TEACHER_CERTIFICATE (강사 자격증)
CREATE TABLE IF NOT EXISTS TEACHER_CERTIFICATE (
    cert_id     BIGINT AUTO_INCREMENT NOT NULL COMMENT '자격증ID',
    user_id     VARCHAR(50)  NOT NULL COMMENT '강사ID',
    cert_nm     VARCHAR(255) NOT NULL COMMENT '자격증명',
    issuer      VARCHAR(255) NULL     COMMENT '발급기관',
    acq_dt      DATE         NULL     COMMENT '취득일',
    cert_no     VARCHAR(100) NULL     COMMENT '자격증번호',
    reg_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id VARCHAR(50)  NULL     COMMENT '수정자ID',
    PRIMARY KEY (cert_id),
    CONSTRAINT FK_TEACHER_CERT_USER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id),
    CONSTRAINT FK_TEACHER_CERT_UPDATER FOREIGN KEY (upd_user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 26. TEACHER_SETTLEMENT (강사 정산)
CREATE TABLE IF NOT EXISTS TEACHER_SETTLEMENT (
    stlm_id     BIGINT AUTO_INCREMENT NOT NULL COMMENT '정산ID',
    stlm_month  VARCHAR(7)     NOT NULL COMMENT '정산월',
    brch_id     BIGINT         NOT NULL COMMENT '지점ID',
    user_id     VARCHAR(50)    NOT NULL COMMENT '강사ID',
    class_cnt   INT            NOT NULL DEFAULT 0 COMMENT '수업횟수',
    gross_amt   DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '수업료합계',
    fee_rate    DECIMAL(5, 2)  NOT NULL DEFAULT 10 COMMENT '수수료율',
    fee_amt     DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '수수료금액',
    net_amt     DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '지급금액',
    stts_cd     VARCHAR(20)    NOT NULL DEFAULT 'TARGET' COMMENT '정산상태(TARGET/PAID/HOLD)',
    pay_pln_dt  DATE           NULL     COMMENT '지급 예정일',
    paid_dt     DATE           NULL     COMMENT '지급 완료일',
    reg_dt      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id VARCHAR(50)    NULL     COMMENT '수정자ID',
    PRIMARY KEY (stlm_id),
    CONSTRAINT FK_SETTLEMENT_BRANCH FOREIGN KEY (brch_id) REFERENCES BRANCH (brch_id),
    CONSTRAINT FK_SETTLEMENT_USER FOREIGN KEY (user_id) REFERENCES USERS_ADMIN (user_id),
    CONSTRAINT FK_SETTLEMENT_UPDATER FOREIGN KEY (upd_user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 27. TEACHER_SETTLEMENT_ITEM (정산 상세)
CREATE TABLE IF NOT EXISTS TEACHER_SETTLEMENT_ITEM (
    stlm_item_id BIGINT AUTO_INCREMENT NOT NULL COMMENT '정산상세ID',
    stlm_id      BIGINT         NOT NULL COMMENT '정산ID',
    schd_id      BIGINT         NOT NULL COMMENT '회차ID',
    gross_amt    DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '수업료',
    fee_amt      DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '수수료',
    net_amt      DECIMAL(19, 4) NOT NULL DEFAULT 0 COMMENT '지급금',
    line_stts_cd VARCHAR(20)    NOT NULL DEFAULT 'NORMAL' COMMENT '라인상태',
    reg_dt       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    upd_dt       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
    upd_user_id  VARCHAR(50)    NULL     COMMENT '수정자ID',
    PRIMARY KEY (stlm_item_id),
    CONSTRAINT FK_SETTLEMENT_ITEM_MAIN FOREIGN KEY (stlm_id) REFERENCES TEACHER_SETTLEMENT (stlm_id),
    CONSTRAINT FK_SETTLEMENT_ITEM_SCHD FOREIGN KEY (schd_id) REFERENCES SCHEDULE (schd_id),
    CONSTRAINT FK_SETTLEMENT_ITEM_UPDATER FOREIGN KEY (upd_user_id) REFERENCES USERS_ADMIN (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==========================================
-- 3. ENABLE FOREIGN KEY CHECKS
-- ==========================================
SET FOREIGN_KEY_CHECKS = 1;