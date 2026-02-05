package com.project.app.userpass.dto;

import java.time.LocalDateTime;

import com.project.app.userpass.entity.UserPass;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserPassResponseDto {

    private Long userPassId;
    private String passStatusCd;
    private Integer rmnCnt;
    private Long lstProdId;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private Long initCnt;

    private String userId;
    private String userName;
    private String email;
    private String phoneNumber;
    // cashPoint, gradePoint 필드는 User 엔티티에서 주석 처리됨
    // private Integer cashPoint;
    // private Integer gradePoint;

    private Long sportId;
    private String sportNm;
    private String sportMemo;

    public static UserPassResponseDto from(UserPass userPass) {
        return UserPassResponseDto.builder()
                .userPassId(userPass.getUserPassId())
                .passStatusCd(userPass.getPassStatusCd().name())
                .rmnCnt(userPass.getRmnCnt())
                .lstProdId(userPass.getLstProdId())
                .initCnt(userPass.getInitCnt() != null ? userPass.getInitCnt().longValue() : 0L)
                .regDt(userPass.getRegDt())
                .updDt(userPass.getUpdDt())
                .userId(userPass.getUser().getUserId())
                .userName(userPass.getUser().getUserName())
                .email(userPass.getUser().getEmail())
                .phoneNumber(userPass.getUser().getPhoneNumber())
                // .cashPoint(userPass.getUser().getCashPoint()) // 주석 처리됨
                // .gradePoint(userPass.getUser().getGradePoint()) // 주석 처리됨
                .sportId(userPass.getSportType().getSportId())
                .sportNm(userPass.getSportType().getSportNm())
                .sportMemo(userPass.getSportType().getSportMemo())
                .build();
    }
}
