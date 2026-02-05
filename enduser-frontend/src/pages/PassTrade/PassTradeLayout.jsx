import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './PassTradeLayout.css';
import './PassTradeSidebar.css';

const PassTradeLayout = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/pass-trade', label: '거래 게시글 목록' },
    { path: '/pass-trade/transactions', label: '거래 내역' },
    { path: '/pass-trade/faq', label: '이용권 FAQ' },
    { path: '/pass-trade/favorite', label: '즐겨찾기' },
  ];

  return (
    <div className="pass-trade-layout">
      <aside className="pass-trade-sidebar">
        <nav>
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const isActive = item.path === '/pass-trade'
                ? location.pathname === '/pass-trade'
                : location.pathname.startsWith(item.path);
              
              return (
                <li 
                  key={item.path} 
                  className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                >
                  <NavLink
                    to={item.path}
                    end={item.path === '/pass-trade'}
                    className="sidebar-menu-button"
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="pass-trade-main">
        <Outlet />
      </main>
    </div>
  );
};

export default PassTradeLayout;
