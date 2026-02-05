// file: src/main/java/com/project/app/myclass/dto/MyClassDto.java
package com.project.app.myclass.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class MyClassDto {

    // 목록/상세에서 공통으로 쓰는 스케줄 요약
    public record ScheduleResp(
            Long schdId,
            Long progId,
            String progNm,
            String teacherId,
            String teacherName,
            Long brchId,
            String brchNm,
            LocalDate strtDt,
            LocalTime strtTm,
            LocalTime endTm,
            Integer maxNopCnt,
            Integer rsvCnt,
            String sttsCd,
            String description
    ) {}

    // 예약자(회원) 목록
    public record ReservationResp(
            Long rsvId,
            String userId,
            String userName,
            String phoneNumber,
            String sttsCd,
            LocalDate rsvDt,
            LocalTime rsvTime,
            String attendanceStatus,
            Integer reviewWritten,
            String cnclRsn,
            String updId,
            Integer atndYn,
            LocalDateTime checkinAt
    ) {}

    // 스케줄 상세 응답
    public record ScheduleDetailResp(
            ScheduleResp schedule,
            List<ReservationResp> reservations
    ) {}

    public record ListResp(
            List<ScheduleResp> items,
            int page,
            int size,
            long total
    ) {}
}
