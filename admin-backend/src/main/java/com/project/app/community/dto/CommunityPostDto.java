package com.project.app.community.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class CommunityPostDto {

	private Long postId;
	private String postType;
	private String category;
	private String title;
	private String content;

	// 🔥 writerId = USERS.user_id (UUID)
//    private String writerId;
	private String writerEmail;
	private String writerType;

	private Long branchId;
	private Integer views;
	private Date createdAt;
	private Date updatedAt;

	private String sportType;
	private Integer recruitMax;
	private Date recruitDatetime;
	private Date recruitEndDate;
	private Date displayStart;
	private Date displayEnd;

	// 관리자 숨김 여부
	private Boolean postVisible;

	// ADMIN 모집 참여자 목록
	private List<RecruitUserDto> recruitUsers;
}
