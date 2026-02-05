package com.project.app.reservation.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import org.hibernate.annotations.ColumnDefault;

import com.project.app.aspect.BaseTimeEntity;
import com.project.app.branch.entity.Branch;
import com.project.app.schedule.entity.Schedule;
import com.project.app.user.entity.User;
import com.project.app.userpass.entity.UserPass;

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
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "RESERVATION", indexes = { @Index(name = "idx_rsv_user_dt", columnList = "user_id, rsv_dt"),
		@Index(name = "idx_rsv_schd", columnList = "schd_id") })
public class Reservation extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "rsv_id", nullable = false)
	private Long rsvId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "schd_id", nullable = false)
	private Schedule schedule;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "brch_id", nullable = false)
	private Branch branch;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_pass_id", nullable = true)
	private UserPass userPass;

	@Column(name = "stts_cd", nullable = false)
	@Enumerated(EnumType.STRING)
	private RsvSttsCd sttsCd;

	@Column(name = "rsv_dt", nullable = false)
	private LocalDate rsvDt;

	@Column(name = "rsv_time", nullable = false)
	private LocalTime rsvTime;

	@Column(name = "cncl_rsn", nullable = true, length = 255)
	private String cnclRsn;

	@Column(name = "upd_id", nullable = true)
	private String updId;

//	@ColumnDefault("0")
//	@Column(name = "review_written", nullable = false, columnDefinition = "TINYINT(0)")
//	private Boolean reviewWritten;

	// 추가)
	@Column(name = "review_written", nullable = false)
	private Boolean reviewWritten = false;

	// 추가)
	@Column(name = "attendance_status")
	@Enumerated(EnumType.STRING)
	private AttendanceStatus attendanceStatus = AttendanceStatus.UNCHECKED;

	// 추가)출석 상태 조회
	public AttendanceStatus getAttendanceStatus() {
		return this.attendanceStatus;
	}

	// 추가)출석 상태 업데이트
	public void updateAttendanceStatus(AttendanceStatus attendanceStatus) {
		this.attendanceStatus = attendanceStatus;
	}

	// 예약 취소 등 상태 변경 로직을 여기에 캡슐화 할 수 있습니다.
	public void cancel(String reason, String updId) {
		if (this.sttsCd == RsvSttsCd.CONFIRMED) { // 확정 상태일 때만 취소 가능
			this.sttsCd = RsvSttsCd.CANCELED;
			this.cnclRsn = reason;
//			this.updId = updId;
			// updDt는 @LastModifiedDate에 의해 자동으로 업데이트 됩니다.
		} else {
			throw new IllegalStateException("확정 상태가 아니므로 예약을 취소할 수 없습니다.");
		}
	}

	// (옵션) 예약이 완료되었음을 표시하는 로직 (스케줄 시간 경과 후)
	public void complete() {
		if (this.sttsCd == RsvSttsCd.CONFIRMED) {
			this.sttsCd = RsvSttsCd.COMPLETED;
		}
	}
}