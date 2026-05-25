import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import { NotificationProvider } from '../context/NotificationContext.jsx';
import Dashboard from '../components/modules/Dashboard.jsx';
import ProfileSetting from '../components/modules/ProfileSetting.jsx';
import StudentsPage from '../components/modules/StudentsPage.jsx';
import StudentsProfile from '../components/modules/students/StudentProfile.jsx';
import PacePage from '../components/modules/PacePage.jsx';
import EarlyWarningPage from '../components/modules/EarlyWarningPage.jsx';
import LoadingScreen from '../components/common/LoadingScreen.jsx';
import NotFound from '../components/common/NotFound.jsx';
import { classScheduleApi, schoolYearApi, sectionApi, staffApi, subjectApi } from '../services/api.js';

const TeacherScreen = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [teacherPhoto, setTeacherPhoto] = useState(null);
  const [teacherScope, setTeacherScope] = useState(null);
  const [teacherScopeLoading, setTeacherScopeLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTeacherScope() {
      try {
        const [currentUser, schoolYears, sections, subjects, classSchedules] = await Promise.all([
          staffApi.me(),
          schoolYearApi.list(),
          sectionApi.list(),
          subjectApi.list(),
          classScheduleApi.list(),
        ]);

        if (!mounted) return;

        const currentSchoolYear = schoolYears.find((sy) => sy.is_current) || schoolYears[0] || null;
        const scopedSchedules = currentSchoolYear
          ? classSchedules.filter((schedule) => String(schedule.school_year_id) === String(currentSchoolYear.school_year_id))
          : classSchedules;

        const teacherSchedules = scopedSchedules.filter(
          (schedule) => String(schedule.teacher_id) === String(currentUser.id)
        );

        const sectionMap = new Map(sections.map((section) => [String(section.section_id), section]));
        const subjectMap = new Map(subjects.map((subject) => [String(subject.subject_id), subject]));

        const assignedGrades = [...new Set(
          teacherSchedules
            .map((schedule) => sectionMap.get(String(schedule.section_id)))
            .filter(Boolean)
            .map((section) => section.grade_level_display || section.grade_level)
            .filter(Boolean)
        )];

        const assignedSections = [...new Set(
          teacherSchedules
            .map((schedule) => sectionMap.get(String(schedule.section_id)))
            .filter(Boolean)
            .map((section) => section.name)
            .filter(Boolean)
        )];

        const assignedSubjects = [...new Set(
          teacherSchedules
            .map((schedule) => subjectMap.get(String(schedule.subject_id)))
            .filter(Boolean)
            .map((subject) => subject.subject_name)
            .filter(Boolean)
        )];

        setTeacherScope({
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          role: currentUser.role,
          schoolYearId: currentSchoolYear?.school_year_id ?? null,
          assignedGrades,
          assignedSections,
          assignedSubjects,
        });
      } catch (err) {
        console.warn('Failed to load teacher scope:', err);
        setTeacherScope(null);
      } finally {
        if (mounted) setTeacherScopeLoading(false);
      }
    }

    loadTeacherScope();

    return () => {
      mounted = false;
    };
  }, []);

  // Redirect to /dashboard on first mount
  useEffect(() => {
    const path = window.location.pathname;
    // Only redirect if literally at the base with no route
    if (path === '/LBCA-Monitoring-System' || 
        path === '/LBCA-Monitoring-System/' ||
        path === '/LBCA-Monitoring-System/?r=1') {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const handleNavigate = (tab, studentId) => {
    if (tab === 'logout') { onLogout(); return; }
    if (tab === 'student-profile' && studentId) {
      navigate(`/student/${studentId}`);
    } else {
      navigate(`/${tab}`);
    }
  };

  const getActiveTab = () => {
    const path = window.location.pathname;
    if (path.includes('/account-settings')) return 'account-settings';
    if (path.includes('/students')) return 'students';
    if (path.includes('/pace')) return 'pace';
    if (path.includes('/risk')) return 'risk';
    if (path.includes('/student/')) return 'students';
    return 'dashboard';
  };

  if (teacherScopeLoading) {
    return <LoadingScreen message="Loading teacher assignments…" />;
  }

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
          <Route path="/students" element={<StudentsPage onNavigate={handleNavigate} teacher={teacherScope} />} />
          <Route path="/pace" element={<PacePage onNavigate={handleNavigate} teacher={teacherScope} />} />
          <Route path="/risk" element={<EarlyWarningPage onNavigate={handleNavigate} teacher={teacherScope} />} />
          <Route path="/account-settings" element={<ProfileSetting onNavigate={handleNavigate} onAdminPhotoUpdate={setTeacherPhoto} userRole="teacher" />} />
          <Route path="/student/:studentId" element={<StudentsProfile onNavigate={handleNavigate} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </NotificationProvider>
  );
};

export default TeacherScreen;