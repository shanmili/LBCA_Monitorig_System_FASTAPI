import FilterBar from '../../../components/common/FilterBar';

/**
 * StudentFilter
 *
 * Props:
 *   filters         — current filter state
 *   onFilterChange  — fn(key, value)
 *   gradeLevels     — [{ grade_level_id, level }] from API
 *   sections        — [{ section_id, name, grade_level }] from API
 *   schoolYears     — [{ school_year_id, year, is_current }] from API
 *   teacher         — optional teacher object with assignedGrades/assignedSections
 */
const StudentFilter = ({
  filters,
  onFilterChange,
  gradeLevels = [],
  sections = [],
  schoolYears = [],
  teacher = null,
}) => {
  // Filter by teacher assignments if applicable
  const availableGrades = teacher?.assignedGrades
    ? gradeLevels.filter(gl => teacher.assignedGrades.includes(gl.level))
    : gradeLevels;

  // Filter sections by selected grade and teacher scope
  const availableSections = (() => {
    let filtered = sections;
    if (filters.gradeLevel !== 'All') {
      filtered = filtered.filter(s => String(s.grade_level) === filters.gradeLevel);
    }
    if (teacher?.assignedSections) {
      filtered = filtered.filter(s => teacher.assignedSections.includes(s.name));
    }
    return filtered;
  })();

  const filterOptions = [
    {
      key: 'schoolYear',
      value: filters.schoolYear,
      options: [
        { value: 'All', label: 'All Years' },
        ...schoolYears.map(sy => ({
          value: String(sy.school_year_id),
          label: `SY ${sy.year}`,
        })),
      ],
    },
    {
      key: 'gradeLevel',
      value: filters.gradeLevel,
      options: [
        { value: 'All', label: 'All Grades' },
        ...availableGrades.map(gl => ({
          value: String(gl.grade_level_id),
          label: gl.level,
        })),
      ],
    },
    {
      key: 'section',
      value: filters.section,
      options: [
        { value: 'All', label: 'All Sections' },
        ...availableSections.map(s => ({
          value: String(s.section_id),
          label: `${s.name}`,
        })),
      ],
    },
    {
      key: 'status',
      value: filters.status,
      options: [
        { value: 'All', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];

  return <FilterBar filters={filterOptions} onFilterChange={onFilterChange} />;
};

export default StudentFilter;
