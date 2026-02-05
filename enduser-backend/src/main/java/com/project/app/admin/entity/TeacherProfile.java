package com.project.app.admin.entity;

import java.time.LocalDate;

import com.project.app.aspect.BaseTimeEntity;
import com.project.app.branch.entity.Branch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "TEACHER_PROFILE", indexes = {
		@Index(name = "idx_teacher_profile_brch_id", columnList = "brch_id"),
		@Index(name = "idx_teacher_profile_upd_user_id", columnList = "upd_user_id")
})
public class TeacherProfile extends BaseTimeEntity {
	
	@Id
    @Column(name = "USER_ID", length = 50)
    private String userId;			// 강사 아이디

	@OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "USER_ID")
    private UserAdmin userAdmin;	// 강사 아이디와 1:1 매칭
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "brch_id", nullable = false)
	private Branch branch;			// 지점 아이디
	
	@Enumerated(EnumType.STRING)
    @Column(name = "STTS_CD", length = 20, nullable = false)
    @Builder.Default
    private TeacherProfileSttsCd sttsCd = TeacherProfileSttsCd.ACTIVE; // 강사 상태 코드
	
	@Column(name = "HIRE_DT", nullable = false)
    private LocalDate hireDt;		// 입사일
	
	@Column(name = "LEAVE_DT")
    private LocalDate leaveDt;		// 퇴사일
	
	@Column(name = "LEAVE_RSN", length = 255)
    private String leaveRsn;		// 퇴사사유
	
	@Column(name = "INTRO", length = 255)
    private String intro;
	
	@Column(name = "PROFILE_IMG_URL", length = 500)
    private String profileImgUrl;	// 강사 프로필 이미지 url
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UPD_USER_ID", referencedColumnName = "USER_ID")
    private UserAdmin updUser;		// 수정자 아이디
}
