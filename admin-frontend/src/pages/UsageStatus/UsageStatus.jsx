import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './UsageStatus.css';

function UsageStatus() {
  return (
    <>
      <Helmet>
        <title>FITNEEDS - 이용현황</title>
        <meta name="description" content="FITNEEDS - 이용현황" />
      </Helmet>

      <div className="mypage-container">
        {/* Left Sidebar Navigation */}
        <aside className="mypage-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">마이페이지</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item active">
                <button className="sidebar-menu-button">
                  나의정보
                </button>
                <ul className="sidebar-submenu">
                  <li className="sidebar-submenu-item">
                    <Link to="/mypage/edit-info" className="sidebar-submenu-link">회원 정보 수정</Link>
                  </li>
                  <li className="sidebar-submenu-item active">
                    <Link to="/mypage/usage-status" className="sidebar-submenu-link">이용현황</Link>
                  </li>
                  <li className="sidebar-submenu-item">
                    <Link to="/mypage/review-management" className="sidebar-submenu-link">후기관리</Link>
                  </li>
                  <li className="sidebar-submenu-item">
                    <Link to="/mypage/attendance" className="sidebar-submenu-link">출석현황</Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">예약정보</h3>
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <Link to="/mypage/reservation-list" className="sidebar-menu-link">예약목록</Link>
              </li>
              <li className="sidebar-menu-item">
                <Link to="/mypage/cancel-refund" className="sidebar-menu-link">취소/환불 내역</Link>
              </li>
              <li className="sidebar-menu-item">
                <Link to="/mypage/wishlist" className="sidebar-menu-link">찜리스트</Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="mypage-main">
          <h2 className="page-title">이용현황</h2>

          {/* User Profile Section */}
          <section className="usage-profile-section">
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
          </section>

          {/* Monthly Goal Achievement */}
          <section className="usage-section">
            <h3 className="usage-section-title">이번달 목표 달성율</h3>
            <div className="goal-progress-container">
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: '40%' }}>
                  <div className="goal-progress-character">🏃</div>
                </div>
              </div>
              <div className="goal-progress-text">40%</div>
            </div>
          </section>

          {/* Monthly Exercise Count */}
          <section className="usage-section">
            <h3 className="usage-section-title">이번달 운동 횟수</h3>
            <div className="exercise-count-info">
              <span className="exercise-count-text">8회 / 12회</span>
            </div>
            <div className="exercise-progress-bar">
              <div className="exercise-progress-fill" style={{ width: '66.67%' }}></div>
            </div>
          </section>

          {/* Weekly Exercise Status */}
          <section className="usage-section">
            <h3 className="usage-section-title">주간 운동 현황</h3>
            <div className="weekly-exercise-list">
              <div className="weekly-exercise-item">
                <div className="weekly-exercise-label">1주차</div>
                <div className="weekly-exercise-progress-bar">
                  <div className="weekly-exercise-progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="weekly-exercise-item">
                <div className="weekly-exercise-label">2주차</div>
                <div className="weekly-exercise-progress-bar">
                  <div className="weekly-exercise-progress-fill" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="weekly-exercise-item">
                <div className="weekly-exercise-label">3주차</div>
                <div className="weekly-exercise-progress-bar">
                  <div className="weekly-exercise-progress-fill" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div className="weekly-exercise-item">
                <div className="weekly-exercise-label">4주차</div>
                <div className="weekly-exercise-progress-bar">
                  <div className="weekly-exercise-progress-fill" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default UsageStatus;

