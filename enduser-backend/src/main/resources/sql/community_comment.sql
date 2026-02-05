========커뮤니티 댓글 전용 테이블========================================

CREATE TABLE COMMUNITY_COMMENT (
comment_id      BIGINT(20) NOT NULL AUTO_INCREMENT,
post_id         BIGINT(20) NOT NULL,
writer_id       VARCHAR(50) NOT NULL,
writer_type     VARCHAR(20) NOT NULL,
content         TEXT NOT NULL,
created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
comment_visible TINYINT(1) NOT NULL DEFAULT 1,

PRIMARY KEY (comment_id),
KEY post_id (post_id)
);

INSERT INTO COMMUNITY_COMMENT (post_id, writer_id, writer_type, content, comment_visible)
VALUES (1, 'user2', 'USER', '저도 참여하고 싶어요!', 1);
