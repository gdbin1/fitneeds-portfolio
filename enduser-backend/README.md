# 이용권 거래 시스템 (Pass Trade System)

Spring Boot + JPA(Hibernate) 기반의 이용권 거래 기능 구현

## 🚀 구현된 기능

### API 엔드포인트

1. **판매글 등록**
   - `POST /api/pass-trades/posts`
   - 판매자가 보유 이용권을 판매하기 위한 게시글 등록

2. **판매글 목록 조회**
   - `GET /api/pass-trades/posts`
   - 활성 상태인 판매글 목록 조회

3. **거래 요청 (구매 시도)**
   - `POST /api/pass-trades/{postId}/request`
   - 구매자가 특정 판매글에 대해 거래 요청

4. **거래 완료 처리**
   - `POST /api/pass-trades/{postId}/complete`
   - 결제 성공 가정 하에 거래 완료 처리

### 핵심 도메인

- **PASS_TRADE_POST**: 판매자의 이용권 판매 게시글
- **PASS_TRADE_TRANSACTION**: 구매 시도 및 거래 결과 기록
- **PAYMENT**: 결제 내역 (PG 연동 제외, 성공 가정)
- **USER_PASS**: 판매자/구매자의 보유 이용권
- **PASS_LOG**: 이용권 증감 이력 로그

### 비즈니스 트랜잭션 흐름

```
1) 판매글 상태 확인 및 잠금 (동시 구매 방지)
2) 판매자의 보유 이용권 수량 검증
3) 결제 처리 (성공 가정)
4) 거래 기록 생성
5) 판매자 이용권 차감
6) 구매자 이용권 생성
7) 양쪽에 대해 PASS_LOG 기록
```

모든 과정은 `@Transactional` 범위 안에서 처리됩니다.

## 🏗️ 패키지 구조

### pass 패키지 (이용권 기본 기능)
- 이용권 생성/사용/상태 관리
- UserPass, PassLog, Payment 엔티티
- UserPassService, PassLogService

### pass_trade 패키지 (거래 기능)
- 거래 게시글, 거래 트랜잭션 관리
- PassTradePost, PassTradeTransaction 엔티티
- PassTradeService (pass 패키지 의존)
- API 엔드포인트: /api/pass-trades

**의존성 방향**: pass_trade → pass (단방향)

## 🔒 동시성 제어

- **비관적 락(Pessimistic Lock)** 사용
- `PassTradePostRepository.findByIdWithLock()` 메서드에서 `@Lock(LockModeType.PESSIMISTIC_WRITE)` 적용
- 동시 구매 시도 방지

## 📝 확장 포인트 (TODO)

코드 내 TODO 주석으로 표시된 확장 가능 영역:

1. **결제 실패 처리**
   - 실제 PG 연동 시 결제 실패에 대한 롤백 로직

2. **동시성 락 전략 개선**
   - 낙관적 락(@Version) 도입 고려

3. **거래 취소 / 환불**
   - 거래 취소 API 및 환불 처리 로직

4. **부분 거래 확장**
   - 판매 수량의 일부만 거래하는 기능

## 🧪 테스트

서버 실행 시 `PassTradeSmokeTestRunner`가 자동으로 실행되어 기본적인 거래 흐름을 테스트합니다.

## 📁 프로젝트 구조

```
com.project.app/
├── pass/                           # 이용권 기본 기능
│   ├── domain/
│   │   ├── UserPass.java
│   │   ├── PassLog.java
│   │   ├── Payment.java
│   │   └── PassActionType.java
│   ├── service/
│   │   ├── UserPassService.java
│   │   └── PassLogService.java
│   └── repository/
│       ├── UserPassRepository.java
│       └── PassLogRepository.java
└── pass_trade/                     # 거래 기능
    ├── controller/
    │   └── PassTradeController.java
    ├── domain/
    │   ├── PassTradePost.java
    │   ├── PassTradeTransaction.java
    │   ├── TradeStatus.java
    │   └── TransactionStatus.java
    ├── dto/
    │   ├── request/
    │   └── response/
    ├── repository/
    │   ├── PassTradePostRepository.java
    │   └── PassTradeTransactionRepository.java
    ├── service/
    │   └── PassTradeService.java
    └── runner/
        └── PassTradeSmokeTestRunner.java
```

## ⚠️ 주의사항

- 현재 구현은 **학습/테스트 목적**의 최소 기능입니다
- 실제 PG 연동은 구현되지 않았습니다 (결제 성공 가정)
- 사용자 인증은 임시로 헤더(`X-User-Id`)를 통해 처리합니다
- 예외 처리는 기본 수준으로만 구현되어 있습니다