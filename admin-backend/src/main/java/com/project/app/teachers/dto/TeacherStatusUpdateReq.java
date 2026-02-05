package com.project.app.teachers.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherStatusUpdateReq {

    @NotBlank
    private String sttsCd;
}
