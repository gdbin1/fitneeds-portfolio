package com.project.app.branch.entity;

import jakarta.persistence.*; // JPA 관련 어노테이션 임포트
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp; // 생성일시 자동 관리를 위해 추가
import org.hibernate.annotations.UpdateTimestamp;   // 수정일시 자동 관리를 위해 추가

import java.time.LocalDateTime; // 날짜/시간 타입 임포트

@Entity // JPA 엔티티임을 선언
@Table(name = "BRANCH") // 매핑될 테이블 이름 명시
@Getter // 모든 필드에 대한 Getter 자동 생성
@Setter // 모든 필드에 대한 Setter 자동 생성 (필요에 따라 DTO로 변환 시 @Setter 제거 고려)
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA는 기본 생성자가 필요, PROTECTED로 외부 접근 제한
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자 자동 생성
@Builder // 빌더 패턴 자동 생성 (객체 생성 시 유용)
public class Branch {

    @Id // 기본 키로 지정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT 전략 (MySQL/MariaDB)
    @Column(name = "brch_id", nullable = false) // 컬럼 이름 명시, NULL 허용 안함
    private Long brchId;

    @Column(name = "brch_nm", length = 50, nullable = false) // 컬럼 이름, 길이 50, NULL 허용 안함
    private String brchNm;

    @Column(name = "addr", length = 255, nullable = false) // 컬럼 이름, 길이 255, NULL 허용 안함
    private String addr;

    // DDL에 TINYINT(1) DEFAULT 1로 정의되어 있으므로 Java boolean으로 매핑합니다.
    // nullable = false는 DDL의 NOT NULL과 일치합니다.
    // 기본값은 DDL에서 1로 설정되었지만, JPA 엔티티 생성 시 명시적으로 true로 설정하여 일관성을 유지합니다.
    @Column(name = "oper_yn", columnDefinition = "TINYINT(1)", nullable = false)
    private boolean operYn; // DDL의 DEFAULT 1에 따라 기본값 true로 설정.

    // DDL에 DATETIME NOT NULL로 정의되어 있습니다.
    // @CreationTimestamp를 사용하여 엔티티가 처음 저장될 때 자동으로 현재 시간이 기록됩니다.
    @CreationTimestamp
    @Column(name = "reg_dt", nullable = false, updatable = false, columnDefinition = "DATETIME") // updatable = false로 최초 생성 후 변경 방지
    private LocalDateTime regDt;

    // DDL에 DATETIME NOT NULL로 정의되어 있습니다.
    // @UpdateTimestamp를 사용하여 엔티티가 업데이트될 때마다 자동으로 현재 시간이 갱신됩니다.
    @UpdateTimestamp
    @Column(name = "upd_dt", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime updDt;

    // DDL에 VARCHAR(50) NULL로 정의된 phone 컬럼 추가
    @Column(name = "phone", length = 50) // NULL 허용 (nullable = true가 기본값)
    private String phone;

    // 편의를 위한 Builder의 기본값 설정 (DDL의 DEFAULT 1 (true) 반영)
    // @Builder 사용 시 빌드되는 객체의 기본값을 지정할 수 있습니다.
    // 물론 DB의 DEFAULT 제약 조건이 이 값을 덮어쓸 수도 있습니다.
    /*
    public static BranchBuilder builder() {
        return new CustomBranchBuilder();
    }

    private static class CustomBranchBuilder extends BranchBuilder {
        @Override
        public Branch build() {
            // DDL의 DEFAULT 1에 따라 operYn의 기본값을 true로 설정
            if (super.operYn == false && super.brchId == null) { // brchId가 null인 경우 (새 객체)에만 적용
                super.operYn = true;
            }
            return super.build();
        }
    }
    */
}