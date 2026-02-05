package com.project.app.reservation.entity;

import com.project.app.branch.entity.Branch;
import com.project.app.schedule.entity.Schedule;
import com.project.app.ticket.entity.UserPass;
import com.project.app.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "RESERVATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rsv_id")
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
    @JoinColumn(name = "user_pass_id")
    private UserPass pass;

    @Column(name = "stts_cd", nullable = false, length = 20)
    private String sttsCd; // 예약 상태 (예약중, 완료, 취소 등)



    @Column(name = "rsv_dt", nullable = false, updatable = false)
    private LocalDate rsvDt;

    @Column(name = "rsv_time", nullable = false)
    private LocalTime rsvTime;

    // 리뷰 작성 여부 (DB: review_written TINYINT NOT NULL DEFAULT 0)
    @Builder.Default
    @Column(name = "review_written", nullable = false)
    private Boolean reviewWritten = false;


    @Column(name = "cncl_rsn", length = 255)
    private String cnclRsn; // 취소 사유

    @Column(name = "upd_id", length = 50)
    private String updId; // 수정자

    @CreatedDate
    @Column(name = "reg_dt", nullable = false, updatable = false)
    private LocalDateTime regDt;

    @LastModifiedDate
    @Column(name = "upd_dt")
    private LocalDateTime updDt;



    // 추가) 출석 상태 조회
    public AttendanceStatus getAttendanceStatus() {
        return switch (sttsCd) {
            case "ATTENDED" -> AttendanceStatus.ATTENDED;
            case "ABSENT" -> AttendanceStatus.ABSENT;
            default -> AttendanceStatus.UNCHECKED;
        };
    }

    // 출석 상태 변경
    public void changeAttendanceStatus(AttendanceStatus status) {
        switch (status) {
            case ATTENDED -> this.sttsCd = "ATTENDED";
            case ABSENT -> this.sttsCd = "ABSENT";
            case UNCHECKED -> this.sttsCd = "CONFIRMED";
        }
    }

    public static Reservation create(User user, Schedule schedule, UserPass pass, String adminId) {
        return Reservation.builder()
                .user(user)
                .schedule(schedule)
                .branch(schedule.getBranch())
                .pass(pass)
                .rsvDt(schedule.getStrtDt())
                .rsvTime(schedule.getStrtTm())
                .sttsCd("RESERVED")
                .updId(adminId)
                .build();
    }

    /**
     * 예약 상태 변경 (관리자용, updId 포함)
     */
    public void updateStatus(String status, String updatedBy) {
        this.sttsCd = status;
        this.updId = updatedBy;
    }

    /**
     * 예약 시간 업데이트
     */
    public void updateReservationTime(LocalTime reservationTime) {
        if (reservationTime != null) {
            this.rsvTime = reservationTime;
        }
    }

    /**
     * 예약 취소
     */
    public void cancel(String cancelReason, String updatedBy) {
        this.sttsCd = "CANCELED";
        this.cnclRsn = cancelReason;
        this.updId = updatedBy;
    }

    /**
     * 스케줄 변경
     */
    public void changeSchedule(Schedule newSchedule, String updatedBy) {
        this.schedule = newSchedule;
        this.rsvDt = newSchedule.getStrtDt();
        this.rsvTime = newSchedule.getStrtTm();
        this.updId = updatedBy;
    }
}