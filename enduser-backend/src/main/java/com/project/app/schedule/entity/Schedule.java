package com.project.app.schedule.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.annotations.ColumnDefault;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.app.admin.entity.UserAdmin;
import com.project.app.aspect.BaseTimeEntity;
import com.project.app.branch.entity.Branch;
import com.project.app.program.entity.Program;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SCHEDULE", indexes = {
		@Index(name = "idx_schd_strtdt", columnList = "strt_dt"),
		@Index(name = "idx_schd_sttscd", columnList = "stts_cd"),
		@Index(name = "idx_schd_brch_prog", columnList = "brch_id, prog_id")
})
public class Schedule extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "schd_id", nullable = false)
	private Long schdId;			// 스케줄 ID
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "prog_id", nullable = false)
	private Program program;		// 프로그램 ID
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private UserAdmin userAdmin;	// 유저(어드민 - 강사) ID
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "brch_id", nullable = false)
	private Branch branch;
	
	@Column(name = "strt_dt", nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate strtDt;		// 시작 날짜
	
	@Column(name = "strt_tm", nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
	private LocalTime strtTm;		// 시작 시간
	
	@Column(name = "end_tm", nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
	private LocalTime endTm;		// 종료 시간
	
	@Column(name = "max_nop_cnt", nullable = false)
	private Integer maxNopCnt;		// 최대 정원
	
	@Column(name = "rsv_cnt", nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer rsvCnt = 0;			// 현재 인원
	
	@Column(name = "stts_cd", nullable = false, columnDefinition = "VARCHAR(20)")
	@Enumerated(EnumType.STRING)
	private ScheduleSttsCd sttsCd;			// 상태 코드
	
	@Column(name = "description", nullable = true, columnDefinition = "TEXT")
	private String description;		
	
}
