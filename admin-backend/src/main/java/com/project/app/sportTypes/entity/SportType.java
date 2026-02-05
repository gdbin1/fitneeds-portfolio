package com.project.app.sportTypes.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SPORT_TYPE")
@Getter
@NoArgsConstructor (access = AccessLevel.PROTECTED)
@AllArgsConstructor (access = AccessLevel.PRIVATE)
@Builder
public class SportType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sport_id")
    private Long sportId;

    @Column(name = "sport_nm", nullable=false, length=100)
    private String sportNm;

    @Column(name="sport_memo", length=500)
    private String sportMemo;

    @Column(name="use_yn", nullable=false)
    private Boolean useYn;

    @Column(name="reg_dt", nullable = false)
    private LocalDateTime regDt;

    @Column(name="upd_dt", nullable = false)
    private LocalDateTime updDt;

    @Column(name="del_dt")
    private LocalDateTime delDt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.regDt = now;
        this.updDt = now;
        if(this.useYn == null)
            this.useYn = true;
    }

    @PreUpdate
    void onUpdate() {
        this.updDt = LocalDateTime.now();
    }

    public void update(String name, String memo) {
        this.sportNm = name;
        this.sportMemo = memo;
    }

    public void deactivate() {
        this.useYn = false;
        this.delDt = LocalDateTime.now();
    }
}
