// 🔴 가데이터 로그인 (UI / 권한 판단용)
// 실제 로그인 로직 ❌
// DB / API 연결 전 임시 사용자

export const mockUser = {
  userId: 'user01',
  email: 'user01@test.com',
  password: '1234',   // ⚠️ 사용 안 함 (형태만 맞춤)
  name: '홍길동',
};

export const isLoggedIn = true;


export const mockTradeHistory = [
  {
    txId: 1,
    type: 'BUY',               // BUY | SELL
    title: '헬스 10회권',
    counterParty: 'user02',    // 판매자 or 구매자
    price: 30000,
    quantity: 1,
    status: 'COMPLETED',       // COMPLETED | CANCELED
    tradedAt: '2026-01-18'
  },
  {
    txId: 2,
    type: 'SELL',
    title: '요가 이용권',
    counterParty: 'user03',
    price: 20000,
    quantity: 1,
    status: 'COMPLETED',
    tradedAt: '2026-01-17'
  }
];
