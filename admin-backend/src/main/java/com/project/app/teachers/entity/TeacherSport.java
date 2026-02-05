// file: src/main/java/com/project/app/teachers/entity/TeacherSport.java
package com.project.app.teachers.entity;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherSport {

    private String userId;
    private Long sportId;
    private Boolean mainYn;
    private Integer sortNo;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
}
