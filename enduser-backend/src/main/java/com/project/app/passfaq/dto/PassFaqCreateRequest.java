package com.project.app.passfaq.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PassFaqCreateRequest {
    private String category;
    private String question;
}
