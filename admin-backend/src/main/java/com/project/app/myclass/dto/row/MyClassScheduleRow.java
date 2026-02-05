// file: src/main/java/com/project/app/myclass/dto/row/MyClassScheduleRow.java
package com.project.app.myclass.dto.row;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class MyClassScheduleRow {
    private Long schdId;
    private Long progId;
    private String progNm;
    private String teacherId;
    private String teacherName;
    private Long brchId;
    private String brchNm;
    private LocalDate strtDt;
    private LocalTime strtTm;
    private LocalTime endTm;
    private Integer maxNopCnt;
    private Integer rsvCnt;
    private String sttsCd;
    private String description;
}
