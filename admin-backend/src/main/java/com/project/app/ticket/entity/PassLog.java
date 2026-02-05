package com.project.app.ticket.entity;

import com.project.app.userAdmin.entity.UserAdmin;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "PASS_LOG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PassLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pass_log_id")
    private Long passLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_pass_id", nullable = false)
    private UserPass userPass;

    @Column(name = "chg_type_cd", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private PassLogChgTypeCd chgTypeCd;

    @Column(name = "chg_cnt", nullable = false)
    private Integer chgCnt;

    @Column(name = "chg_rsn")
    private String chgRsn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pocs_user_id")
    private UserAdmin processedBy;

    @CreatedDate
    @Column(name = "reg_dt", nullable = false, updatable = false)
    private LocalDateTime regDt;
}
