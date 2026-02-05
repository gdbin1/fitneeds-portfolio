/**
 * [1] Global: 생성일/수정일 자동 관리 (JPA Auditing)
 * 경로: com.project.app.global.entity.BaseTimeEntity.java
 */
package com.project.app.global.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass // 상속받는 자식 클래스에게 매핑 정보(컬럼)만 제공
@EntityListeners(AuditingEntityListener.class) // main 클래스에 @EnableJpaAuditing 필요
public abstract class BaseTimeEntity {

    @CreatedDate
    @Column(name = "reg_dt", updatable = false)
    private LocalDateTime regDt;

    @LastModifiedDate
    @Column(name = "upd_dt")
    private LocalDateTime updDt;
}
