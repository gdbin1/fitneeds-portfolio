import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './SideBar.css';

function SideBar({ activeMenu, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMyExerciseOpen, setIsMyExerciseOpen] = useState(true);
  const [isReservationOpen, setIsReservationOpen] = useState(true);

  // 현재 경로에 따라 active 상태 결정
  const isReservationListActive = location.pathname === '/mypage/reservations';
  const isMyPageActive = location.pathname === '/mypage';
  const isMyPassActive = location.pathname === '/mypage/my-pass';

  // /mypage/reservations일 때 예약목록 섹션 열기
  useEffect(() => {
    if (isReservationListActive) {
      setIsReservationOpen(true);
    }
  }, [isReservationListActive]);

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuId) => {
    // /mypage/reservations 또는 /mypage/my-pass(내 이용권)에 있을 때는 onMenuClick 없음.
    // 이용내역·리뷰쓰기·결제내역 클릭 시 /mypage로 이동 후 해당 메뉴 표시
    if (location.pathname === '/mypage/reservations' || location.pathname === '/mypage/my-pass') {
      navigate('/mypage', { state: { menu: menuId } });
    } else if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  return (
    <aside className="mypage-sidebar">
      {/* 나의 운동 섹션 */}
      <div className="sidebar-section">
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item">
            <button 
              className="sidebar-menu-button"
              onClick={() => setIsMyExerciseOpen(!isMyExerciseOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>나의 운동</span>
              <span style={{ fontSize: '0.75rem' }}>{isMyExerciseOpen ? '▲' : '▼'}</span>
            </button>
            {isMyExerciseOpen && (
              <ul className="sidebar-submenu">
                <li 
                  className={`sidebar-submenu-item ${isMyPageActive && !activeMenu ? 'active' : ''}`}
                >
                  <Link 
                    to="/mypage" 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                    onClick={(e) => {
                      // 대시보드로 이동할 때 activeMenu를 null로 설정
                      if (onMenuClick) {
                        onMenuClick(null);
                      }
                      // 이미 /mypage에 있으면 새로고침 방지
                      if (location.pathname === '/mypage') {
                        e.preventDefault();
                      }
                    }}
                  >
                    대시보드
                  </Link>
                </li>
                <li 
                  className={`sidebar-submenu-item ${isMyPassActive ? 'active' : ''}`}
                >
                  <Link 
                    to="/mypage/my-pass" 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                  >
                    내 이용권
                  </Link>
                </li>
                <li 
                  className={`sidebar-submenu-item ${isMyPageActive && activeMenu === 'usage-history' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('usage-history')}
                  style={{ cursor: 'pointer' }}
                >
                  이용내역
                </li>
                <li 
                  className={`sidebar-submenu-item ${isMyPageActive && activeMenu === 'review-write' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('review-write')}
                  style={{ cursor: 'pointer' }}
                >
                  리뷰쓰기
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* 예약목록 섹션 */}
      <div className="sidebar-section">
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item">
            <button 
              className="sidebar-menu-button"
              onClick={() => setIsReservationOpen(!isReservationOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>예약목록</span>
              <span style={{ fontSize: '0.75rem' }}>{isReservationOpen ? '▲' : '▼'}</span>
            </button>
            {isReservationOpen && (
              <ul className="sidebar-submenu">
                <li 
                  className={`sidebar-submenu-item ${isReservationListActive ? 'active' : ''}`}
                >
                  <Link 
                    to="/mypage/reservations" 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                    onClick={(e) => {
                      // 예약목록 페이지에서 클릭 시 새로고침 방지
                      if (location.pathname === '/mypage/reservations') {
                        e.preventDefault();
                      }
                    }}
                  >
                    예약내역
                  </Link>
                </li>
                <li 
                  className={`sidebar-submenu-item ${isMyPageActive && activeMenu === 'payment-history' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('payment-history')}
                  style={{ cursor: 'pointer' }}
                >
                  결제내역
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default SideBar;

