package com.project.app.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * AOP (Aspect-Oriented Programming) 로깅 클래스
 * 
 * AOP란?
 * - 여러 곳에서 공통으로 사용되는 기능(로깅, 보안, 트랜잭션 등)을
 * - 한 곳에 모아서 관리하는 프로그래밍 기법
 * - 모든 메소드에 로깅 코드를 일일이 추가하지 않아도 됩니다!
 * 
 * 현재 설정:
 * - com.project.app 패키지 하위의 모든 메소드에 자동 적용
 * - 현재는 모든 로그가 주석 처리되어 비활성화 상태
 * - 필요하면 주석을 해제하여 로그를 활성화하세요
 */
@Slf4j      
@Aspect     // 이 클래스가 AOP 기능을 제공함을 표시
@Component  // Spring Bean으로 등록
public class LoggingAspect {

	/**
	 * 메소드 실행 전 로깅
	 * @Before: 메소드가 실행되기 직전에 동작
	 * 
	 * 사용 예: 메소드 호출 시점 기록, 파라미터 검증 등
	 */
	@Before("execution(* com.project.app..*.*(..))")
	public void logbefore(JoinPoint joinPoint) {
		// 로그가 필요하면 아래 주석을 해제하세요
//		log.info("[Before] 메소드 실행 전: {}", joinPoint.getSignature());
	}

	/**
	 * 메소드 정상 종료 후 로깅
	 * @AfterReturning: 메소드가 성공적으로 종료되었을 때 동작
	 * 
	 * 사용 예: 반환값 로깅, 성공 결과 기록 등
	 */
	@AfterReturning(pointcut = "execution(* com.project.app..*.*(..))", returning = "result")
	public void logAfter(JoinPoint joinPoint, Object result) {
		// 로그가 필요하면 아래 주석을 해제하세요
//		log.info("[AfterReturning] 메소드 실행 성공: {}, 반환값: {}", 
//				joinPoint.getSignature(), result);
	}
	
	/**
	 * 메소드 종료 후 로깅 (성공/실패 무관)
	 * @After: 메소드가 종료되면 무조건 동작 (예외 발생여부와 무관)
	 * 
	 * 차이점:
	 * - @AfterReturning: 성공했을 때만 동작, 반환값 접근 가능
	 * - @After: 성공/실패 무관하게 항상 동작, 반환값 접근 불가
	 * 
	 * 사용 예: 리소스 정리, 종료 시간 기록 등
	 */
	@After("execution(* com.project.app..*.*(..))")
	public void logAfter1(JoinPoint joinPoint) {
		// 로그가 필요하면 아래 주석을 해제하세요
//	    log.info("[After] 메소드 실행 종료: {}", joinPoint.getSignature());
	}

	/**
	 * 메소드 실행 시간 측정 (예시 코드 - 주석 처리됨)
	 * @Around: 메소드 실행 전후를 모두 제어할 수 있음
	 * 
	 * 가장 강력한 AOP 기능:
	 * - 메소드 실행 전후에 커스텀 로직 추가 가능
	 * - 메소드 실행 여부를 제어할 수 있음
	 * - 반환값을 조작할 수 있음
	 * 
	 * 사용 예: 실행 시간 측정, 캐싱, 트랜잭션 처리 등
	 * 
	 * 필요하면 주석을 해제하여 사용하세요:
	 */
	/*
	@Around("execution(* com.project.app..*.*(..))")
	public Object measureTime(ProceedingJoinPoint joinPoint) throws Throwable {
		// 1. 시작 시간 기록
		long startTime = System.currentTimeMillis();

        Object result = null;
        try {
            // 2. 실제 메소드 실행
            result = joinPoint.proceed(); 
        } finally {
            // 3. 종료 시간 기록 및 실행 시간 계산
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;

            // 4. 로그 출력
            log.info("[Performance] {}.{}() 실행 시간: {}ms", 
                     joinPoint.getSignature().getDeclaringTypeName(),
                     joinPoint.getSignature().getName(),
                     executionTime);
        }
        return result;
	}
	*/
	
	/**
	 * 메소드 실행 중 예외 발생 시 로깅
	 * @AfterThrowing: 메소드에서 예외가 발생했을 때 동작
	 * 
	 * 사용 예: 에러 로깅, 예외 모니터링, 알림 발송 등
	 */
	@AfterThrowing(pointcut = "execution(* com.project.app..*.*(..))", throwing = "excep")
	public void logError(JoinPoint joinPoint, Exception excep) {
		// 로그가 필요하면 아래 주석을 해제하세요
		log.error("[Error] 메소드 실행 중 예외 발생: {}, 에러: {}", 
				joinPoint.getSignature(), excep.getMessage());
	}
}