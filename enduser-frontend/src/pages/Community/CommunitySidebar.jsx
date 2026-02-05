import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './CommunitySidebar.css';

const CommunitySidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/notice', label: '공지사항' },
    { path: '/faq', label: 'FAQ' },
    { path: '/community', label: '커뮤니티 게시판', exact: true },
  ];

  return (
    <aside className="community-sidebar">
      <nav>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <li 
                key={item.path} 
                className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
              >
                <NavLink
                  to={item.path}
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
  );
};

export default CommunitySidebar;
