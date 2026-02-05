// file: src/main/java/com/project/app/teachers/entity/TeacherProfile.java
package com.project.app.teachers.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherProfile {

    private String userId;
    private Long brchId;
    private String sttsCd;
    private LocalDate hireDt;
    private LocalDate leaveDt;
    private String leaveRsn;
    private String intro;
    private String profileImgUrl;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private String updUserId;

    public void update(Long brchId, String intro, String profileImgUrl, String updUserId) {
        if (brchId != null) this.brchId = brchId;
        if (intro != null) this.intro = intro;

        if (profileImgUrl != null) {
            String v = profileImgUrl.trim();
            this.profileImgUrl = v.isEmpty() ? null : v;
        }
        if (updUserId != null) this.updUserId = updUserId;
        this.updDt = LocalDateTime.now();
    }

    public void retire(LocalDate leaveDt, String leaveRsn, String updUserId) {
        this.sttsCd = "RESIGNED";
        this.leaveDt = leaveDt;
        this.leaveRsn = (leaveRsn == null) ? "" : leaveRsn;
        this.updUserId = updUserId;
        this.updDt = LocalDateTime.now();
    }
}
