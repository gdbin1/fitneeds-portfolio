import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import './styles/common.css';


// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home/Home';
import FAQ from './pages/FAQ/FAQ';
import MyPage from './pages/MyPage/MyPage';
import MyReservationList from './pages/MyPage/MyReservationList';
import MyPassPage from './pages/MyPage/MyPassPage';
import CommunityUser from './pages/Community/CommunityUser';
import CommunityUserDetail from './pages/Community/CommunityUserDetail';
import CommunityUserWrite from './pages/Community/CommunityUserWrite';
import CommunityMyRecruitList from './pages/Community/CommunityMyRecruitList';
import CommunityMyPostList from './pages/Community/CommunityMyPostList';

import NoticeUserPage from "./pages/Notice/NoticeUserPage";
import TypeSelect from './pages/ToReservation/TypeSelect/TypeSelect';
import ScheduleListPage from './pages/ToReservation/ScheduleListPage/ScheduleListPage';
import ProgramDetailPage from './pages/ToReservation/ProgramDetailPage/ProgramDetailPage';
import PaymentForReservation from './pages/ToReservation/Payment/PaymentForReservation';
import ReservationComplete from './pages/ToReservation/ReservationComplete/ReservationComplete';

// PassTrade pages
import PassTradeLayout from './pages/PassTrade/PassTradeLayout';
import PassTradePost from './pages/PassTrade/PassTradePost';
import PassTradeTransaction from './pages/PassTrade/PassTradeTransaction';
import PassTradeFaq from './pages/PassTrade/PassTradeFaq';
import PassTradeFavorite from './pages/PassTrade/PassTradeFavorite';


function App() {
  useEffect(() => {
    // Load Bootstrap JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/reservations" element={<MyReservationList />} />
            <Route path="/mypage/my-pass" element={<MyPassPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />

            <Route path="/community" element={<CommunityUser />} />
            <Route path="/community/:postId" element={<CommunityUserDetail />} />
            <Route path="/community/write" element={<CommunityUserWrite />} />
            <Route path="/community/my-recruits" element={<CommunityMyRecruitList />} />
            <Route path="/community/my-posts" element={<CommunityMyPostList />} />

            <Route path="/notice" element={<NoticeUserPage />} />

            {/* 예약하기 */}
            <Route path="/type-select" element={<TypeSelect />} />
            <Route path="/schedule-list" element={<ScheduleListPage />} />
            <Route path="/program-detail" element={<ProgramDetailPage />} />
            <Route path="/payment-reservation" element={<PaymentForReservation />} />
            <Route path="/reservation-complete" element={<ReservationComplete />} />

            {/* PassTrade */}
            <Route path="/pass-trade" element={<PassTradeLayout />}>
              <Route index element={<PassTradePost />} />
              <Route path="transactions" element={<PassTradeTransaction />} />
              <Route path="faq" element={<PassTradeFaq />} />
              <Route path="favorite" element={<PassTradeFavorite />} />
            </Route>

          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;

