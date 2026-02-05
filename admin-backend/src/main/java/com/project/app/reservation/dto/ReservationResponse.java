package com.project.app.reservation.dto;

import com.project.app.reservation.entity.Reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationResponse(
        Long rsvId,
        String memberName,
        String sportName,
        String branchName,
        Long schdId,
        LocalDate rsvDt,
        LocalTime rsvTime,
        String sttsCd,
        String cnclRsn,
        String updId,
        LocalDateTime regDt,
        LocalDateTime updDt
) {
    public static ReservationResponse from(Reservation r) {
        if (r == null) return new ReservationResponse(null, null, null, null, null, null, null, null, null, null, null, null);

        String memberName = null;
        String sportName = null;
        String branchName = null;
        Long schdId = null;

        if (r.getUser() != null) {
            try { memberName = r.getUser().getUserName(); } catch (Throwable ignored) {}
        }
        if (r.getSchedule() != null) {
            try {
                schdId = r.getSchedule().getSchdId();
            } catch (Throwable ignored) {}
            try {
                if (r.getSchedule().getProgram() != null && r.getSchedule().getProgram().getSportType() != null) {
                    sportName = r.getSchedule().getProgram().getSportType().getSportNm();
                }
            } catch (Throwable ignored) {}
        }
        if (r.getBranch() != null) {
            try { branchName = r.getBranch().getBrchNm(); } catch (Throwable ignored) {}
        }

        return new ReservationResponse(
                r.getRsvId(),
                memberName,
                sportName,
                branchName,
                schdId,
                r.getRsvDt(),
                r.getRsvTime(),
                r.getSttsCd(),
                r.getCnclRsn(),
                r.getUpdId(),
                r.getRegDt(),
                r.getUpdDt()
        );
    }
}
