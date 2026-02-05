/*
 * pass_trade_transaction 패키지 역할 정의
 * 
 * 용도: 내부 조회(Read Model) 전용
 * - 외부 API 노출 금지
 * - Controller 생성 금지
 * - Service와 Repository는 내부 조회용으로만 사용
 * - pass_trade에서 거래 완료 후 생성된 데이터 조회
 * 
 * 사용 예시:
 * - 관리자 화면에서 거래 내역 조회
 * - 내부 통계 및 분석용 데이터 조회
 * - 다른 서비스에서 거래 이력 참조
 * 
 * 금지 사항:
 * - @RestController 생성 금지
 * - /api/pass-trade-transaction 엔드포인트 금지
 * - X-User-Id 헤더 사용 금지
 * - 외부 클라이언트 직접 접근 금지
 */