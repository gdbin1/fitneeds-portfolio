package com.project.app.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.admin.dto.TeacherInfoResponseDto;
import com.project.app.admin.entity.TeacherCertificate;
import com.project.app.admin.entity.TeacherProfile;
import com.project.app.admin.repository.TeacherCertificateRepository;
import com.project.app.admin.repository.TeacherProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherProfileAndCertificateService {
	
	private final TeacherProfileRepository teacherProfileRepository;
	private final TeacherCertificateRepository teacherCertificateRepository;
	
	/**
     * 강사의 프로필 이미지, 소개, 자격증 목록을 통합 조회
     */
    @Transactional(readOnly = true)
    public TeacherInfoResponseDto getTeacherInfo(String userId) {
        // 1. 프로필 조회 (이미지, 인트로 등)
        TeacherProfile profile = teacherProfileRepository.findById(userId).orElse(null);
        
        // 2. 자격증 목록 조회
        List<TeacherCertificate> certificates = teacherCertificateRepository.findByUserAdmin_UserId(userId);

        return TeacherInfoResponseDto.builder()
                .profileImgUrl(profile != null ? profile.getProfileImgUrl() : null)
                .intro(profile != null ? profile.getIntro() : "안녕하세요, 강사입니다.")
                .certificates(certificates.stream()
                        .map(TeacherCertificate::getCertNm)
                        .collect(Collectors.toList()))
                .build();
    }

}
