// PassTradePost.jsx
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom'; // 거래등록연결 추가
import api from '../../api';

import PassTradeDetail from './PassTradeDetail';
import BuyModal from './BuyModal';
import './PassTradePost.css';

import fitnessPass from '../../assets/passes/pass-fitness.png';
import swimPass from '../../assets/passes/pass-swim.png';
import yogaPass from '../../assets/passes/pass-yoga.png';
import pilatesPass from '../../assets/passes/pass-pilates.png';
import jujitsuPass from '../../assets/passes/pass-jujitsu.png';

import BookmarkButton from '../../components/BookmarkButton';

const PassTradePost = () => {

  const navigate = useNavigate();
  const location = useLocation(); // 거래등록연결 추가
  const passImageMap = {
    헬스: fitnessPass,
    수영: swimPass,
    요가: yogaPass,
    필라테스: pilatesPass,
    주짓수: jujitsuPass,
  };

  const { isAuthenticated, userId, userName } = useSelector((state) => state.auth);

  const [posts, setPosts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewMode, setViewMode] = useState('all');

  //  외부(MyPassPage)에서 넘어온 “자동 선택할 userPassId”
  const [prefillUserPassId, setPrefillUserPassId] = useState('');

  // 🔹 드롭다운에서 만지는 값 (임시)
  const [tmpSportFilter, setTmpSportFilter] = useState('전체 종목');
  const [tmpPriceFilter, setTmpPriceFilter] = useState('가격');
  const [tmpQtyFilter, setTmpQtyFilter] = useState('수량');

  // 🔹 실제 필터에 쓰는 값 (검색 버튼 눌렀을 때만 변경)
  const [sportFilter, setSportFilter] = useState('전체 종목');
  const [priceFilter, setPriceFilter] = useState('가격');
  const [qtyFilter, setQtyFilter] = useState('수량');



  /* ===============================
     게시글 + 즐겨찾기 병합
  =============================== */
  useEffect(() => {
    reloadPosts();
  }, []);

  //  [추가]
  // ✅ location.state 기반 자동 등록 모달 오픈
  useEffect(() => {
    if (location.state?.userPassId) {
      setPrefillUserPassId(location.state.userPassId);
      setActiveModal('register');
    }
  }, [location]);


  const loadFavorites = () => {
    setSportFilter(tmpSportFilter);
    setPriceFilter(tmpPriceFilter);
    setQtyFilter(tmpQtyFilter);
  };

  /* ===============================
     필터링
  =============================== */
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (viewMode === 'mine') {
      result = result.filter(
        post => String(post.sellerId) === String(userId)
      );
    }

    if (sportFilter !== '전체 종목') {
      result = result.filter(post => post.sportNm === sportFilter);
    }
    // 3️⃣ 수량 필터
    if (qtyFilter !== '수량') {
      const qty = parseInt(qtyFilter.replace(/[^0-9]/g, ''), 10);

      if (!Number.isNaN(qty)) {
        if (qtyFilter.includes('이하')) {
          result = result.filter(post => post.sellCount <= qty);
        }
        if (qtyFilter.includes('이상')) {
          result = result.filter(post => post.sellCount >= qty);
        }
      }
    }

    // 4️⃣ 가격 정렬
    if (priceFilter === '낮은 가격순') {
      result.sort((a, b) => a.saleAmount - b.saleAmount);
    }

    if (priceFilter === '높은 가격순') {
      result.sort((a, b) => b.saleAmount - a.saleAmount);
    }

    return result;
  }, [posts, viewMode, sportFilter, priceFilter, qtyFilter, userId]);

  const openDetail = (post) => {
    setSelectedPost(post);
    setActiveModal('detail');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPost(null);
    setPrefillUserPassId(null); // [추가] 모달 닫을 때 초기화 → 다음에 일반 등록 버튼 눌렀을 때 자동 선택 안 되는 것 보장
    // 🔥 location.state 초기화
    navigate(location.pathname, { replace: true });
  };



  // 거래 완료 처리 (구매 버튼 클릭 시)
  const handleCompleteTrade = async (buyCount) => {
    console.log('🔥 handleCompleteTrade 호출됨', buyCount);

    try {
      await api.post(
        `/pass-trade/${selectedPost.postId}/complete`,
        null,
        {
          params: { buyCount }
        }
      );

      console.log('🔥 axios 이후');

      alert('구매가 완료되었습니다.');
      await reloadPosts(); // 거래 후 게시글 재조회
      closeModal();
    } catch (e) {
      console.error('거래 완료 실패', e);
      alert('구매 처리 중 오류 발생');
    }
  };





  /* ===============================
   게시글 재조회 (구매 후 갱신용)
=============================== */
  const reloadPosts = async () => {
    try {
      const postsRes = await api.get('/pass-trade/posts');
      const favRes = await api.get('/pass-trade-favorite', {
        params: { userId }
      });


      const favoritePostIds = new Set(favRes.data.map(f => f.postId));

      const merged = postsRes.data.map(post => ({
        ...post,
        isFavorite: favoritePostIds.has(post.postId),
      }));

      setPosts(merged);
    } catch (e) {
      console.error('게시글 재조회 실패', e);
    }
  };


  /* ===============================
    🔥 등록 모달 (API 연동 버전)
 =============================== */
  const RegisterModal = () => {
    const [userPasses, setUserPasses] = useState([]);
    const [selectedPassId, setSelectedPassId] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [sellCount, setSellCount] = useState('');
    const [sellReason, setSellReason] = useState(''); // 🔥 판매 사유

    // 등록 입력 검증 에러 메시지
    const [priceError, setPriceError] = useState('');
    const [qtyTooltip, setQtyTooltip] = useState(false);


    useEffect(() => {
      const fetchUserPasses = async () => {
        try {
          const res = await api.get('/pass/passes/api', {
            params: { userId }
          });

          console.log('내 이용권 목록:', res.data); // ✅ 확인용
          setUserPasses(res.data);
        } catch (err) {
          console.error('보유 이용권 조회 실패', err);
        }
      };

      fetchUserPasses();
    }, [userId]);

    // [추가]
    // URL로 전달된 userPassId가 있으면 자동 선택
    useEffect(() => {
      if (prefillUserPassId && userPasses.length > 0) {
        setSelectedPassId(prefillUserPassId);
      }
    }, [prefillUserPassId, userPasses]);


    const selectedPass = userPasses.find(
      (p) => Number(p.userPassId) === Number(selectedPassId)
    );

    const totalPrice =
      unitPrice && sellCount ? Number(unitPrice) * Number(sellCount) : 0;

    const isDisabled =
      !selectedPass ||
      sellCount <= 0 ||
      sellCount > (selectedPass?.rmnCnt ?? 0) ||
      unitPrice <= 0 ||
      !sellReason.trim(); // 🔥 판매사유 필수

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isDisabled) return;

      try {
        await api.post('/pass-trade/posts', {
          userPassId: selectedPassId,
          sellCount: Number(sellCount),
          saleAmount: totalPrice,
          title: selectedPass.sportNm + ' 이용권',
          content: sellReason,
        });
        alert('이용권이 등록되었습니다.');

        // 등록 후 반드시 재조회
        await reloadPosts(); // 목록 최신화
        closeModal();         // 모달 닫기
      } catch (e) {
        console.error(e);
        alert('게시글 등록 실패');
      }
    };


    return (
      <div className="register-modal-content">
        <h2>거래 게시글 등록</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <select
            value={selectedPassId}
            onChange={(e) => setSelectedPassId(e.target.value)}
          >
            <option value="">이용권 선택</option>
            {userPasses.map((p) => (
              <option key={p.userPassId} value={p.userPassId}>
                {p.sportNm} ({p.rmnCnt}회)
              </option>
            ))}
          </select>


          <div className="input-wrapper">
            <input
              type="text"
              placeholder="단가"
              value={unitPrice}
              onChange={(e) => {
                // 🔥 숫자만 남기기 (정수)
                const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                setUnitPrice(onlyNumber);
              }}
              onBlur={() => {
                // 🔥 1 이상 검증
                if (!unitPrice || Number(unitPrice) < 1) {
                  setPriceError(true);
                  setTimeout(() => setPriceError(false), 2000);
                }
              }}
            />

            {priceError && (
              <div className="input-tooltip">
                1 이상의 정수만 입력하세요
              </div>
            )}
          </div>


          <div className="input-wrapper">
            <input
              type="text"
              placeholder="판매 수량"
              value={sellCount}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                setSellCount(onlyNumber);
              }}
              onBlur={() => {
                if (!sellCount || Number(sellCount) < 1) {
                  setQtyTooltip(true);
                  setTimeout(() => setQtyTooltip(false), 2000);
                }
              }}
            />

            {qtyTooltip && (
              <div className="input-tooltip">
                1 이상의 정수만 입력하세요
              </div>
            )}
          </div>





          <input type="number" value={totalPrice} readOnly />

          <textarea
            placeholder="판매 사유를 입력해주세요"
            value={sellReason}
            onChange={(e) => setSellReason(e.target.value)}
            rows={3}
          />

          <button type="submit" disabled={isDisabled}>
            등록
          </button>
          <button type="button" onClick={closeModal}>
            닫기
          </button>
        </form>
      </div>
    );
  };



  return (
    <div className="pass-trade-post">
      <h1>거래 게시글 목록</h1>

      {/* 🔥 상단 툴바 */}
      <div className="trade-toolbar">
        <div className="trade-toolbar-left">
          <button
            className={`filter-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            목록으로
          </button>

          <button
            className={`filter-btn ${viewMode === 'mine' ? 'active' : ''}`}
            onClick={() => setViewMode('mine')}
          >
            내가 등록한 이용권
          </button>


          <select
            className="filter-select"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option>가격</option>
            <option>낮은 가격순</option>
            <option>높은 가격순</option>
          </select>

          <select
            className="filter-select"
            value={qtyFilter}
            onChange={(e) => setQtyFilter(e.target.value)}
          >
            <option>수량</option>
            <option>10개 이하</option>
            <option>20개 이하</option>
            <option>30개 이하</option>
            <option>40개 이하</option>
            <option>50개 이하</option>
            <option>50개 이상</option>
          </select>


          <select
            className="filter-select"
            value={tmpSportFilter}
            onChange={(e) => setTmpSportFilter(e.target.value)} //  검색버튼 눌렀을 때 반영됨
          >
            <option value="전체 종목">전체 종목</option>
            <option value="PT">피트니스</option>
            <option value="수영">수영</option>
            <option value="요가">요가</option>
            <option value="필라테스">필라테스</option>
            <option value="주짓수">주짓수</option>
          </select>

          <button className="search-btn" onClick={loadFavorites}>
            검색
          </button>
        </div>

        <div className="trade-toolbar-right">
          {isAuthenticated && (
            <button
              className="register-btn"
              onClick={() => setActiveModal('register')}
            >
              + 이용권 등록하기
            </button>
          )}
        </div>
      </div>

      <div className="post-list">
        {filteredPosts.map((post) => (
          <div
            key={post.postId}
            className="post-card"
            onClick={() => openDetail(post)}
          >
            <img
              src={passImageMap[post.sportNm] ?? fitnessPass}
              alt="이용권"
              className="pass-image"
            />

            <h3>{post.sportNm} 이용권</h3>
            <p>판매자: {post.sellerName}</p>
            <p>판매 수량: {post.sellCount}</p>
            <p>총 금액: {post.saleAmount}원</p>

            <div
              className="card-actions"
              onClick={(e) => e.stopPropagation()}
            >
              <BookmarkButton
                isFavorite={post.isFavorite}
                onToggle={async () => {
                  if (post.isFavorite) {
                    await api.delete(
                      `/pass-trade-favorite/${post.postId}`,
                      { params: { userId } }
                    );

                  } else {
                    await api.post('/pass-trade-favorite', {
                      userId,
                      postId: post.postId
                    });
                  }

                  setPosts(prev =>
                    prev.map(p =>
                      p.postId === post.postId
                        ? { ...p, isFavorite: !p.isFavorite }
                        : p
                    )
                  );
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 모달 */}
      {activeModal && (
        <div className="modal-backdrop">
          {activeModal === 'detail' && selectedPost && (
            <PassTradeDetail
              post={selectedPost}
              onClose={closeModal}
              onOpenBuy={() => setActiveModal('buy')}
            />
          )}

          {activeModal === 'buy' && selectedPost && (
            <BuyModal
              post={selectedPost}
              onClose={closeModal}
              onBuy={handleCompleteTrade}
            />
          )}






          {activeModal === 'register' && <RegisterModal />}
        </div>
      )}
    </div>
  );
};

export default PassTradePost;
