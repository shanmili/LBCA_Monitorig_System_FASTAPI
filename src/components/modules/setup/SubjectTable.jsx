import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import SubjectModal from './SubjectModal.jsx';
import { subjectApi, gradeLevelApi } from '../../../services/api.js';
import useSubjectState from '../../../hooks/useSubjectState.js';
import '../../../styles/setup/SubjectTable.css';

const ErrorBanner = ({ message, onRetry }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', marginBottom: 12,
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
    color: '#b91c1c', fontSize: 13,
  }}>
    <AlertCircle size={15} />
    <span style={{ flex: 1 }}>{message}</span>
    {onRetry && (
      <button onClick={onRetry} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'none', border: '1px solid #f87171', borderRadius: 4,
        padding: '2px 8px', color: '#b91c1c', cursor: 'pointer', fontSize: 12,
      }}>
        <RefreshCw size={12} /> Retry
      </button>
    )}
  </div>
);

const SubjectTable = () => {
  const {
    subjects,
    loading,
    error,
    modalOpen,
    editingItem,
    saving,
    fetchSubjects,
    handleDelete,
    handleSave,
    openModal,
    setModalOpen,
  } = useSubjectState();

  const [gradeLevels, setGradeLevels] = useState([]);
  const [glLoading, setGlLoading] = useState(true);
  const [expandedGradeLevel, setExpandedGradeLevel] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const gl = await gradeLevelApi.list();
        setGradeLevels(gl);
        await fetchSubjects();
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setGlLoading(false);
      }
    };
    init();
  }, [fetchSubjects]);

  const getGradeLevelName = (id) => {
    const gl = gradeLevels.find(g => g.grade_level_id === id);
    return gl ? `${gl.name}` : `Grade Level ${id}`;
  };

  const getSubjectsByGradeLevel = (gradeLevelId) => {
    return subjects.filter(s => s.grade_level_id === gradeLevelId);
  };

  if (glLoading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading subjects...</div>;
  }

  return (
    <div className="subject-section">
      <div className="subject-header">
        <div>
          <h2 className="subject-title">Subject Management</h2>
          <p className="subject-subtitle">Manage subjects linked to grade levels. Each subject is assigned to a specific grade level via the foreign key relationship.</p>
        </div>
        <button
          className="subject-add-btn"
          onClick={() => openModal()}
          disabled={saving}
        >
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => fetchSubjects()}
        />
      )}

      {subjects.length === 0 ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: 14 }}>No subjects yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="subject-accordion">
          {gradeLevels.map(gradeLevel => {
            const gradeSubjects = getSubjectsByGradeLevel(gradeLevel.grade_level_id);
            const isExpanded = expandedGradeLevel === gradeLevel.grade_level_id;

            return (
              <div key={gradeLevel.grade_level_id} className="subject-accordion-item">
                <button
                  className="subject-accordion-header"
                  onClick={() => setExpandedGradeLevel(
                    isExpanded ? null : gradeLevel.grade_level_id
                  )}
                >
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                  <span className="subject-accordion-title">
                    {gradeLevel.level} - {gradeLevel.name}
                  </span>
                  <span className="subject-count">({gradeSubjects.length})</span>
                </button>

                {isExpanded && (
                  <div className="subject-accordion-content">
                    {gradeSubjects.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                        No subjects for this grade level
                      </div>
                    ) : (
                      <div className="subject-table">
                        <div className="subject-table-header">
                          <div className="subject-table-cell subject-grade-col">Grade Level</div>
                          <div className="subject-table-cell subject-name-col">Subject Name</div>
                          <div className="subject-table-cell subject-code-col">Code</div>
                          <div className="subject-table-cell subject-status-col">Status</div>
                          <div className="subject-table-cell subject-actions-col">Actions</div>
                        </div>
                        {gradeSubjects.map(subject => (
                          <div key={subject.subject_id} className="subject-table-row">
                            <div className="subject-table-cell subject-grade-col">
                              <span className="subject-grade">{getGradeLevelName(subject.grade_level_id)}</span>
                            </div>
                            <div className="subject-table-cell subject-name-col">
                              <span className="subject-name">{subject.subject_name}</span>
                            </div>
                            <div className="subject-table-cell subject-code-col">
                              <code className="subject-code">{subject.subject_code}</code>
                            </div>
                            <div className="subject-table-cell subject-status-col">
                              <span className={`subject-badge ${subject.is_active ? 'active' : 'inactive'}`}>
                                {subject.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="subject-table-cell subject-actions-col">
                              <button
                                className="subject-btn-edit"
                                onClick={() => openModal(subject)}
                                disabled={saving}
                                title="Edit subject"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="subject-btn-delete"
                                onClick={() => handleDelete(subject.subject_id)}
                                disabled={saving}
                                title="Delete subject"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SubjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        onSave={handleSave}
        editingItem={editingItem}
        gradeLevels={gradeLevels}
      />
    </div>
  );
};

export default SubjectTable;
