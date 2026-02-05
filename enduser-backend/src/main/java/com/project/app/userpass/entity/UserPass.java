package com.project.app.userpass.entity;

import org.hibernate.annotations.ColumnDefault;

import com.project.app.aspect.BaseTimeEntity;
import com.project.app.sporttype.entity.SportType;
import com.project.app.user.entity.User;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "USER_PASS", uniqueConstraints = { @UniqueConstraint(columnNames = { "user_id", "sport_id" }) })
public class UserPass extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_pass_id", nullable = false)
    private Long userPassId; // 유저 이용권 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 유저 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private SportType sportType; // 종목 ID

    @Column(name = "pass_status_cd", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private PassStatusCd passStatusCd; // 상태 코드

	@Column(name = "rmn_cnt", nullable = false)
    @ColumnDefault("0")
    @Builder.Default
    private Integer rmnCnt = 0; // 잔여 횟수

    @Column(name = "lst_prod_id", nullable = true)
    private Long lstProdId; // 마지막 구매 물품 ID

	@Column(name = "init_cnt", nullable = false)
	private Integer initCnt; // 초기 구매 수량

    /**
     * 이용권 잔여 횟수를 1 감소시키고 상태를 업데이트합니다. 엔티티의 비즈니스 로직을 캡슐화합니다.
     *
     * @return 잔여 횟수 감소 성공 여부 (잔여 횟수가 이미 0인 경우 false)
     */
    public boolean decreaseRmnCnt() {
        if (this.rmnCnt > 0) {
            this.rmnCnt--;
            // rmnCnt 변경에 따라 passStatusCd 자동 반영
            if (this.rmnCnt == 0) {
                this.passStatusCd = PassStatusCd.SUSPENDED;
            }
            return true;
        }
        return false; // 이미 잔여 횟수가 0인 경우
    }

    /**
     * 예약 취소 시 이용권 잔여 횟수를 1 증가시키고 상태를 업데이트합니다.
     *
     * @return 잔여 횟수 증가 성공 여부 (최대 초기 수량을 넘지 않는 범위 내에서 true, 아니라면 false) 만약 잔여 횟수가 초기
     *         구매 수량보다 많아지는 것을 막고 싶을 경우 추가 로직 필요.
     */
    public boolean increaseRmnCnt() {
        if (this.initCnt != null && this.rmnCnt >= this.initCnt) {
            // 초기 구매 수량 이상으로 증가시키지 않음 (최대값 제한)
            return false;
        }

        this.rmnCnt++;
        // 잔여 횟수가 0보다 커지면 상태를 AVAILABLE로 변경 (이전에는 0이었다가 1이 되는 경우)
        if (this.rmnCnt > 0) {
            this.passStatusCd = PassStatusCd.ACTIVE;
        }
        // 이 메서드는 일반적으로 성공으로 간주하고, 위 선택사항 제약이 없으면 항상 true를 반환
        return true;
    }

    /**
     * 현재 이용권이 사용 가능한 상태인지 확인합니다.
     */
    public boolean isAvailable() {
        return this.passStatusCd == PassStatusCd.ACTIVE;
    }


}