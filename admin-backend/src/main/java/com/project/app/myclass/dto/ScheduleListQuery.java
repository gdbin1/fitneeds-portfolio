// file: src/main/java/com/project/app/myclass/dto/ScheduleListQuery.java
package com.project.app.myclass.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ScheduleListQuery {
    private Long brchId;        // 지점
    private String teacherId;   // 강사(USER_ID)
    private Long progId;        // 프로그램
    private String sttsCd;      // 상태
    private LocalDate fromDt;   // 시작일 from
    private LocalDate toDt;     // 시작일 to
    private String keyword;
    private Integer page;
    private Integer size;
    private Integer offset;
}
