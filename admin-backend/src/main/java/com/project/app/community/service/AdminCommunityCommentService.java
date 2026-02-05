package com.project.app.community.service;

import com.project.app.community.dto.CommunityCommentDto;
import com.project.app.community.mapper.AdminCommunityCommentMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCommunityCommentService {

	private final AdminCommunityCommentMapper mapper;

	public AdminCommunityCommentService(AdminCommunityCommentMapper mapper) {
		this.mapper = mapper;
	}

	/**
	 * ADMIN 댓글 목록 조회 (전체)
	 */
	public List<CommunityCommentDto> getCommentsByPostId(Long postId, int page) {
		// page 파라미터는 유지 (프론트/컨트롤러 영향 없음)
		return mapper.selectCommentsByPostIdPaged(postId);
	}

	public int getCommentCountByPostId(Long postId) {
		return mapper.selectCommentCountByPostId(postId);
	}

	public void updateCommentVisible(Long commentId, Integer commentVisible) {
		mapper.updateCommentVisible(commentId, commentVisible);
	}

	public void deleteComment(Long commentId) {
		mapper.deleteComment(Long.valueOf(commentId));
	}
}
