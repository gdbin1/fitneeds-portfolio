CREATE TABLE `PAYMENT` (
    `pay_id`       BIGINT          NOT NULL AUTO_INCREMENT,
    `ord_no`       VARCHAR(100)    NOT NULL COMMENT '주문번호',
    `user_id`      VARCHAR(50)     NOT NULL COMMENT '사용자 ID',
    `pay_type_cd`  VARCHAR(20)     NOT NULL COMMENT '결제 유형',
    `target_id`       BIGINT          NULL     COMMENT '참조 ID',
    `pay_amt`      DECIMAL(19,4)   NOT NULL COMMENT '결제 금액',
    `pay_method`   VARCHAR(20)     NOT NULL COMMENT '결제 수단',
    `stts_cd`      VARCHAR(20)     NOT NULL COMMENT '결제 상태',
    `reg_dt`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    
    PRIMARY KEY (`pay_id`),
    UNIQUE KEY `uk_payment_ord_no` (`ord_no`),
    CONSTRAINT `fk_payment_user_id` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`user_id`),
    
    -- 인덱스 추가
    INDEX `idx_payment_user_stts` (`user_id`, `stts_cd`),
    INDEX `idx_payment_ref_lookup` (`pay_type_cd`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;