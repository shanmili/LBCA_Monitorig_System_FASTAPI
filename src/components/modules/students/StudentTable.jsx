import '../../../styles/students/StudentTable.css';

const StudentTable = ({ students, getStatusBadgeClass, onNavigate }) => {
  const getFullName = (student) => {
    const mid = student.middle_name ? ` ${student.middle_name.charAt(0)}.` : '';
    return `${student.last_name}, ${student.first_name}${mid}`;
  };

  return (
    <div className="students-table-container">
      <table className="students-list-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Student Name</th>
            <th>Grade</th>
            <th>Section</th>
            <th>Guardian</th>
            <th>Contact</th>
            <th>School Year</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr key={student.student_id}>
                <td>{index + 1}</td>
                <td className="student-name-cell">{getFullName(student)}</td>
                <td>{student.gradeLevelDisplay}</td>
                <td>{student.sectionDisplay}</td>
                <td>{student.guardian_last_name}</td>
                <td>{student.guardian_contact}</td>
                <td>{student.schoolYearDisplay}</td>
                <td>
                  <span className={getStatusBadgeClass(student.isActive)}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => onNavigate('student-profile', student.student_id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-results">No students found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;