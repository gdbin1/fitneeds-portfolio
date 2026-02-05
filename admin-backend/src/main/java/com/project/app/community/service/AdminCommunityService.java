package com.project.app.community.service;

import com.project.app.community.dto.CommunityPostDto;
import com.project.app.community.mapper.AdminCommunityMapper;
import com.project.app.community.mapper.AdminCommunityCommentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.community.dto.RecruitUserDto;

import java.util.List;
import java.util.Map;

@Service
public class AdminCommunityService {

	private static final int PAGE_SIZE = 10;

	private final AdminCommunityMapper adminCommunityMapper;
	private final AdminCommunityCommentMapper adminCommunityCommentMapper; // ✅ 추가

	// ✅ 생성자 주입
	public AdminCommunityService(AdminCommunityMapper adminCommunityMapper,
			AdminCommunityCommentMapper adminCommunityCommentMapper) {
		this.adminCommunityMapper = adminCommunityMapper;
		this.adminCommunityCommentMapper = adminCommunityCommentMapper;
	}

	/**
	 * ADMIN 커뮤니티 목록 조회 (기존 유지)
	 */
	public List<CommunityPostDto> getCommunityPostList(String category, String keyword, Integer visible,
			String orderType, int page) {
		int offset = (page - 1) * PAGE_SIZE;

		return adminCommunityMapper.selectCommunityPostList(category, keyword, visible, orderType, PAGE_SIZE, offset);
	}

	public int getCommunityPostCount(String category, String keyword, Integer visible) {
		return adminCommunityMapper.selectCommunityPostCount(category, keyword, visible);
	}

	public AdminPagedResult<CommunityPostDto> getCommunityPostPaged(String category, String keyword, Integer visible,
			String orderType, int page) {
		int offset = (page - 1) * PAGE_SIZE;

		List<CommunityPostDto> list = adminCommunityMapper.selectCommunityPostList(category, keyword, visible,
				orderType, PAGE_SIZE, offset);

		int totalCount = adminCommunityMapper.selectCommunityPostCount(category, keyword, visible);

		int totalPages = (int) Math.ceil((double) totalCount / PAGE_SIZE);

		return new AdminPagedResult<>(list, page, totalPages, totalCount);
	}

	public CommunityPostDto getCommunityPostDetail(Long postId) {
		return adminCommunityMapper.selectCommunityPostDetail(postId);
	}

	public void updatePostVisible(Long postId, Boolean postVisible) {
		adminCommunityMapper.updatePostVisible(postId, postVisible);
	}

	/**
	 * ✅ ADMIN 커뮤니티 글 삭제 - 댓글 있으면 삭제 불가 - 댓글 없을 때만 게시글 삭제
	 */
	@Transactional
	public boolean deleteCommunityPost(Long postId) {

		// 1️⃣ 댓글 개수
		int commentCount = adminCommunityCommentMapper.selectCommentCountByPostId(postId);

		// 2️⃣ 모집 참여자 개수
		int recruitJoinCount = adminCommunityMapper.selectRecruitJoinCountByPostId(postId);

		// ❌ 하나라도 있으면 삭제 불가
		if (commentCount > 0 || recruitJoinCount > 0) {
			return false;
		}

		// ✅ 둘 다 없을 때만 게시글 삭제
		adminCommunityMapper.deleteCommunityPost(postId);
		return true;
	}

	/**
	 * ✅ ADMIN 모집 참여자 목록 조회
	 */
	public List<RecruitUserDto> getRecruitUsersByPostId(Long postId) {
		return adminCommunityMapper.selectRecruitUsersByPostId(postId);
	}

	/**
	 * ✅ ADMIN 모집 참여자 삭제
	 */
	@Transactional
	public void deleteRecruitJoin(Long joinId) {
		adminCommunityMapper.deleteRecruitJoin(joinId);
	}

	public static class AdminPagedResult<T> {
		private List<T> list;
		private int currentPage;
		private int totalPages;
		private int totalCount;

		public AdminPagedResult(List<T> list, int currentPage, int totalPages, int totalCount) {
			this.list = list;
			this.currentPage = currentPage;
			this.totalPages = totalPages;
			this.totalCount = totalCount;
		}

		public List<T> getList() {
			return list;
		}

		public int getCurrentPage() {
			return currentPage;
		}

		public int getTotalPages() {
			return totalPages;
		}

		public int getTotalCount() {
			return totalCount;
		}
	}
}
