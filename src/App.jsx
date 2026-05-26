import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TeacherScreen from './screens/TeacherScreen';
import AdminScreen from './screens/AdminScreen';
import AuthController from './AuthController';

import './styles/Variables.css';
import './styles/Global.css';
import './styles/Login.css';
import './styles/Theme.css';
import './styles/layout/MainLayout.css';
import './styles/layout/Header.css';
import './styles/layout/Sidebar.css';
import './styles/layout/UserMenu.css';
import './styles/layout/Notification.css';
import './styles/profileSetting/ProfileSetting.css';

import { SchoolProvider } from './context/SchoolContext';
import { NotificationProvider } from './context/NotificationContext';
import LoadingScreen from './components/common/LoadingScreen';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('lbca_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Restore page after GitHub Pages 404 redirect
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath, { replace: true });
    }
  }, []);

  const handleAuthSuccess = async (accessToken, refreshToken, user = null) => {
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);

    let currentUser = user;
    if (!currentUser) {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) currentUser = await res.json();
      } catch (e) {
        console.warn('Could not fetch current user:', e);
      }
    }

    const role  = currentUser?.role  || (currentUser?.email === 'admin@lbca.edu' ? 'admin' : 'teacher');
    const email = currentUser?.email || 'user@lbca.edu';
    const userData = { role, email };
    sessionStorage.setItem('lbca_user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.removeItem('lbca_user');
      setUser(null);
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  if (isLoading) return <LoadingScreen message={user ? 'Signing out…' : 'Signing you in…'} />;

  return (
    <Routes>
      {!user && <Route path="*" element={<AuthController onAuthSuccess={handleAuthSuccess} />} />}
      {user?.role === 'teacher' && <Route path="/*" element={<TeacherScreen onLogout={handleLogout} user={user} />} />}
      {user?.role === 'admin'   && <Route path="/*" element={<AdminScreen   onLogout={handleLogout} user={user} />} />}
    </Routes>
  );
}

function App() {
  return (
    <SchoolProvider>
      <NotificationProvider>
        <BrowserRouter basename="/LBCA_Monitoring_System_FASTAPI">
          <AppContent />
        </BrowserRouter>
      </NotificationProvider>
    </SchoolProvider>
  );
}

export default App;