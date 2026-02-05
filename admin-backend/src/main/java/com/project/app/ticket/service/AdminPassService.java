package com.project.app.ticket.service;

import com.project.app.config.security.SecurityHelper;
import com.project.app.global.dto.BasePagingRequest;
import com.project.app.global.dto.PagedResponse;
import com.project.app.sportTypes.dto.SportSearchResponse;
import com.project.app.sportTypes.entity.SportType;
import com.project.app.sportTypes.repository.SportTypeRepository;
import com.project.app.ticket.dto.*;
import com.project.app.ticket.entity.PassLog;
import com.project.app.ticket.entity.PassLogChgTypeCd;
import com.project.app.ticket.entity.PassStatusCd;
import com.project.app.ticket.entity.UserPass;
import com.project.app.ticket.mapper.PassLogMapper;
import com.project.app.ticket.mapper.UserPassMapper;
import com.project.app.ticket.repository.PassLogRepository;
import com.project.app.ticket.repository.UserPassRepository;
import com.project.app.user.dto.UserSearchResponse;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPassService {

    private final UserPassMapper userPassMapper;
    private final UserPassRepository userPassRepository;
    private final UserRepository userRepository;
    private final SportTypeRepository sportTypeRepository;
    private final PassLogRepository passLogRepository;
    private final PassLogMapper passLogMapper;
    private final SecurityHelper securityHelper;

    public PagedResponse<UserPassResponse> getPassList(UserPassSearchRequest searchDto) {
        // 1. 전체 데이터 개수 조회 (페이징 계산용)
        int total = userPassMapper.countTicketList(searchDto);

        // 2. 현재 페이지 데이터 조회
        List<UserPassResponse> list = userPassMapper.selectTicketList(searchDto);

        // 3. 공통 래퍼에 담아 반환
        return PagedResponse.of(list, total, searchDto.paging());
    }

    /**
     * 특정 회원의 ACTIVE 상태 이용권 목록 조회
     *
     * @param userId 회원 ID
     * @return ACTIVE 상태의 이용권 목록
     */
    public List<UserPassResponse> getUserActivePasses(String userId) {
        // paging 파라미터에 충분히 큰 사이즈(예: 1000)를 명시적으로 전달합니다.
        BasePagingRequest allPasses = new BasePagingRequest(1, 1000, null, "DESC");
        UserPassSearchRequest searchDto = new UserPassSearchRequest(userId, null, null, "ACTIVE", allPasses);

        return userPassMapper.selectTicketList(searchDto);
    }

    public UserPassResponse getPassDetail(Long passId) {
        // 1. 엔티티 조회
        UserPass userPass = findPassById(passId);

        // 2. 이력 조회
        List<PassLogResponse> histories = passLogMapper.selectPassLogByPassId(passId);

        // 3. 팩토리 메서드로 깔끔하게 변환
        return UserPassResponse.of(userPass, histories);
    }

    @Transactional
    public void createPass(UserPassCreateRequest request) {
        // 1. 엔티티 조회 (검증)
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        SportType sportType = sportTypeRepository.findById(request.sportId())
                .orElseThrow(() -> new IllegalArgumentException("스포츠 종목 정보를 찾을 수 없습니다."));

        // 2. 기존 티켓 존재 여부 확인 (Entity 기반 메서드 사용)
        userPassRepository.findByUserAndSport(user, sportType)
                .ifPresentOrElse(
                        existingPass -> {
                            // Case A: 기존 티켓 존재 (Top-up)
                            existingPass.topUp(request.rmnCnt());
                            if (request.prodId() != null) existingPass.updateLastProduct(request.prodId());
                            saveHistory(existingPass, "MANUAL_ADD", request.rmnCnt(), "관리자 수동 추가");
                        },
                        () -> {
                            // Case B: 신규 생성
                            UserPass newPass = UserPass.builder()
                                    .user(user).sport(sportType)
                                    .passStatusCode(request.status() != null ? PassStatusCd.valueOf(request.status()) : PassStatusCd.ACTIVE)
                                    .remainingCount(request.rmnCnt()).initCount(request.rmnCnt())
                                    .lastProdId(request.prodId()).build();
                            userPassRepository.save(newPass);
                            saveHistory(newPass, "MANUAL_REG", request.rmnCnt(), "관리자 수동 등록");
                        }
                );
    }

    @Transactional
    public void updatePass(Long passId, UserPassUpdateRequest request) {
        UserPass userPass = findPassById(passId);
        PassStatusCd currentStatus = userPass.getPassStatusCode();

        // 상태별 수정 가능 여부 체크
        if (currentStatus != null && !currentStatus.isModifiable()) {
            throw new IllegalStateException(
                String.format("현재 상태(%s)에서는 이용권을 수정할 수 없습니다.",
                    currentStatus.getDescription()));
        }

        int chgCnt = userPass.updateRemainingCount(request.getRmnCnt());

        if (chgCnt != 0) {
            String memo = request.getMemo() != null ? request.getMemo() : "관리자 수동 조정";
            saveHistory(userPass, "ADJUST", chgCnt, memo);
            log.info("이용권 횟수 수정: passId={}, 변경량={}, 현재횟수={}",
                passId, chgCnt, request.getRmnCnt());
        }
    }

    @Transactional
    public void updatePassStatus(Long passId, String status) {
        UserPass userPass = findPassById(passId);
        PassStatusCd oldStatus = userPass.getPassStatusCode();
        PassStatusCd newStatus = PassStatusCd.valueOf(status);

        // 상태별 처리 로직
        if (newStatus.isSuspended()) {
            log.info("이용권 정지 처리: passId={}, 사유: 관리자 요청", passId);
        } else if (newStatus.isActive() && oldStatus != null && oldStatus.isSuspended()) {
            log.info("이용권 활성화 처리: passId={}, 정지 해제", passId);
        } else if (newStatus.isDeleted()) {
            throw new IllegalArgumentException("삭제 처리는 DELETE API를 사용해야 합니다.");
        }

        // 상태 변경
        userPass.updateStatus(status);

        // 로그 기록 (변동 수량은 0으로 기록)
        String memo = String.format("관리자에 의한 상태 변경: %s -> %s (%s)",
            oldStatus != null ? oldStatus.getDescription() : "없음",
            newStatus.getDescription(),
            newStatus.name());
        saveHistory(userPass, "STATUS_CHG", 0, memo);

        log.info("이용권 상태 변경 완료: passId={}, {} -> {}", passId,
            oldStatus != null ? oldStatus.name() : "null", status);
    }

    @Transactional
    public void deletePass(Long passId) {
        UserPass userPass = findPassById(passId);
        PassStatusCd currentStatus = userPass.getPassStatusCode();

        // 이미 삭제된 이용권 체크
        if (currentStatus != null && currentStatus.isDeleted()) {
            throw new IllegalStateException("이미 삭제된 이용권입니다.");
        }

        int remaining = userPass.getRemainingCount();

        // 삭제 처리 순서: 횟수 0으로 설정 후 상태를 DELETED로 변경
        // updateInfo는 DELETED 상태에서 예외 발생하므로 상태 변경 전에 호출
        userPass.updateInfo(0);

        // PassStatusCd.DELETED로 직접 설정
        userPass.updateStatus("DELETED");

        saveHistory(userPass, "MANUAL_DEL", -remaining,
                String.format("관리자 삭제 처리(전액 회수) - 이전 상태: %s",
                        currentStatus != null ? currentStatus.getDescription() : "없음"));

        log.info("이용권 삭제 완료: passId={}, 회수 횟수={}", passId, remaining);
    }

    @Transactional
    public void restorePass(Long passId) {
        UserPass userPass = findPassById(passId);

        // 반드시 DELETED 상태인 경우에만 복구 허용
        if (userPass.getPassStatusCode() == null || !userPass.getPassStatusCode().isDeleted()) {
            throw new IllegalStateException("복구 대상이 아닌 이용권입니다.");
        }

        // 복구 수행: 엔티티 내부 메서드 사용
        int restoredCnt = userPass.getInitCount() != null ? userPass.getInitCount() : 0;
        userPass.restoreDeleted();

        // 영속화 (JPA는 변경 감지로 자동 반영되지만 명시적으로 저장)
        userPassRepository.save(userPass);

        // 이력 저장: 복구는 MANUAL_ADD로 기록, 변경량은 +restoredCnt
        saveHistory(userPass, "MANUAL_ADD", restoredCnt, "관리자에 의한 복구");

        log.info("이용권 복구 완료: passId={}, 복구횟수={}", passId, restoredCnt);
    }

    private UserPass findPassById(Long passId) {
        return userPassRepository.findById(passId)
                .orElseThrow(() -> new IllegalArgumentException("이용권 정보를 찾을 수 없습니다."));
    }

    /**
     * 사용자 검색 (이름 또는 ID로 검색)
     */
    public List<UserSearchResponse> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.findByUserNameContainingOrUserIdContaining(keyword, keyword)
                .stream()
                .map(u -> new UserSearchResponse(u.getUserId(), u.getUserName()))
                .toList();
    }



    /**
     * 활성 스포츠 목록 조회
     */
    public List<SportSearchResponse> getActiveSports() {
        return sportTypeRepository.findByUseYnOrderBySportNm(true)
                .stream()
                .map(SportSearchResponse::from) // 훨씬 간결해진 참조 방식
                .toList();
    }

    private void saveHistory(UserPass userPass, String type, int chgCnt, String memo) {
        // 안전하게 enum으로 변환, 실패 시 PassLogChgTypeCd.OTHER로 기록
        PassLogChgTypeCd typeEnum;
        try {
            typeEnum = PassLogChgTypeCd.valueOf(type);
        } catch (Exception e) {
            typeEnum = PassLogChgTypeCd.OTHER;
        }

        PassLog passLog = PassLog.builder()
                .userPass(userPass)
                .chgTypeCd(typeEnum)
                .chgCnt(chgCnt)
                .chgRsn(memo)
                .processedBy(securityHelper.getCurrentAdminOrNull())
                .build();

        passLogRepository.save(passLog);
    }


}
