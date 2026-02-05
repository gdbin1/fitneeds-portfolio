package com.project.app.userpass.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.project.app.admin.entity.UserAdmin;
import com.project.app.admin.repository.UserAdminRepository;
import com.project.app.userpass.entity.PassLog;
import com.project.app.userpass.entity.PassLogChgTypeCd;
import com.project.app.userpass.entity.UserPass;
import com.project.app.userpass.repository.PassLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PassLogService {

	private final PassLogRepository passLogRepository;
	
	/**
     * PassLog를 생성하여 저장합니다. 이 메서드는 독립적인 트랜잭션으로 실행됩니다.
     *
     * @param userPass      로그를 남길 대상 UserPass 엔티티
     * @param chgTypeCd     로그 변경 타입 (USE, BUY, CANCEL 등)
     * @param chgCnt        변경 횟수 (USE 시 -1, CANCEL 시 +1 등)
     * @param chgRsn        변경 사유
     * @param pocsUsrId     로그를 기록한 관리자 ID (선택 사항, null이면 사용자 본인 또는 시스템으로 간주)
     * @return 생성된 PassLog 엔티티
     */
	 @Transactional(propagation = Propagation.REQUIRES_NEW) // 핵심: 독립적인 새 트랜잭션
	 public PassLog createPassLog(UserPass userPass, PassLogChgTypeCd chgTypeCd, Integer chgCnt, String chgRsn, Long pocsUsrId) {
	        UserAdmin userAdmin = null;

	        PassLog passLog = new PassLog();
	        passLog.setUserPass(userPass);
	        passLog.setChgTypeCd(chgTypeCd);
	        passLog.setChgCnt(chgCnt);
	        passLog.setChgRsn(chgRsn);
	        passLog.setUserAdmin(userAdmin); // pocsUsrId가 넘어오지 않으면 userAdmin은 null
	        passLog.setRegDt(LocalDateTime.now());
	        return passLogRepository.save(passLog);
	    }
	 
}
