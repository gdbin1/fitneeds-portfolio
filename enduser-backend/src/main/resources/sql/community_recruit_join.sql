========커뮤니티 모집 전용 테이블========================================

CREATE TABLE community_recruit_join (
join_id   BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '모집 참여 PK',
post_id   BIGINT(20) NOT NULL COMMENT '모집 게시글 ID',
user_id   VARCHAR(50) NOT NULL COMMENT '참여 사용자 ID',
join_type VARCHAR(20) NOT NULL COMMENT '참여 타입 (JOIN 등)',

PRIMARY KEY (join_id),
KEY idx_post_id (post_id),
KEY idx_user_id (user_id)
);

INSERT INTO community_recruit_join (post_id, user_id, join_type)
VALUES (1, 'user2', 'USER');
