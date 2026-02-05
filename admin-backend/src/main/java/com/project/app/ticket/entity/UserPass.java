package com.project.app.ticket.entity;

import com.project.app.global.entity.BaseTimeEntity;
import com.project.app.sportTypes.entity.SportType;
import com.project.app.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "USER_PASS", uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_user_sport_type",
                columnNames = {"user_id", "sport_id"} // 실제 DB 컬럼명 기준
        )
})
public class UserPass extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_pass_id")
    private Long passId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private SportType sport;

    @Column(name = "pass_status_cd", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PassStatusCd passStatusCode;

    @Column(name = "rmn_cnt", nullable = false)
    private Integer remainingCount;

    @Column(name = "lst_prod_id")
    private Long lastProdId;

    @Column(name = "init_cnt", nullable = false)
    private Integer initCount;


    public void deductCount(int amount) {
        // 1. 상태 검증 로직 - passStatusCd에 따라 다른 처리
        if (this.passStatusCode == null) {
            throw new IllegalStateException("이용권 상태가 설정되지 않았습니다.");
        }

        // 상태별 다른 예외 메시지 제공
        if (!this.passStatusCode.isUsable()) {
            switch (this.passStatusCode) {
                case SUSPENDED:
                    throw new IllegalStateException("이용권이 정지 상태입니다. 관리자에게 문의하세요.");
                case DELETED:
                    throw new IllegalStateException("삭제된 이용권입니다. 사용할 수 없습니다.");
                default:
                    throw new IllegalStateException("현재 이용권 상태에서는 사용할 수 없습니다. (상태: " + this.passStatusCode.getDescription() + ")");
            }
        }

        // 2. 기존 잔여 횟수 체크
        if (this.remainingCount < amount) {
            throw new IllegalArgumentException("잔여 횟수가 부족합니다. (현재: " + this.remainingCount + "회, 필요: " + amount + "회)");
        }

        this.remainingCount -= amount;
    }

    /**
     * 예약 취소 시 횟수 복구
     */
    public void restore(int amount) {
        if (amount <= 0) {
            return;
        }

        // 삭제된 이용권은 복구 불가
        if (this.passStatusCode != null && this.passStatusCode.isDeleted()) {
            throw new IllegalStateException("삭제된 이용권은 복구할 수 없습니다.");
        }

        this.remainingCount += amount;
    }

    public void updateInfo(Integer rmnCnt) {
        if (rmnCnt != null && rmnCnt >= 0) {
            // 삭제된 이용권은 수정 불가 (관리자는 deletePass 사용)
            if (this.passStatusCode != null && this.passStatusCode.isDeleted()) {
                throw new IllegalStateException("삭제된 이용권은 수정할 수 없습니다.");
            }
            this.remainingCount = rmnCnt;
        }
    }

    public void updateStatus(String status) {
        PassStatusCd newStatus = PassStatusCd.valueOf(status);

        // 상태 전환 검증
        if (this.passStatusCode != null) {
            // 삭제된 이용권은 다른 상태로 변경 불가
            if (this.passStatusCode.isDeleted() && !newStatus.isDeleted()) {
                throw new IllegalStateException("삭제된 이용권은 다른 상태로 변경할 수 없습니다.");
            }
        }

        this.passStatusCode = newStatus;
    }

    /**
     * 기존 티켓에 횟수를 추가합니다 (Top-up)
     * initCnt와 remainingCount 모두 증가시킵니다.
     */
    public void topUp(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("추가 횟수는 0보다 커야 합니다.");
        }

        // 상태 검증 - 활성 상태에서만 충전 가능
        if (this.passStatusCode != null && !this.passStatusCode.isModifiable()) {
            throw new IllegalStateException("현재 상태(" + this.passStatusCode.getDescription() + ")에서는 횟수를 추가할 수 없습니다.");
        }

        this.remainingCount += amount;
        this.initCount = (this.initCount != null ? this.initCount : 0) + amount;
    }

    /**
     * 최신 상품 ID를 업데이트합니다.
     */
    public void updateLastProduct(Long prodId) {
        this.lastProdId = prodId;
    }

    public int updateRemainingCount(Integer newCnt) {
        if (newCnt == null || newCnt < 0) {
            throw new IllegalArgumentException("올바르지 않은 횟수입니다.");
        }

        // 상태 검증 - 삭제된 이용권은 수정 불가
        if (this.passStatusCode != null && this.passStatusCode.isDeleted()) {
            throw new IllegalStateException("삭제된 이용권은 수정할 수 없습니다.");
        }

        int diff = newCnt - this.remainingCount; // 변화량 계산
        this.remainingCount = newCnt;
        return diff; // 변화량 반환
    }

    public void restoreDeleted() {
        if (this.passStatusCode == null || !this.passStatusCode.isDeleted()) {
            throw new IllegalStateException("복구 대상이 아닌 이용권입니다.");
        }

        // initCount가 null이면 0으로 세팅
        int restoreCnt = this.initCount != null ? this.initCount : 0;
        this.remainingCount = restoreCnt;
        this.passStatusCode = PassStatusCd.ACTIVE;

    }
}
