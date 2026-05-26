import { useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';
import Dashboard from '../components/modules/Dashboard.jsx';
import ProfileSetting from '../components/modules/ProfileSetting.jsx';
import StudentsPage from '../components/modules/StudentsPage.jsx';
import StudentsProfile from '../components/modules/students/StudentProfile.jsx';
import PacePage from '../components/modules/PacePage.jsx';
import EarlyWarningPage from '../components/modules/EarlyWarningPage.jsx';
import NotFound from '../components/common/NotFound.jsx';

const TeacherScreen = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [teacherPhoto, setTeacherPhoto] = useState(null);

  const handleNavigate = (tab, studentId) => {
    if (tab === 'logout') { onLogout(); return; }
    if (tab === 'student-profile' && studentId) {
      navigate(`/student/${studentId}`);
    } else {
      navigate(`/${tab}`);
    }
  };

  const getActiveTab = () => {
    const hash = window.location.hash.replace('#', '') || '/';
    if (hash.includes('/account-settings')) return 'account-settings';
    if (hash.includes('/students')) return 'students';
    if (hash.includes('/pace')) return 'pace';
    if (hash.includes('/risk')) return 'risk';
    if (hash.includes('/student/')) return 'students';
    return 'dashboard';
  };

  return (
    <NotificationProvider>
      <MainLayout
        onLogout={onLogout}
        activeTab={getActiveTab()}
        onNavigate={handleNavigate}
        userRole="teacher"
        userPhoto={teacherPhoto}
      >
        <Routes>
          <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} userRole="teacher" />} />
          <Route path="/students" element={<StudentsPage onNavigate={handleNavigate} />} />
          <Route path="/pace" element={<PacePage onNavigate={handleNavigate} />} />
          <Route path="/risk" element={<EarlyWarningPage onNavigate={handleNavigate} />} />
          <Route path="/account-settings" element={<ProfileSetting onNavigate={handleNavigate} onAdminPhotoUpdate={setTeacherPhoto} userRole="teacher" />} />
          <Route path="/student/:studentId" element={<StudentsProfile onNavigate={handleNavigate} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </NotificationProvider>
  );
};

export default TeacherScreen;