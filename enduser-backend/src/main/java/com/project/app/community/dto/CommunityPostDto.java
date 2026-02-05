package com.project.app.community.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.util.Date;

@Data
public class CommunityPostDto {

    private Long postId;
    private String postType;
    private String category;
    private String title;
    private String content;

    /** 작성자 ID */
    private String writerId;

    /** 🔥 작성자 이름 (JOIN 결과, DB 컬럼 아님) */
    private String writerName;
    
    private String writerType;
    private Long branchId;
    private Integer views;
    private Date createdAt;
    private Date updatedAt;

    // 모집 관련
    private String sportType;
    private Integer recruitMax;

    /** 🔥 현재 참여자 수 (JOIN 결과, DB 컬럼 아님) */
    private Long recruitCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate recruitEndDate;

    /** 🔥 모집 상태 (Service 계산값) */
    private String recruitStatus;

    private Date displayStart;
    private Date displayEnd;
    private Boolean postVisible;
    private Boolean isVisible;

    /** 로그인 사용자 기준 작성자 여부 */
    private Boolean isWriter;
}
