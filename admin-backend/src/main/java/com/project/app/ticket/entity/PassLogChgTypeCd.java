package com.project.app.ticket.entity;

public enum PassLogChgTypeCd {
    USE,
    BUY,
    CANCEL,

    // 거래 로그 타입 추가
    TRADE_SELL,
    TRADE_BUY,
    TRADE_CANCEL,
    TRADE_RECALL,
    MANUAL_REG,   // 관리자 수동 등록
    MANUAL_ADD,   // 관리자 수동 추가
    MANUAL_DEL,   // 관리자 수동 삭제
    ADJUST,       // 횟수 조정
    STATUS_CHG,   // 상태 변경

    // 기타/알 수 없는 타입
    OTHER;
}
