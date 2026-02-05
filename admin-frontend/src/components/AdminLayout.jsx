import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '../styles/AdminNavigation.css'; // ✅ 전용 CSS 임포트
import LoginButtonAndModal from './auth/LoginButtonAndModal';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ 2depth 메뉴 구조
  const menus = [
    {
      name: '회원 관리',
      children: [
        { name: '회원 관리', path: '/users' },
        { name: '관리자 관리', path: '/usersAdmin' },
        { name: '강사 관리', path: '/teachers' },
      ]
    },
    { name: '운동 종목 관리', path: '/sports' },
    {
      name: '센터(지점) 관리',
      children: [
        { name: '센터 관리', path: '/branches' },
        { name: '센터 스케줄 관리', path: '/schedules' },
      ]
    },
    { name: '예약 관리', path: '/reservations' },
    // { name: '출결 관리', path: '/attendance' },
    {
      name: '이용권 거래 관리',
      children: [
        { name: '이용권 거래 관리', path: '/trades' },
        { name: '이용권 거래 통계', path: '/marketstats' },
        { name: '이용권 거래 게시판 관리', path: '/markets' },
      ]
    },
    {
      name: '이용권 관리',
      children: [
        { name: '이용권 관리', path: '/tickets' },
        { name: '이용권 이용 통계', path: '/ticketstats' },
        { name: '이용권 상품 관리', path: '/products' },
      ]
    },
    // { name: '지점 관리', path: '/branches' },
    { name: '결제 관리', path: '/payment' },
    { name: '내 수업 관리', path: '/myclass' },
    // { name: '스케줄 관리', path: '/schedules' },
    {
      name: '커뮤니티',
      children: [
        { name: '커뮤니티 관리', path: '/community' },
        { name: 'FAQ 관리', path: '/AdminFaqPage' },
        { name: '공지사항 관리', path: '/notice' },
      ]
    },
  ];

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActiveMenu = (menu) => {
    if (menu.path) {
      return location.pathname === menu.path;
    }
    if (menu.children) {
      return menu.children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <h3
            style={{ textAlign: 'center', cursor:'pointer' }}
            onClick={() => handleMenuClick('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleMenuClick('/');
                }
            }}
        >관리자 시스템</h3>

        {/* 로그인/로그아웃 버튼 */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <LoginButtonAndModal />
        </div>

        <ul className={mobileMenuOpen ? 'mobile-open' : ''}>
          {menus.map((menu) => (
            <li key={menu.name}>
              {menu.children ? (
                <>
                  <div
                    className={`menu-item ${isActiveMenu(menu) ? 'active' : ''}`}
                    onClick={() => toggleMenu(menu.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleMenu(menu.name);
                      }
                    }}
                  >
                    <span>{menu.name}</span>
                    <span className={'menu-item-arrow'}>
                      {openMenus[menu.name] ? '▼' : '▶'}
                    </span>
                  </div>
                  {openMenus[menu.name] && (
                    <ul>
                      {menu.children.map((child) => (
                        <li
                          key={child.path}
                          className={location.pathname === child.path ? 'active' : ''}
                        >
                          <div
                            onClick={() => handleMenuClick(child.path)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleMenuClick(child.path);
                              }
                            }}
                          >
                            {' ' + child.name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div
                  className={location.pathname === menu.path ? 'active' : ''}
                  onClick={() => handleMenuClick(menu.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMenuClick(menu.path);
                    }
                  }}
                >
                  {menu.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="main">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;