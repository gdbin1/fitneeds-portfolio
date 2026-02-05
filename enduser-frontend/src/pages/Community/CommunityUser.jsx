import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';          // 🔥 axios → api
import CommunitySidebar from './CommunitySidebar';
import './Community.css';

function CommunityUser() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 페이징 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // UI 상태
  const [category, setCategory] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const fetchPosts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/user/community', {   // 🔥 변경
        params: { page: pageNumber },
      });

      setPosts(res.data.list);
      setFilteredPosts(res.data.list);
      setTotalPages(res.data.totalPages);
      setPage(res.data.currentPage);
    } catch (e) {
      alert('커뮤니티 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  // 🔥 실시간 검색 / 필터 반영
  useEffect(() => {
    let result = [...posts];

    if (category !== '전체') {
      result = result.filter(post => post.category === category);
    }

    if (keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        post =>
          post.title?.toLowerCase().includes(lowerKeyword) ||
          post.content?.toLowerCase().includes(lowerKeyword)
      );
    }

    setFilteredPosts(result);
  }, [category, keyword, posts]);

  /* =========================
     검색 / 필터 적용
  ========================= */
  const handleSearch = () => {
    setPage(1);
    //   let result = [...posts];

    //   if (category !== '전체') {
    //     result = result.filter((post) => post.category === category);
    //   }

    //   if (keyword.trim()) {
    //     const lowerKeyword = keyword.toLowerCase();
    //     result = result.filter(
    //       (post) =>
    //         post.title?.toLowerCase().includes(lowerKeyword) ||
    //         post.content?.toLowerCase().includes(lowerKeyword)
    //     );
    //   }

    //   setFilteredPosts(result);
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case '모집':
        return 'category-badge category-recruit';
      case '정보공유':
        return 'category-badge category-info';
      case '후기':
        return 'category-badge category-review';
      case '자유':
        return 'category-badge category-free';
      default:
        return 'category-badge';
    }
  };

  const getRecruitStatusBadge = (post) => {
    if (post.category !== '모집') return null;
    if (!post.recruitStatus) return null;

    const isClosed = post.recruitStatus === '모집종료';

    return (
      <span
        className={`recruit-status-badge ${isClosed ? 'recruit-closed' : 'recruit-open'
          }`}
      >
        {post.recruitStatus}
      </span>
    );
  };

  if (loading) {
    return <div className="community-container">로딩 중...</div>;
  }

  return (
    <div className="community-layout">
      <CommunitySidebar />
      <div className="community-container">
        <h2 className="community-title">FITNEEDS 커뮤니티</h2>
        <p className="community-subtitle">
          정보 공유 / 팀원 모집 커뮤니티
        </p>

        <div className="community-top-buttons">
          <button onClick={() => fetchPosts(1)}>전체 목록</button>

          <button onClick={() => navigate('/community/my-posts')}>
            내가 쓴 글
          </button>

          <button onClick={() => navigate('/community/my-recruits')}>
            내가 참여한 모집
          </button>
        </div>

        <div className="community-filter">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="전체">전체</option>
            <option value="모집">모집</option>
            <option value="정보공유">정보공유</option>
            <option value="후기">후기</option>
            <option value="자유">자유</option>
          </select>

          <input
            type="text"
            placeholder="제목, 내용 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <button onClick={handleSearch}>검색</button>
        </div>

        <table className="community-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.postId}>
                <td>{post.postId}</td>
                <td>
                  <span className={getCategoryClass(post.category)}>
                    {post.category || '-'}
                  </span>
                </td>
                <td
                  className="community-title-link"
                  onClick={() => navigate(`/community/${post.postId}`)}
                >
                  {post.title}
                  {getRecruitStatusBadge(post)}
                </td>
                <td>{post.writerName || post.writerId || '-'}</td>
                <td>{post.createdAt?.substring(0, 10)}</td>
                <td>{post.views}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="community-bottom">
          <div className="community-count">
            총 {filteredPosts.length}건
          </div>

          <div className="community-pagination">
            <button
              disabled={page === 1}
              onClick={() => fetchPosts(page - 1)}
            >
              {'<'}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  className={p === page ? 'active' : ''}
                  onClick={() => fetchPosts(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={page === totalPages}
              onClick={() => fetchPosts(page + 1)}
            >
              {'>'}
            </button>
          </div>

          <button
            className="community-write-btn"
            onClick={() => navigate('/community/write')}
          >
            글쓰기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityUser;
