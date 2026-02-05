package com.project.app.userpass.service;

import java.util.List;

import com.project.app.sporttype.entity.SportType;
import com.project.app.user.entity.User;
import com.project.app.user.repository.UserRepository;
import com.project.app.userpass.dto.UserPassResponseDto;
import com.project.app.userpass.entity.PassStatusCd;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.userpass.entity.PassLogChgTypeCd;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.repository.UserPassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPassService {

    private final UserPassRepository userPassRepository;
    private final PassLogService passLogService;
    private final UserRepository userRepository;

    /**
     * 특정 사용자 ID에 해당하는 모든 이용권을 조회합니다. 이 메서드는 예약 관련 정보 조회를 위해 사용됩니다.
     */
    @Transactional(readOnly = true)
    public List<UserPass> getUserPassesByUserIdForR(String userId) {
        return userPassRepository.findByUser_UserId(userId);
    }

    /**
     * 이용권 사용 (예약)
     */
    @Transactional
    public UserPass usePassForR(Long userPassId, String reason) {
        UserPass userPass = userPassRepository.findById(userPassId)
                .orElseThrow(() -> new IllegalArgumentException("이용권을 찾을 수 없습니다."));

        boolean success = userPass.decreaseRmnCnt();

        if (!success) {
            throw new IllegalArgumentException("이미 잔여 횟수가 없어 사용할 수 없습니다.");
        }

        UserPass updatedUserPass = userPassRepository.save(userPass);

        passLogService.createPassLog(
                updatedUserPass,
                PassLogChgTypeCd.USE,
                -1,
                reason != null ? reason : "스케줄 예약",
                null
        );

        return updatedUserPass;
    }

    /**
     * 예약 취소 → 이용권 복원
     */
    @Transactional
    public UserPass cancelReservationAndUpdateUserPassForR(Long userPassId, String reason) {
        UserPass userPass = userPassRepository.findById(userPassId)
                .orElseThrow(() -> new IllegalArgumentException("이용권을 찾을 수 없습니다."));

        boolean success = userPass.increaseRmnCnt();

        if (!success) {
            throw new IllegalArgumentException("잔여 횟수를 더 이상 증가시킬 수 없습니다.");
        }

        UserPass updatedUserPass = userPassRepository.save(userPass);

        passLogService.createPassLog(
                updatedUserPass,
                PassLogChgTypeCd.CANCEL,
                1,
                reason != null ? reason : "예약 취소로 이용권 복원",
                null
        );

        return updatedUserPass;
    }

    @Transactional(readOnly = true)
    public List<UserPassResponseDto> getUserPassResponses(String userId) {
        return userPassRepository.findUserPassesWithUserAndSport(userId)
                .stream()
                .map(UserPassResponseDto::from)
                .toList();
    }

    // ================= pass_trade =================

    /**
     * 판매자 이용권 차감
     */
    @Transactional
    public UserPass usePassForTrade(Long userPassId, int buyCount, String reason) {
        UserPass userPass = userPassRepository.findById(userPassId)
                .orElseThrow(() -> new IllegalArgumentException("이용권을 찾을 수 없습니다."));

        if (buyCount <= 0) {
            throw new IllegalArgumentException("구매 수량은 1 이상이어야 합니다.");
        }

        if (userPass.getRmnCnt() < buyCount) {
            throw new IllegalArgumentException("잔여 횟수가 부족합니다.");
        }

        userPass.setRmnCnt(userPass.getRmnCnt() - buyCount);

        if (userPass.getRmnCnt() == 0) {
            userPass.setPassStatusCd(PassStatusCd.SUSPENDED);
        }

        UserPass updated = userPassRepository.save(userPass);

        passLogService.createPassLog(
                updated,
                PassLogChgTypeCd.USE,
                -buyCount,
                reason,
                null
        );

        return updated;
    }

    /**
     * 🔥 구매자 이용권 증가 or 신규 생성
     * 🔥 신규 생성 시 PassLog 기록 안 함 (락 타임아웃 방지)
     */
    @Transactional
    public UserPass addPassForTrade(
            String buyerId,
            SportType sportType,
            int buyCount,
            String reason
    ) {
        if (buyCount <= 0) {
            throw new IllegalArgumentException("구매 수량은 1 이상이어야 합니다.");
        }

        User buyer = userRepository.findByUserId(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("구매자 정보 없음"));

        UserPass userPass = userPassRepository
                .findByUser_UserIdAndSportType_SportId(buyerId, sportType.getSportId())
                .orElseGet(() -> UserPass.builder()
                        .user(buyer)
                        .sportType(sportType)
                        .passStatusCd(PassStatusCd.ACTIVE)
                        .rmnCnt(0)
                        .initCnt(0)
                        .build()
                );

        // ✅ 신규 생성 여부 판단 (핵심)
        boolean isNewPass = userPass.getUserPassId() == null;

        userPass.setRmnCnt(userPass.getRmnCnt() + buyCount);
        userPass.setInitCnt(userPass.getInitCnt() + buyCount);
        userPass.setPassStatusCd(PassStatusCd.ACTIVE);

        UserPass saved = userPassRepository.save(userPass);

        // ✅ 기존 이용권에 대해서만 로그 기록
        if (!isNewPass) {
            passLogService.createPassLog(
                    saved,
                    PassLogChgTypeCd.USE,
                    buyCount,
                    reason,
                    null
            );
        }

        return saved;
    }
}
