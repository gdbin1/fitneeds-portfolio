// 거래 내역 가데이터 (API 연결 전 임시)

export const mockTradeHistory = [
  {
    txId: 1,
    type: 'BUY',              // BUY | SELL
    title: '헬스 10회권',
    counterParty: 'user02',
    price: 30000,
    quantity: 1,
    status: 'COMPLETED',      // COMPLETED | PENDING | CANCELED
    tradedAt: '2026-01-18',
  },
  {
    txId: 2,
    type: 'SELL',
    title: '요가 이용권',
    counterParty: 'user03',
    price: 20000,
    quantity: 1,
    status: 'COMPLETED',
    tradedAt: '2026-01-17',
  },
  {
    txId: 3,
    type: 'BUY',
    title: '필라테스 이용권',
    counterParty: 'user04',
    price: 15000,
    quantity: 1,
    status: 'PENDING',
    tradedAt: '2026-01-16',
  },
];
