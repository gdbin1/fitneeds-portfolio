package com.project.app.userpass.service;

import com.project.app.userpass.dto.MyPassSummaryDto;
import com.project.app.userpass.dto.PassDetailDto;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.repository.UserPassRepository;
import com.project.app.userpass.repository.PassLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPassService {

    private final UserPassRepository userPassRepository;
    private final PassLogRepository passLogRepository;

    @Transactional(readOnly = true)
    public List<MyPassSummaryDto> getCurrentPasses(String userId) {
        List<UserPass> passes = userPassRepository.findUserPassesWithUserAndSport(userId);
        return passes.stream()
                .filter(p -> p.getRmnCnt() != null && p.getRmnCnt() > 0)
                .map(MyPassSummaryDto::of)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PassDetailDto getPassDetail(Long userPassId) {
        UserPass p = userPassRepository.findById(userPassId)
                .orElseThrow(() -> new IllegalArgumentException("이용권을 찾을 수 없습니다."));

        List<com.project.app.userpass.entity.PassLog> logs = passLogRepository.findByUserPass_UserPassIdOrderByRegDtDesc(userPassId);
        // limit to top 5
        if (logs.size() > 5) logs = logs.subList(0, 5);
        return PassDetailDto.of(p, logs);
    }

}

