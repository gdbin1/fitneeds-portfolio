import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../components/auth/AuthModalStyles.css';
import './MyPage.css';


import UsageHistorySection from './UsageHistorySection';
import ReviewWriteSection from './ReviewWriteSection';
import PaymentHistorySection from './PaymentHistorySection';
import AttendanceSection from './AttendanceSection';
import ProfileSection from './ProfileSection';
import SideBar from './SideBar';

function MyPage() {
  const location = useLocation();

  // activeMenu는 세션 상태로 관리 (페이지 새로고침 시 메인 페이지로 초기화)
  // 초기값을 location.state?.menu로 설정하여 깜박임 방지
  const [activeMenu, setActiveMenu] = useState(() => {
    // 초기 마운트 시에만 location.state에서 menu를 가져옴
    return location.pathname === '/mypage' ? (location.state?.menu ?? null) : null;
  });

  // location.state에서 메뉴 정보를 받아서 activeMenu 설정
  useEffect(() => {
    if (location.pathname === '/mypage') {
      // location.state?.menu가 명시적으로 전달된 경우에만 업데이트
      if (location.state?.menu !== undefined) {
        setActiveMenu(location.state.menu);
        // state를 사용한 후 제거하여 뒤로가기 시 문제가 없도록 함
        window.history.replaceState({}, document.title);
      }
      // location.state?.menu가 undefined이고 location.state 자체도 없는 경우는
      // 이전 상태를 유지하여 깜박임 방지 (다른 페이지에서 navigate로 이동한 경우)
    }
  }, [location.state, location.pathname]);

  const [reviewTab, setReviewTab] = useState('written'); // 'written' (작성한 리뷰만 표시)
  const [refreshKey, setRefreshKey] = useState(0); // 리뷰 작성 후 새로고침을 위한 키

  // Redux에서 로그인한 사용자 정보 가져오기
  const userName = useSelector((state) => state.auth.userName);

  // 나의 정보 수정 상태 (프로필 섹션용)
  const [userInfo, setUserInfo] = useState({
    name: userName || '',
    email: '',
    phone: '',
    address: ''
  });

  // userName이 변경될 때 userInfo 업데이트
  useEffect(() => {
    if (userName) {
      setUserInfo(prev => ({
        ...prev,
        name: userName
      }));
    }
  }, [userName]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'usage-list':
      case 'usage-history':
        return (
          <UsageHistorySection
            onRefresh={refreshKey}
          />
        );

      case 'review-write':
        return (
          <ReviewWriteSection
            reviewTab={reviewTab}
            setReviewTab={setReviewTab}
          />
        );

      case 'payment-history':
        return <PaymentHistorySection />;

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>FITNEEDS - 마이페이지</title>
        <meta name="description" content="FITNEEDS - 마이페이지" />
      </Helmet>

      <div className="mypage-container">
        <SideBar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

        {/* Main Content Area */}
        <main className="mypage-main">
          {/* User Profile Section - 나의 운동 메인 페이지에서만 표시 */}
          {activeMenu === null && (
            <ProfileSection
              userName={userName}
              userInfo={userInfo}
              onMenuClick={setActiveMenu}
            />
          )}

          {/* Content Section */}
          {activeMenu === null ? (
            <AttendanceSection />
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </>
  );
}

export default MyPage;
