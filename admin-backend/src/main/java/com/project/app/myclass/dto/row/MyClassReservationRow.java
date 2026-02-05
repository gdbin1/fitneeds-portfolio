// file: src/main/java/com/project/app/myclass/dto/row/MyClassReservationRow.java
package com.project.app.myclass.dto.row;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class MyClassReservationRow {
    private Long rsvId;
    private String userId;
    private String userName;
    private String phoneNumber;
    private String sttsCd;
    private LocalDate rsvDt;
    private LocalTime rsvTime;
    private String attendanceStatus;
    private Integer reviewWritten;
    private String cnclRsn;
    private String updId;

    private Integer atndYn;        // CLASS_ATTENDANCE.ATND_YN
    private LocalDateTime checkinAt;
}
