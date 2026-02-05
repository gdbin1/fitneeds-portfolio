package com.project.app.program.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Program 도메인 클래스
 * program 테이블과 매핑
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Program {
    private Long progId;
    private String progNm;
    private String sportId;
    private Long brchId;
    private Integer useYn;
    private Integer oneTimeAmt;
    private LocalDateTime regDt;
    private LocalDateTime updDt;

}
