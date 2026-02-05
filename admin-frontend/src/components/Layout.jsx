import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="layout-wrapper">
      <Navigation />
      <main className={`layout-main ${isHomePage ? 'layout-main-home' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

