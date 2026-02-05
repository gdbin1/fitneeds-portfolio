import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // 거래등록 추가
import { getMyPasses } from '../../api/passApi';
import { listProducts } from '../../api/productApi';
import { purchasePass } from '../../api/purchaseApi';
import SideBar from './SideBar';
import './MyPassPage.css';

function MyPassPage() {
  const userId = useSelector((state) => state.auth.userId);
  const navigate = useNavigate(); // 거래등록 추가
  const [myPasses, setMyPasses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 내 이용권 목록 조회 함수
  const fetchMyPasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyPasses(userId);
      console.log('API Response:', response.data); // 디버깅용 로그
      setMyPasses(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch my passes:', err);
      setError('이용권 목록을 불러올 수 없습니다.');
      // 테스트 데이터 (API 실패 시)
      setMyPasses([
        {
          userPassId: 1,
          sportNm: '[GX] 그룹 수업',
          rmnCnt: 15,
          totalCnt: 30,
          passStatusCd: 'ACTIVE',
          expiryDate: '2025-12-31'
        },
        {
          userPassId: 2,
          sportNm: '[PT] 1:1 개인레슨',
          rmnCnt: 12,
          totalCnt: 30,
          passStatusCd: 'ACTIVE',
          expiryDate: '2025-06-30'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 내 이용권 목록 조회
  useEffect(() => {
    if (userId) {
      fetchMyPasses();
    }
  }, [userId, fetchMyPasses]);

  const handleBuyClick = async () => {
    try {
      setLoading(true);
      const response = await listProducts();
      setProducts(response.data || []);
      setShowBuyModal(true);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('상품 목록을 불러올 수 없습니다.');
      // 테스트 데이터 (API 실패 시) - 백엔드 DTO 형식
      setProducts([
        {
          prodId: 1,
          sportNm: '헬스',
          prodNm: '헬스 PT 10회권',
          prodAmt: 150000,
          prvCnt: 10
        },
        {
          prodId: 2,
          sportNm: 'PT',
          prodNm: 'PT 10회권 (Best)',
          prodAmt: 500000,
          prvCnt: 10,
          isBest: true
        },
        {
          prodId: 3,
          sportNm: '필라테스',
          prodNm: '필라테스(6:1) 30회권',
          prodAmt: 450000,
          prvCnt: 30
        }
      ]);
      setShowBuyModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handlePurchase = async () => {
    if (!userId) {
      alert('로그인이 필요합니다. 다시 로그인 후 시도해주세요.');
      return;
    }
    if (!selectedProduct) {
      alert('상품을 선택해주세요.');
      return;
    }
    if (!paymentMethod) {
      alert('결제 수단을 선택해주세요.');
      return;
    }
    if (!agreeTerms) {
      alert('약관에 동의해주세요.');
      return;
    }

    try {
      setLoading(true);
      // 백엔드 ProductPaymentRequestDto 형식에 맞춰 작성
      const payMethodMap = {
        card: 'CARD',
        kakao: 'CARD',  // 카카오페이도 카드로 처리
        transfer: 'REMITTANCE'
      };

      const purchaseData = {
        userId: userId,
        prodId: selectedProduct.prodId || selectedProduct.id,
        payTypeCd: 'PASS_PURCHASE',  // PASS_PAYMENT가 아니라 PASS_PURCHASE
        payMethod: payMethodMap[paymentMethod] || 'CARD'
      };

      console.log('purchaseData', purchaseData);
      await purchasePass(purchaseData);

      // 구매 성공 시 모달 닫기, 목록 새로고침
      setShowBuyModal(false);
      setSelectedProduct(null);
      setPaymentMethod('card');
      setAgreeTerms(false);

      // 이용권 목록 새로고침
      await fetchMyPasses();

      alert('구매가 완료되었습니다!');
    } catch (err) {
      console.error('Purchase failed:', err);
      console.error('Error response:', err?.response?.data);
      const msg = err?.response?.data?.error || err?.response?.data?.message || '구매 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (remaining, total) => {
    return total > 0 ? (remaining / total) * 100 : 0;
  };

  return (
    <div className="mypass-container">
      {/* 사이드바 */}
      <SideBar activeMenu="my-pass" />

      {/* 메인 콘텐츠 */}
      <main className="mypass-main">
        <div className="mypass-content">
          {/* 내 이용권 현황 섹션 */}
          <div className="mypass-section">
            <h2 className="mypass-title">내 이용권 현황</h2>

            {error && (
              <div className="mypass-error-message">{error}</div>
            )}

            {loading && myPasses.length === 0 ? (
              <div className="mypass-loading">로딩 중...</div>
            ) : myPasses.length > 0 ? (
              <div className="mypass-cards">
                {myPasses.map((pass) => {
                  // 백엔드 응답 형식 또는 테스트 데이터 형식 처리
                  const passId = pass.userPassId || pass.id;
                  const passName = pass.sportName || pass.sportNm || pass.name;
                  const remaining = pass.rmnCnt ?? pass.remainingSessions ?? 0;
                  // total은 initCnt(누적 구매량) 또는 totalCnt/totalSessions, 없으면 remaining으로 표시
                  const total = pass.initCnt ?? pass.totalCnt ?? pass.totalSessions ?? remaining;

                  return (
                    <div key={passId} className="mypass-card">
                      <h3 className="mypass-card-title">{passName}</h3>
                      <div className="mypass-card-usage">
                        <div className="mypass-card-number">
                          잔여 {remaining}회 / 총 {total}회
                        </div>
                      </div>
                      <div className="mypass-progress-bar">
                        <div
                          className="mypass-progress-fill"
                          style={{
                            width: `${calculateProgress(remaining, total)}%`
                          }}
                        />
                      </div>
                      <div className="mypass-card-actions">
                        <button className="mypass-btn mypass-btn-transfer"
                          onClick={() => {
                            // 거래 페이지로 이동 + 해당 이용권 자동 선택값 전달
                            navigate('/pass-trade', { state: { userPassId: passId } });
                          }}
                        >
                          양도하기(거래등록)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mypass-empty">
                <p>현재 이용권이 없습니다.</p>
              </div>
            )}

            {/* 새 이용권 구매 카드 */}
            <div className="mypass-cards">
              <div
                className="mypass-card mypass-card-add"
                onClick={handleBuyClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="mypass-card-add-content">
                  <span className="mypass-card-add-icon">+</span>
                  <span className="mypass-card-add-text">새 이용권 구매하기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 구매 모달 */}
      {showBuyModal && (
        <div className="mypass-modal-overlay" onClick={() => setShowBuyModal(false)}>
          <div className="mypass-modal" onClick={(e) => e.stopPropagation()}>
            {/* 상품 선택 섹션 */}
            <div className="mypass-modal-content">
              <div className="mypass-modal-left">
                <h3>이용권 선택</h3>
                <div className="mypass-product-list">
                  {products.map((product) => {
                    const productId = product.prodId || product.id;
                    const productName = product.prodNm || product.name;
                    const productPrice = typeof product.prodAmt === 'number' ? product.prodAmt : (product.price || 0);
                    const productDesc = product.sportNm ? `${product.sportNm} ${product.prvCnt}회` : product.description;

                    return (
                      <div
                        key={productId}
                        className={`mypass-product-card ${selectedProduct?.prodId === productId || selectedProduct?.id === productId ? 'selected' : ''}`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <h4>{productName}</h4>
                        <p className="mypass-product-price">
                          {productPrice.toLocaleString()}원
                        </p>
                        <p className="mypass-product-desc">{productDesc}</p>
                        {product.isBest && (
                          <span className="mypass-badge-best">BEST</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 결제 정보 섹션 */}
              <div className="mypass-modal-right">
                <h3>주문 정보</h3>

                {selectedProduct ? (
                  <>
                    <div className="mypass-order-info">
                      <div className="mypass-order-row">
                        <span>상품명</span>
                        <strong>{selectedProduct.prodNm || selectedProduct.name}</strong>
                      </div>
                      <div className="mypass-order-row">
                        <span>가격</span>
                        <strong>
                          {typeof selectedProduct.prodAmt === 'number'
                            ? selectedProduct.prodAmt.toLocaleString()
                            : selectedProduct.price.toLocaleString()}원
                        </strong>
                      </div>
                    </div>

                    <h4 className="mypass-payment-title">결제 수단</h4>
                    <div className="mypass-payment-methods">
                      <label className="mypass-payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        신용/체크카드
                      </label>
                      <label className="mypass-payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="kakao"
                          checked={paymentMethod === 'kakao'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        카카오페이
                      </label>
                      <label className="mypass-payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={paymentMethod === 'transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        무통장입금
                      </label>
                    </div>

                    <div className="mypass-total-amount">
                      <span>최종 결제 금액</span>
                      <span className="mypass-amount">
                        {typeof selectedProduct.prodAmt === 'number'
                          ? selectedProduct.prodAmt.toLocaleString()
                          : selectedProduct.price.toLocaleString()}원
                      </span>
                    </div>

                    <div className="mypass-agreement">
                      <label className="mypass-agreement-checkbox">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                        />
                        <span><strong>[필수]</strong> 구매 조건 및 환불 규정 동의</span>
                      </label>
                      <ul className="mypass-agreement-details">
                        <li>7일 이내 미사용 시 전액 환불 가능</li>
                        <li>사용 시작 후 환불 시 위약금 10% 차감</li>
                      </ul>
                    </div>

                    <button
                      className="mypass-btn mypass-btn-purchase"
                      onClick={handlePurchase}
                      disabled={loading}
                    >
                      {loading ? '처리 중...' : '결제하기'}
                    </button>
                  </>
                ) : (
                  <div className="mypass-no-selection">
                    상품을 선택해주세요.
                  </div>
                )}
              </div>
            </div>

            <button
              className="mypass-modal-close"
              onClick={() => setShowBuyModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPassPage;
