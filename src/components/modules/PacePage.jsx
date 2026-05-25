import PaceFilter from './pace/PaceFilter';
import PaceTable from './pace/PaceTable';
import usePaceEncodingState from '../../hooks/usePaceEncodingState';
import '../../styles/pace/PacePage.css';

const PacePage = ({ teacher = null }) => {
  const {
    filters,
    updateFilter,

    // live dropdown options from backend
    schoolYearOptions,
    gradeLevelOptions,
    sectionOptions,
    subjectOptions,

    // table data
    encodingData,
    handleDataChange,
    handleAddPaceForCurrent,

    // loading / error
    loading,
    loadingRef,
    error,
  } = usePaceEncodingState(teacher);

  return (
    <div className="pace-page">
      <div className="pace-header-row">
        <div className="header-title">
          <div className="title-wrapper">
            <h2>PACE Progress Encoding</h2>
          </div>
          <p className="header-subtitle">Record student PACE completion and test scores</p>
        </div>

        <PaceFilter
          filters={filters}
          onFilterChange={updateFilter}
          schoolYearOptions={schoolYearOptions}
          gradeLevelOptions={gradeLevelOptions}
          sectionOptions={sectionOptions}
          subjectOptions={subjectOptions}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="pace-error-banner" style={{ color: 'red', padding: '8px 0' }}>
          {error}
        </div>
      )}

      {/* Loading state for initial reference data */}
      {loadingRef ? (
        <div className="pace-loading">Loading filters…</div>
      ) : (
        <PaceTable
          data={encodingData}
          onDataChange={handleDataChange}
          onAddPaceForCurrent={handleAddPaceForCurrent}
          subject={filters.subject}
          section={filters.section}
          gradeLevel={filters.gradeLevel}
          loading={loading}
        />
      )}
    </div>
  );
};

export default PacePage;