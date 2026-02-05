package com.project.app.reservation.entity;

// 추가)
public enum AttendanceStatus {
    ATTENDED,   // 출석
    ABSENT,     // 결석
    UNCHECKED   // 미체크 (CONFIRMED 상태)
}