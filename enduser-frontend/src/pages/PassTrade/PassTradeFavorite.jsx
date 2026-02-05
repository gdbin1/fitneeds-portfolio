// PassTradeFavorite.jsx
// passtrade
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api';
import './PassTradeFavorite.css'; // ✅ 즐겨찾기 전용 CSS 사용 (post랑 분리)

import fitnessPass from '../../assets/passes/pass-fitness.png';
import swimPass from '../../assets/passes/pass-swim.png';
import yogaPass from '../../assets/passes/pass-yoga.png';
import pilatesPass from '../../assets/passes/pass-pilates.png';
import jujitsuPass from '../../assets/passes/pass-jujitsu.png';

import BookmarkButton from '../../components/BookmarkButton';
import PassTradeDetail from './PassTradeDetail';
import BuyModal from './BuyModal';

const PassTradeFavorite = () => {
  const passImageMap = {
    헬스: fitnessPass,
    수영: swimPass,
    요가: yogaPass,
    필라테스: pilatesPass,
    주짓수: jujitsuPass,
  };

  const { isAuthenticated, userId } = useSelector((state) => state.auth);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const [favoritePosts, setFavoritePosts] = useState([]);
  const [viewMode, setViewMode] = useState('all');

  const [sportFilter, setSportFilter] = useState('전체 종목');
  const [priceFilter, setPriceFilter] = useState('가격');
  const [qtyFilter, setQtyFilter] = useState('수량');

  const handleCompleteTrade = async (buyCount) => {
    await api.post(
      `/pass-trade/${selectedPost.postId}/complete`,
      null,
      {
        params: {
          buyerId: userId,
          buyCount,
        },
      }
    );

    alert('구매 완료');
    closeModal();
    loadFavorites();
  };


  /* ===============================
     즐겨찾기 목록 API
  =============================== */
  const loadFavorites = async () => {
    try {
      // 1️⃣ 즐겨찾기 postId 목록
      const favRes = await api.get('/pass-trade-favorite', {
        params: { userId }
      });
      const favoritePostIds = new Set(favRes.data.map((f) => f.postId));

      // 2️⃣ 전체 게시글
      const postsRes = await api.get('/pass-trade/posts');

      // 3️⃣ 즐겨찾기 게시글만 추출
      const favoritePostList = postsRes.data
        .filter((p) => favoritePostIds.has(p.postId))
        .map((p) => ({ ...p, isFavorite: true }));

      setFavoritePosts(favoritePostList);
    } catch (e) {
      console.error('즐겨찾기 로딩 실패', e);
      setFavoritePosts([]);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  /* ===============================
     모달 제어
  =============================== */
  const openDetail = (post) => {
    setSelectedPost(post);
    setActiveModal('detail');
  };

  const openRegister = () => setActiveModal('register');

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPost(null);
  };

  /* ===============================
     필터 (기존 로직 그대로)
  =============================== */
  const filteredPosts = useMemo(() => {
    let list = [...favoritePosts];

    if (viewMode === 'mine') {
      list = list.filter((p) => String(p.sellerId) === String(userId));
    }

    if (sportFilter !== '전체 종목') {
      list = list.filter((p) => p.sportNm === sportFilter);
    }

    if (qtyFilter !== '수량') {
      const n = parseInt(qtyFilter.replace(/[^0-9]/g, ''), 10);
      if (!Number.isNaN(n)) {
        if (qtyFilter.includes('이하')) list = list.filter((p) => p.sellCount <= n);
        if (qtyFilter.includes('이상')) list = list.filter((p) => p.sellCount >= n);
      }
    }

    if (priceFilter === '낮은 가격순') {
      list.sort((a, b) => (a.saleAmount ?? 0) - (b.saleAmount ?? 0));
    }
    if (priceFilter === '높은 가격순') {
      list.sort((a, b) => (b.saleAmount ?? 0) - (a.saleAmount ?? 0));
    }

    return list;
  }, [favoritePosts, viewMode, sportFilter, qtyFilter, priceFilter, userId]);

  /* ===============================
     등록 모달 (API) - 기존 그대로
  =============================== */
  const RegisterModal = () => {
    const [userPasses, setUserPasses] = useState([]);
    const [selectedPassId, setSelectedPassId] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [sellCount, setSellCount] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
      const fetchUserPasses = async () => {
        const res = await api.get('/pass/passes/api');
        setUserPasses(res.data);
      };
      fetchUserPasses();
    }, []);

    const selectedPass = useMemo(
      () => userPasses.find((p) => p.userPassId === Number(selectedPassId)),
      [selectedPassId, userPasses]
    );

    const totalPrice = useMemo(() => {
      if (!unitPrice || !sellCount) return 0;
      return Number(unitPrice) * Number(sellCount);
    }, [unitPrice, sellCount]);

    const isDisabled =
      !selectedPass ||
      Number(sellCount) <= 0 ||
      Number(sellCount) > (selectedPass?.rmnCnt ?? 0) ||
      Number(unitPrice) <= 0;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isDisabled) return;

      try {
        setLoading(true);

        await api.post('/pass-trade/posts', {
          userPassId: selectedPass.userPassId,
          sellCount: Number(sellCount),
          unitPrice: Number(unitPrice),
          content: reason,
        });

        loadFavorites();
      } finally {
        setLoading(false);
        closeModal();
      }
    };

    return (
      <div className="register-modal-content">
        <h2>거래 게시글 등록</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <select
            value={selectedPassId}
            onChange={(e) => setSelectedPassId(e.target.value)}
          >
            <option value="">선택하세요</option>
            {userPasses.map((pass) => (
              <option key={pass.userPassId} value={pass.userPassId}>
                {pass.passName} ({pass.rmnCnt}회)
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="단가"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="판매 수량"
            value={sellCount}
            onChange={(e) => setSellCount(e.target.value)}
          />

          <input type="number" value={totalPrice} readOnly />

          <textarea
            placeholder="판매 사유"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button type="submit" disabled={isDisabled || loading}>
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
    <div className="pass-trade-favorite">
      <h1>즐겨찾기</h1>

      {/* ✅ POST 페이지와 동일한 상단 툴바 UI */}
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
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <option>전체 종목</option>
            <option>헬스</option>
            <option>수영</option>
            <option>요가</option>
            <option>필라테스</option>
            <option>주짓수</option>
          </select>

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

          {/* ✅ 즐겨찾기 페이지의 검색 버튼은 실제로 loadFavorites 재호출 */}
          <button className="search-btn" onClick={loadFavorites}>
            검색
          </button>
        </div>

        <div className="trade-toolbar-right">
          {isAuthenticated && (
            <button className="register-btn" onClick={openRegister}>
              + 이용권 등록하기
            </button>
          )}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <p style={{ color: '#6c757d' }}>즐겨찾기한 거래 게시글이 없습니다.</p>
      ) : (
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

              {/* ⭐ 즐겨찾기 버튼: 항상 보임 */}
              <div
                className="card-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <BookmarkButton
                  isFavorite={true}
                  onToggle={async () => {
                    await api.delete(
                      `/pass-trade-favorite/${post.postId}`,
                      { params: { userId } }
                    );

                    setFavoritePosts((prev) =>
                      prev.filter((p) => p.postId !== post.postId)
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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

export default PassTradeFavorite;
