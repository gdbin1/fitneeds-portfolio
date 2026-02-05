package com.project.app.passfaq.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PassFaqResponse {

    private Long faqId;
    private String userId;
    private String category;
    private String question;
    private String answer;
    private LocalDateTime createdAt;
    private String writerName;
}


