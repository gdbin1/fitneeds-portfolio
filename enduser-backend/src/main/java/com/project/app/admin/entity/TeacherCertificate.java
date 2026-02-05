package com.project.app.admin.entity;

import java.time.LocalDate;

import com.project.app.aspect.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "TEACHER_CERTIFICATE", indexes = {
		@Index(name = "idx_teacher_certificate_user_id", columnList = "user_id"),
		@Index(name = "idx_teacher_certificate_upd_user_id", columnList = "upd_user_id")
})
public class TeacherCertificate extends BaseTimeEntity {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CERT_ID")
    private Long certId;			// 자격증 아이디
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private UserAdmin userAdmin;	// 강사 아이디 매칭
	
	@Column(name = "CERT_NM", length = 255, nullable = false)
    private String certNm;			// 자격증 이름
	
	@Column(name = "ISSUER", length = 255)
    private String issuer;			// 발급 기관
	
	@Column(name = "acq_dt")
    private LocalDate acqDt;		// 발급일
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UPD_USER_ID")
    private UserAdmin updUser;		// 수정자 아이디
}
