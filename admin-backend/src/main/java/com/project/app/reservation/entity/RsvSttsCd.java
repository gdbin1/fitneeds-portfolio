package com.project.app.reservation.entity;

public enum RsvSttsCd {
    CONFIRMED,	// 예약 확정 (결제 완료 후)
    PENDING,	// (결제 대기 시 사용할 수도 있음, 현재는 사용 안 함)
    CANCELED,	// 사용자 또는 관리자 취소
    COMPLETED,	// 스케줄 종료 후 완료 처리
    NO_SHOW,	// 예약 불참
}