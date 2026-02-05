// file: src/main/java/com/project/app/teachers/dto/TeacherDto.java
package com.project.app.teachers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class TeacherDto {

    public record CreateReq(
            // null/blank면 서버에서 UUID 생성
            String userId,

            @NotBlank @Size(max = 100) String userName,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(max = 255) String password,

            @Size(max = 20) String phoneNumber,

            @NotNull Long brchId,
            @NotNull LocalDate hireDt,

            @Size(max = 255) String intro,
            String profileImgUrl,

            // 수정자(등록자) ID (USERS_ADMIN.user_id). 없으면 null로 저장
            @Size(max = 50) String updUserId,

            List<SportReq> sports,
            List<CertificateReq> certificates,
            List<CareerReq> careers
    ) {}

    public record UpdateReq(
            @Size(max = 100) String userName,
            @Email @Size(max = 255) String email,
            @Size(max = 20) String phoneNumber,

            Long brchId,
            @Size(max = 255) String intro,
            @Size(max = 500) String profileImgUrl,

            // 수정자(업데이터) ID (USERS_ADMIN.user_id)
            @Size(max = 50) String updUserId,

            // null이면 “변경 안 함”, 빈 리스트면 “전체 삭제”
            List<SportReq> sports,
            List<CertificateReq> certificates,
            List<CareerReq> careers
    ) {}

    public record RetireReq(
            @NotNull LocalDate leaveDt,
            @NotBlank @Size(max = 255) String leaveRsn,
            @NotBlank @Size(max = 50) String updaterId
    ) {}

    public record Resp(
            String userId,
            String userName,
            String email,
            String phoneNumber,

            Long brchId,
            String brchNm,

            String role,
            int isActive,       // 1/0

            String sttsCd,      // ACTIVE/RETIRED (TEACHER_PROFILE.stts_cd)
            LocalDate hireDt,
            LocalDate leaveDt,
            String leaveRsn,

            String intro,
            String profileImgUrl,

            List<SportResp> sports,
            List<CertificateResp> certificates,
            List<CareerResp> careers,

            LocalDateTime regDt,
            LocalDateTime updDt,
            String updUserId
    ) {}

    public record ListResp(
            List<Resp> items,
            int page,
            int size,
            long total
    ) {}

    public record SportReq(
            @NotNull Long sportId,
            Boolean mainYn,
            Integer sortNo
    ) {}

    public record SportResp(
            Long sportId,
            String sportNm,
            int mainYn,     // 1/0
            int sortNo
    ) {}

    public record CertificateReq(
            @NotBlank @Size(max = 255) String certNm,
            @Size(max = 255) String issuer,
            LocalDate acqDt,
            @Size(max = 100) String certNo
    ) {}

    public record CertificateResp(
            Long certId,
            String certNm,
            String issuer,
            LocalDate acqDt,
            String certNo
    ) {}

    public record CareerReq(
            @NotBlank @Size(max = 255) String orgNm,
            @Size(max = 255) String roleNm,
            @NotNull LocalDate strtDt,
            LocalDate endDt
    ) {}

    public record CareerResp(
            Long careerId,
            String orgNm,
            String roleNm,
            LocalDate strtDt,
            LocalDate endDt
    ) {}

    public record AssignedScheduleResp(
            Long schdId,
            Long progId,
            String progNm,
            Long brchId,
            String brchNm,
            LocalDate strtDt,
            LocalTime strtTm,
            LocalTime endTm,
            Integer maxNopCnt,
            Integer rsvCnt,
            String sttsCd
    ) {}
}
