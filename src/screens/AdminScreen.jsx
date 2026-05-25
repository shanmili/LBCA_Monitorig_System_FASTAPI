import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';
import Dashboard from '../components/modules/Dashboard.jsx';
import ProfileSetting from '../components/modules/ProfileSetting.jsx';
import StudentsPage from '../components/modules/StudentsPage.jsx';
import StudentsProfile from '../components/modules/students/StudentProfile.jsx';
import TeachersPage from '../components/modules/TeachersPage.jsx';
import PendingApprovalsPage from '../components/modules/PendingApprovalsPage.jsx';
import EarlyWarningPage from '../components/modules/EarlyWarningPage.jsx';
import NotFound from '../components/common/NotFound.jsx';
import SetupPage from '../components/modules/setup/SetupPage.jsx';

const AdminScreen = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [adminPhoto, setAdminPhoto] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (
      path === '/LBCA_Monitoring_System_FASTAPI' ||
      path === '/LBCA_Monitoring_System_FASTAPI/' ||
      path === '/LBCA_Monitoring_System_FASTAPI/?r=1'
    ) {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const handleNavigate = (tab, studentId) => {
    if (tab === 'logout') { onLogout(); return; }
    if (tab === 'teachers') {
      navigate('/teachers');
    } else if (tab === 'approvals') {
      navigate('/approvals');
    } else if (tab === 'student-profile' && studentId) {
      navigate(`/student/${studentId}`);
    } else {
      navigate(`/${tab}`);
    }
  };

  const getActiveTab = () => {
    const path = window.location.pathname;
    if (path.includes('/account-settings')) return 'account-settings';
    if (path.includes('/students')) return 'students';
    if (path.includes('/teachers')) return 'teachers';
    if (path.includes('/approvals')) return 'approvals';
    if (path.includes('/risk')) return 'risk';
    if (path.includes('/student/')) return 'students';
    if (path.includes('/class-management')) return 'class-management';
    return 'dashboard';
  };

  return (
    <NotificationProvider>
      <MainLayout
        onLogout={onLogout}
        activeTab={getActiveTab()}
        onNavigate={handleNavigate}
        userRole="admin"
        adminPhoto={adminPhoto}
      >
        <Routes>
          <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} userRole="admin" />} />
          <Route path="/students" element={<StudentsPage onNavigate={handleNavigate} />} />
          <Route path="/teachers" element={<TeachersPage onNavigate={handleNavigate} />} />
          <Route path="/approvals" element={<PendingApprovalsPage />} />
          <Route path="/risk" element={<EarlyWarningPage onNavigate={handleNavigate} />} />
          <Route path="/account-settings" element={
            <ProfileSetting
              onNavigate={handleNavigate}
              onAdminPhotoUpdate={setAdminPhoto}
            />
          } />
          <Route path="/student/:studentId" element={<StudentsProfile onNavigate={handleNavigate} />} />
          <Route path="/class-management" element={<SetupPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </NotificationProvider>
  );
};

export default AdminScreen;