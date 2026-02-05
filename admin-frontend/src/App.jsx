import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import './styles/AdminNavigation.css'; // ✅ 네비게이션 CSS만 임포트
import './styles/Admin.css'; // ⚠️ 다른 팀원이 관리 중

// Pages
import HomeAdmin from './pages/home-admin/HomeAdmin';

import AdminLayout from './components/AdminLayout';
import PassUsageStatsPage from './pages/pass/PassUsageStatsPage';
import AdminTicketPage from './pages/pass/AdminTicketPage';
import AdminPassProductPage from './pages/product/AdminPassProductPage';
import AdminReservationPage from './pages/reservation/AdminReservationPage';
import MarketStatsPage from './pages/trade/MarketStatsPage';
import AdminTradePage from './pages/trade/AdminTradePage';
import AdminMarketPostPage from './pages/trade/AdminMarketPostPage';

import AdminFaqPage from './pages/FAQ/AdminFaqPage';
import AdminCommunityPage from './pages/Community/AdminCommunityPage';
import AdminCommunityDetailPage from './pages/Community/AdminCommunityDetail';
import AdminNoticePage from './pages/Notice/AdminNoticePage';
import UserPage from './pages/Users/UsersPage';
import UsersAdminPage from './pages/UsersAdmin/UsersAdminPage';
// Branch pages
import AdminBranchPage from './pages/AdminBranchPage';
import AdminBranchInfoPage from './pages/AdminBranchInfoPage';
import BranchList from './pages/branch/BranchList';
import BranchDetail from './pages/branch/BranchDetail';
import BranchRegister from './pages/branch/BranchRegister';
import BranchForm from './pages/branch/BranchForm';
// Schedule page
import AdminSchedulePage from './pages/AdminSchedulePage';
// Payment page
import PaymentManagement from './pages/payment/PaymentManagement';
// Center page
import CenterInfo from './pages/center/CenterInfo';
// Attendance page
import AdminAttendancePage from './pages/AdminAttendancePage';
// Teachers page
import AdminTeachersListPage from './pages/Teachers/AdminTeachersListPage';
import AdminTeachersDetailPage from './pages/Teachers/AdminTeachersDetailPage';
import AdminTeachersCreatePage from './pages/Teachers/AdminTeachersCreatePage';
import AdminTeachersEditPage from './pages/Teachers/AdminTeachersEditPage';
// Sports page
import AdminSportTypes from './pages/SportType/AdminSportType';
// Myclass page
import AdminMyClassDetailPage from "@/pages/Myclass/AdminMyClassDetailPage.jsx";
import AdminMyClassListPage from "@/pages/Myclass/AdminMyClassClassListPage.jsx";
import AdminScheduleRemakePage from './pages/Schedules/AdminScheduleRemakePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 (레이아웃 없음) */}
        <Route path="/" element={<AdminLayout />} />

        {/* 관리자 레이아웃 적용 그룹 */}
        <Route element={<LayoutWrapper />}>
          {/* 메인 화면 (사이트맵) */}
          <Route index element={<HomeAdmin />} />

          {/* 회원 관리 */}
          <Route path="/users" element={<UserPage />} />
          <Route path="/usersAdmin" element={<UsersAdminPage />} />
          <Route path="/centers" element={<CenterInfo />} />
          <Route path="/centers/:branchId" element={<CenterInfo />} />

          {/* 이미 만든 페이지들 */}
          <Route path="/marketstats" element={<MarketStatsPage />} />
          <Route path="/trades" element={<AdminTradePage />} />
          <Route path="/markets" element={<AdminMarketPostPage />} />
          <Route path="/reservations" element={<AdminReservationPage />} />
          <Route path="/ticketstats" element={<PassUsageStatsPage />} />
          <Route path="/tickets" element={<AdminTicketPage />} />
          <Route path="/products" element={<AdminPassProductPage />} />

          {/* FAQ */}
          <Route path="/AdminFaqPage" element={<AdminFaqPage />} />
          {/* 커뮤니티 */}
          <Route path="/community" element={<AdminCommunityPage />} />
          <Route path="/community/detail/:id" element={<AdminCommunityDetailPage />} />
          {/* 공지사항 */}
          <Route path="/notice" element={<AdminNoticePage />} />

          {/* 지점 관리 */}
          <Route path="/branches" element={<AdminBranchPage />} />
          <Route path="/branch-info" element={<AdminBranchInfoPage />} />
          <Route path="/branches/list" element={<BranchList />} />
          <Route path="/branches/new" element={<BranchRegister />} />
          <Route path="/branches/:branchId" element={<BranchDetail />} />
          <Route path="/branches/:branchId/edit" element={<BranchForm />} />

          {/* 강사 관리 */}
          <Route path="/teachers" element={<AdminTeachersListPage />} />
          <Route path="/teachers/new" element={<AdminTeachersCreatePage />} />
          <Route path="/teachers/:userId" element={<AdminTeachersDetailPage />} />
          <Route path="/teachers/:userId/edit" element={<AdminTeachersEditPage />} />

          {/* 내 수업 관리 */}
          <Route path="/myclass" element={<AdminMyClassListPage />} />
          <Route path="/myclass/schedules/:schdId" element={<AdminMyClassDetailPage />} />


          {/* 스케줄 관리 */}
          {/* <Route path="/schedules" element={<AdminSchedulePage />} /> */}
          <Route path='/schedules' element={<AdminScheduleRemakePage />} />

          {/* 스포츠 관리 */}
          <Route path="/sports" element={<AdminSportTypes/>} />
          

          {/* 결제 관리 */}
          <Route path="/payment" element={<PaymentManagement />} />

          {/* 출결관리 */}
          {/*<Route path="/attendance" element={<AdminAttendancePage />} />*/}
        </Route>
      </Routes>
    </Router>
  );
}

// LayoutWrapper: AdminLayout 안에 <Outlet />을 넣어 자식 라우트를 렌더링
function LayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default App;