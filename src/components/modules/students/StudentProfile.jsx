import { useParams } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, AlertTriangle, Printer, Pencil } from 'lucide-react';
import useStudentProfileState from '../../../hooks/useStudentProfileState';
import StudentFormModal from './StudentFormModal';
import ProfileOverviewTab from './profile/ProfileOverviewTab';
import ProfilePaceTab from './profile/ProfilePaceTab';
import ProfileRiskTab from './profile/ProfileRiskTab';
import '../../../styles/students/StudentProfile.css';

const TAB_ICONS = {
  overview: User,
  pace: BookOpen,
  risk: AlertTriangle,
};

const StudentProfile = ({ onNavigate }) => {
  const { studentId } = useParams();

  const {
    TABS,
    activeTab, setActiveTab,
    showEditModal, setShowEditModal,
    student,
    paceRecords,
    aiData,
    loading,
    aiLoading,
    error,
    gradeLevels,
    sections,
    schoolYears,
    handleSaveEdit,
    handlePrint,
  } = useStudentProfileState(studentId);

  const getFullName = () => {
    const mid = student?.middle_name ? ` ${student.middle_name.charAt(0)}.` : '';
    return `${student?.last_name}, ${student?.first_name}${mid}`;
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <ProfileOverviewTab student={student} />;
      case 'pace':       return <ProfilePaceTab student={student} paceRecords={paceRecords} />;
      case 'risk':       return <ProfileRiskTab student={student} paceRecords={paceRecords} aiData={aiData} aiLoading={aiLoading} />;
      default:           return null;
    }
  };

  if (loading) {
    return (
      <div className="student-profile">
        <header className="profile-header">
          <button className="back-button" onClick={() => onNavigate('students')}>
            <ArrowLeft size={20} /><span>Back to Students</span>
          </button>
        </header>
        <div className="profile-card">
          <div className="no-data-message">Loading student profile…</div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="student-profile">
        <header className="profile-header">
          <button className="back-button" onClick={() => onNavigate('students')}>
            <ArrowLeft size={20} /><span>Back to Students</span>
          </button>
        </header>
        <div className="profile-card">
          <div className="no-data-message">
            {error ? `Error: ${error}` : `Student not found. (ID: ${studentId})`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile">
      <header className="profile-header">
        <button className="back-button" onClick={() => onNavigate('students')}>
          <ArrowLeft size={20} /><span>Back to Students</span>
        </button>
        <div className="profile-header-actions">
          <button className="profile-edit-btn" onClick={() => setShowEditModal(true)} title="Edit Student Profile">
            <Pencil size={16} /><span>Edit</span>
          </button>
          <button className="profile-print-btn" onClick={handlePrint} title="Print Student Overview">
            <Printer size={16} /><span>Print</span>
          </button>
        </div>
      </header>

      <div className="profile-card">
        <div className="profile-info">
          <div className="student-profile-icon"><User size={40} /></div>
          <div className="profile-details">
            <h2>{getFullName()}</h2>
            <p>
              {student.gradeLevelDisplay} &bull; {student.sectionDisplay} &bull; ID: {student.student_id}
              {student.login_id && <> &bull; Login: <strong>{student.login_id}</strong></>}
            </p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {student.schoolYearDisplay} &bull; {student.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        <nav className="profile-tabs">
          {TABS.map(tab => {
            const Icon = TAB_ICONS[tab.id];
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} /><span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {renderTab()}
      </div>

      <StudentFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        student={student}
        gradeLevels={gradeLevels}
        sections={sections}
        schoolYears={schoolYears}
      />
    </div>
  );
};

export default StudentProfile;