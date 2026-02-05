package com.project.app.branch.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "BRANCH_INFO")
public class BranchInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "br_info_id", nullable = false)
    private Long brInfoId;			// 지점 정보 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brch_id", nullable = false)
    private Branch branch;			// 지점 ID

    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;		// 오픈시간

    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;	// 마감 시간

    @Column(name = "break_start_time", nullable = true)
    private LocalTime breakStartTime;	// 휴게 시작 시간

    @Column(name = "break_end_time", nullable = true)
    private LocalTime breakEndTime;		// 휴게 종료 시간

    @Column(name = "holiday_info", nullable = true, columnDefinition = "TEXT")
    private String holidayInfo;			// 휴일 정보

    @Column(name = "policy_info", nullable = true, columnDefinition = "TEXT")
    private String policyInfo;			// 정책 정보

    @Column(name = "creat_at", nullable = false)
    private LocalDateTime creatAt;		// 생성 일시

    @Column(name = "upd_at", nullable = false)
    private LocalDateTime updAt;		// 수정 일시
}