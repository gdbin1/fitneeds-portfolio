CREATE TABLE `RESERVATION` (
    `rsv_id`       BIGINT          NOT NULL AUTO_INCREMENT,
    `user_id`      VARCHAR(50)     NOT NULL COMMENT '예약 사용자 ID',
    `schd_id`      BIGINT          NOT NULL COMMENT '스케줄 ID',
    `brch_id`      BIGINT          NOT NULL COMMENT '지점 ID',
    `user_pass_id` BIGINT          NULL     COMMENT '사용된 이용권 ID (결제수단이 이용권인 경우)',
    `stts_cd`      VARCHAR(20)     NOT NULL COMMENT '예약상태 (CONFIRMED, CANCELED, COMPLETED)',
    `rsv_dt`       DATE            NOT NULL COMMENT '예약 날짜',
    `rsv_time`     TIME            NOT NULL COMMENT '예약 시간',
    `cncl_rsn`     VARCHAR(255)    NULL     COMMENT '취소 사유',
    `upd_user_id`  VARCHAR(50)     NULL     COMMENT '최종 수정자 ID',
    `reg_dt`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    `upd_dt`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    
    PRIMARY KEY (`rsv_id`),
    
    -- 외래 키 설정
    CONSTRAINT `fk_rsv_user` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`user_id`),
    CONSTRAINT `fk_rsv_schd` FOREIGN KEY (`schd_id`) REFERENCES `SCHEDULE` (`schd_id`),
    CONSTRAINT `fk_rsv_brch` FOREIGN KEY (`brch_id`) REFERENCES `BRANCH` (`brch_id`),
    CONSTRAINT `fk_rsv_pass` FOREIGN KEY (`user_pass_id`) REFERENCES `USER_PASS` (`user_pass_id`),
    
    -- 성능 최적화를 위한 인덱스 (사용자별 조회 및 스케줄별 조회)
    INDEX `idx_rsv_user_dt` (`user_id`, `rsv_dt`),
    INDEX `idx_rsv_schd` (`schd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;