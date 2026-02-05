package com.project.app.userpass.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

import com.project.app.admin.entity.UserAdmin;
import com.project.app.reservation.entity.Reservation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "PASS_LOG")
public class PassLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pass_log_id", nullable = false)
    private Long passLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_pass_id", nullable = false)
    private UserPass userPass;

    @Column(name = "chg_type_cd", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private PassLogChgTypeCd chgTypeCd;

    @Column(name = "chg_cnt", nullable = false)
    private Integer chgCnt;

    @Column(name = "chg_rsn", nullable = true, length = 255)
    private String chgRsn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pocs_user_id", nullable = true)
    private UserAdmin userAdmin;

    @Column(name = "reg_dt", nullable = false)
    @CreatedDate
    private LocalDateTime regDt;
}