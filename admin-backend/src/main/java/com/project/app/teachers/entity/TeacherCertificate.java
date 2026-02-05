// file: src/main/java/com/project/app/teachers/entity/TeacherCertificate.java
package com.project.app.teachers.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherCertificate {

    private Long certId;
    private String userId;
    private String certNm;
    private String issuer;
    private LocalDate acqDt;
    private String certNo;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private String updUserId;
}
