package com.project.app.schedule.entity;

import com.project.app.branch.entity.Branch;
import com.project.app.global.entity.BaseTimeEntity;
import com.project.app.program.entity.Program;
import com.project.app.userAdmin.entity.UserAdmin;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "SCHEDULE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Schedule extends BaseTimeEntity { // BaseTimeEntity 상속 X (테이블에 upd_dt 없음)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schd_id")
    private Long schdId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prog_id", nullable = false)
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAdmin instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brch_id", nullable = false)
    private Branch branch;

    @Column(name = "strt_dt", nullable = false)
    private LocalDate strtDt;


    @Column(name = "strt_tm", nullable = false)
    private LocalTime strtTm;

    @Column(name = "end_tm", nullable = false)
    private LocalTime endTm;

    @Column(name = "max_nop_cnt", nullable = false)
    private Integer maxNopCnt;

    @Column(name = "rsv_cnt", nullable = false)
    private Integer rsvCnt = 0;

    // DB 컬럼명 `description`(TEXT)과 매핑
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "stts_cd", nullable = false, length = 20)
    private String sttsCd; // 예약가능, 마감 등


    // 비즈니스 로직: 예약 발생 시 카운트 증가
    public void increaseReservationCount() {
        if (this.rsvCnt >= this.maxNopCnt) {
            throw new IllegalStateException("정원 초과입니다.");
        }
        this.rsvCnt++;
    }

    // 비즈니스 로직: 예약 취소 시 카운트 감소
    public void decreaseReservationCount() {
        if (this.rsvCnt > 0) {
            this.rsvCnt--;
        }
    }
}
