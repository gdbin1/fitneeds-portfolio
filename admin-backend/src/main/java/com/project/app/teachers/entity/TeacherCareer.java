// file: src/main/java/com/project/app/teachers/entity/TeacherCareer.java
package com.project.app.teachers.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherCareer {

    private Long careerId;
    private String userId;
    private String orgNm;
    private String roleNm;
    private LocalDate strtDt;
    private LocalDate endDt;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private String updUserId;
}
