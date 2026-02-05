package com.project.app.ticket.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PassStatusCd {

    ACTIVE("활성", true, true),
    SUSPENDED("정지", false, false),
    STOP("정지", false, false),  // 별칭: SUSPENDED와 동일
    DELETED("삭제", false, false),
    // 기타 예비 상태
    OTHER("기타", false, false);

    private final String description;
    private final boolean canUse;        // 사용 가능 여부
    private final boolean canModify;     // 수정 가능 여부

    /**
     * 이용권 사용이 가능한 상태인지 확인
     */
    public boolean isUsable() {
        return this.canUse;
    }

    /**
     * 이용권 수정이 가능한 상태인지 확인
     */
    public boolean isModifiable() {
        return this.canModify;
    }

    /**
     * 활성 상태인지 확인
     */
    public boolean isActive() {
        return this == ACTIVE;
    }

    /**
     * 정지 상태인지 확인
     */
    public boolean isSuspended() {
        return this == SUSPENDED;
    }

    /**
     * 삭제 상태인지 확인
     */
    public boolean isDeleted() {
        return this == DELETED;
    }
}
