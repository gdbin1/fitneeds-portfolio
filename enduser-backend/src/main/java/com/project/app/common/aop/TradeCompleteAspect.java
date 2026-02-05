package com.project.app.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class TradeCompleteAspect {

    /**
     *거래 완료 유스케이스 진입점
     */
    @Pointcut(
            "execution(* com.project.app.pass_trade.service.PassTradeCompleteService.completeTrade(..))"
    )
    public void tradeComplete() {}

    /**
     * 🎬 거래 완료 AOP
     */
    @Around("tradeComplete()")
    public Object aroundCompleteTrade(ProceedingJoinPoint joinPoint) throws Throwable {

        Object[] args = joinPoint.getArgs();

        Long postId   = (Long) args[0];
        String buyerId = (String) args[1];
        Integer buyCount = (Integer) args[2];

        log.warn(
                "[TRADE-COMPLETE-START] postId={}, buyerId={}, buyCount={}",
                postId, buyerId, buyCount
        );

        try {
            Object result = joinPoint.proceed();

            log.warn(
                    "[TRADE-COMPLETE-SUCCESS] postId={}, buyerId={}, buyCount={}",
                    postId, buyerId, buyCount
            );

            return result;

        } catch (Exception e) {

            log.error(
                    "[TRADE-COMPLETE-FAIL] postId={}, buyerId={}, buyCount={}, message={}",
                    postId, buyerId, buyCount, e.getMessage()
            );

            throw e; // ❗ 트랜잭션/GlobalExceptionHandler로 위임
        }
    }
}
