import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
  const [activeMenu, setActiveMenu] = useState('my-info');
  const [activeSubMenu, setActiveSubMenu] = useState('edit-info');

  return (
    <>
      <Helmet>
        <title>FITNEEDS - 마이페이지</title>
        <meta name="description" content="FITNEEDS - 마이페이지" />
      </Helmet>

      <div className="mypage-container">
        {/* Left Sidebar Navigation */}
        <aside className="mypage-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">마이페이지</h3>
            <ul className="sidebar-menu">
              <li className={`sidebar-menu-item ${activeMenu === 'my-info' ? 'active' : ''}`}>
                <button 
                  className="sidebar-menu-button"
                  onClick={() => setActiveMenu('my-info')}
                >
                  나의정보
                </button>
                {activeMenu === 'my-info' && (
                  <ul className="sidebar-submenu">
                    <li 
                      className={`sidebar-submenu-item ${activeSubMenu === 'edit-info' ? 'active' : ''}`}
                      onClick={() => setActiveSubMenu('edit-info')}
                    >
                      회원 정보 수정
                    </li>
                    <li 
                      className={`sidebar-submenu-item ${activeSubMenu === 'usage-status' ? 'active' : ''}`}
                    >
                      <Link to="/mypage/usage-status" className="sidebar-submenu-link">이용현황</Link>
                    </li>
                    <li 
                      className={`sidebar-submenu-item ${activeSubMenu === 'review-management' ? 'active' : ''}`}
                      onClick={() => setActiveSubMenu('review-management')}
                    >
                      후기관리
                    </li>
                    <li 
                      className={`sidebar-submenu-item ${activeSubMenu === 'attendance' ? 'active' : ''}`}
                      onClick={() => setActiveSubMenu('attendance')}
                    >
                      출석현황
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">예약정보</h3>
            <ul className="sidebar-menu">
              <li 
                className={`sidebar-menu-item ${activeMenu === 'reservation-list' ? 'active' : ''}`}
                onClick={() => setActiveMenu('reservation-list')}
              >
                예약목록
              </li>
              <li 
                className={`sidebar-menu-item ${activeMenu === 'cancel-refund' ? 'active' : ''}`}
                onClick={() => setActiveMenu('cancel-refund')}
              >
                취소/환불 내역
              </li>
              <li 
                className={`sidebar-menu-item ${activeMenu === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveMenu('wishlist')}
              >
                찜리스트
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="mypage-main">
          {/* User Profile Section */}
          <section className="mypage-profile-section">
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <span className="avatar-character">👤</span>
                </div>
              </div>
              <div className="profile-info">
                <div className="profile-name">짱구 님 Lv1</div>
                <div className="profile-email">rrr@naver.com</div>
              </div>
              <div className="profile-body-info">
                <Link to="#" className="body-info-link">
                  나의 체형 정보 <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>

            <div className="profile-quick-links">
              <Link to="#" className="quick-link-item">
                <div className="quick-link-icon">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div className="quick-link-label">이용내역</div>
              </Link>
              <Link to="#" className="quick-link-item">
                <div className="quick-link-icon">
                  <i className="bi bi-pencil-square"></i>
                </div>
                <div className="quick-link-label">리뷰</div>
              </Link>
              <Link to="#" className="quick-link-item">
                <div className="quick-link-icon">
                  <i className="bi bi-question-circle"></i>
                </div>
                <div className="quick-link-label">문의</div>
              </Link>
              <Link to="#" className="quick-link-item">
                <div className="quick-link-icon">
                  <i className="bi bi-star-fill"></i>
                </div>
                <div className="quick-link-label">포인트</div>
              </Link>
            </div>
          </section>

          {/* Reservation List Section */}
          <section className="mypage-reservation-section">
            <h2 className="reservation-title">예약목록</h2>
            <div className="reservation-summary">
              예약현황 내역 총 1건
            </div>

            <div className="reservation-table-container">
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th>날짜/기관번호</th>
                    <th>상품명/옵션</th>
                    <th>상품금액</th>
                    <th>예약상태</th>
                    <th>확인/리뷰</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>100,000</td>
                    <td>입금대기</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default MyPage;

