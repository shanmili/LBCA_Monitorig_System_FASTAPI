import { useState, useEffect, useCallback, useRef } from 'react';
import {
  schoolYearApi,
  gradeLevelApi,
  sectionApi,
  subjectApi,
  enrollmentApi,
  paceApi,
} from '../api/api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a list of backend pace records for one student+subject into the
 * UI paceRecords array format:
 *   [{ paceNo, testScore, paceId, enrollmentId }]
 *
 * The backend stores one StudentPace row per (enrollment, subject).
 * We keep the list sorted by pace_id so PACE #1 is index 0, #2 is index 1, etc.
 */
function toPaceRecords(backendRows) {
  // Sort by pace_id ascending so older records = smaller PACE numbers
  const sorted = [...backendRows].sort((a, b) => a.pace_id - b.pace_id);
  return sorted.map((row, idx) => ({
    paceNo: idx + 1,
    testScore: row.pace_percent ?? null,   // using pace_percent as the score field
    totalScore: 100,                        // default total; editable in the UI
    paceId: row.pace_id,
    enrollmentId: row.enrollment_id,
    pacesBehind: row.paces_behind,
  }));
}

function filterAssignedGrades(gradeLevels = [], teacher = null) {
  if (!teacher?.assignedGrades?.length) return gradeLevels;
  return gradeLevels.filter((gradeLevel) => teacher.assignedGrades.includes(gradeLevel.level));
}

function filterAssignedSections(sections = [], teacher = null) {
  if (!teacher?.assignedSections?.length) return sections;
  return sections.filter((section) => teacher.assignedSections.includes(section.name));
}

function filterAssignedSubjects(subjects = [], teacher = null) {
  if (!teacher?.assignedSubjects?.length) return subjects;
  return subjects.filter((subject) => teacher.assignedSubjects.includes(subject.subject_name));
}

function resolveTeacherSchoolYear(schoolYears = [], teacher = null) {
  if (!teacher?.schoolYearId) {
    return schoolYears.find((sy) => sy.is_current) || schoolYears[0] || null;
  }

  return schoolYears.find((sy) => String(sy.school_year_id) === String(teacher.schoolYearId))
    || schoolYears.find((sy) => sy.is_current)
    || schoolYears[0]
    || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export default function usePaceEncodingState(teacher = null) {
  // ── Reference data loaded from backend ───────────────────────────────────
  const [schoolYears, setSchoolYears]   = useState([]);
  const [gradeLevels, setGradeLevels]   = useState([]);
  const [sections, setSections]         = useState([]);
  const [subjects, setSubjects]         = useState([]);

  // ── Selected filters (IDs for API calls, display values for UI) ──────────
  const [filters, setFilters] = useState({
    schoolYearId: null,
    schoolYear: '',      // display label e.g. "2025-2026"
    gradeLevelId: null,
    gradeLevel: '',      // display label e.g. "Grade 10"
    sectionId: null,
    section: '',         // display label e.g. "Section A"
    subjectId: null,
    subject: '',         // display label e.g. "Math"
  });

  // ── Table data ────────────────────────────────────────────────────────────
  const [encodingData, setEncodingData] = useState([]);

  // ── Loading / error states ────────────────────────────────────────────────
  const [loading, setLoading]       = useState(false);
  const [loadingRef, setLoadingRef] = useState(false); // reference data
  const [error, setError]           = useState(null);

  // Debounce timer ref for score saves
  const saveTimers = useRef({});

  // ─────────────────────────────────────────────────────────────────────
  // 1. Boot: load school years and grade levels
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadReferenceData() {
      setLoadingRef(true);
      setError(null);
      try {
        const [syList, glList] = await Promise.all([
          schoolYearApi.list(),
          gradeLevelApi.list(),
        ]);

        const availableGradeLevels = filterAssignedGrades(glList, teacher);
        const defaultSy = resolveTeacherSchoolYear(syList, teacher);
        const defaultGl = availableGradeLevels[0] || null;

        setSchoolYears(syList);
        setGradeLevels(availableGradeLevels);

        let secList = [];
        let subjList = [];

        if (defaultGl) {
          const [sectionsResponse, subjectsResponse] = await Promise.all([
            sectionApi.list(defaultGl.grade_level_id),
            subjectApi.list(defaultGl.grade_level_id),
          ]);

          secList = filterAssignedSections(sectionsResponse, teacher);
          subjList = filterAssignedSubjects(subjectsResponse, teacher);
          // Deduplicate by subject_name
          const uniqueSubjList = subjList.reduce((acc, subject) => {
            if (!acc.find(s => s.subject_name === subject.subject_name)) {
              acc.push(subject);
            }
            return acc;
          }, []);

          setSections(secList);
          setSubjects(uniqueSubjList);  // Use the deduplicated list
          subjList = uniqueSubjList;  // Update subjList with deduplicated version
        }

        const defaultSec  = secList[0]  || null;
        const defaultSubj = subjList[0] || null;

        setFilters({
          schoolYearId: defaultSy?.school_year_id ?? null,
          schoolYear:   defaultSy?.year            ?? '',
          gradeLevelId: defaultGl?.grade_level_id  ?? null,
          gradeLevel:   defaultGl?.level            ?? '',
          sectionId:    defaultSec?.section_id      ?? null,
          section:      defaultSec?.name            ?? '',
          subjectId:    defaultSubj?.subject_id     ?? null,
          subject:      defaultSubj?.subject_name   ?? '',
        });
      } catch (err) {
        setError('Failed to load reference data: ' + err.message);
      } finally {
        setLoadingRef(false);
      }
    }

    loadReferenceData();
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // 2. When grade level changes → reload sections and subjects
  // ─────────────────────────────────────────────────────────────────────
  const handleGradeLevelChange = useCallback(async (gradeLevelId) => {
    const gl = gradeLevels.find((g) => g.grade_level_id === gradeLevelId);
    if (!gl) return;

    try {
      const [secList, subjList] = await Promise.all([
        sectionApi.list(gradeLevelId),
        subjectApi.list(gradeLevelId),
      ]);

      const scopedSections = filterAssignedSections(secList, teacher);
      const scopedSubjects = filterAssignedSubjects(subjList, teacher);

      setSections(scopedSections);
      setSubjects(scopedSubjects);

      const defaultSec  = scopedSections[0]  || null;
      const defaultSubj = scopedSubjects[0] || null;

      setFilters((prev) => ({
        ...prev,
        gradeLevelId,
        gradeLevel:  gl.level,
        sectionId:   defaultSec?.section_id    ?? null,
        section:     defaultSec?.name          ?? '',
        subjectId:   defaultSubj?.subject_id   ?? null,
        subject:     defaultSubj?.subject_name ?? '',
      }));
    } catch (err) {
      setError('Failed to load sections/subjects: ' + err.message);
    }
  }, [gradeLevels, teacher]);

  // ─────────────────────────────────────────────────────────────────────
  // 3. Generic filter updater (called by PaceFilter)
  // ─────────────────────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    if (key === 'schoolYear') {
      const sy = schoolYears.find((s) => s.year === value);
      setFilters((prev) => ({
        ...prev,
        schoolYear:   sy?.year             ?? value,
        schoolYearId: sy?.school_year_id   ?? null,
      }));
      return;
    }

    if (key === 'gradeLevel') {
      // value is either the display string or an ID — normalise
      const gl = gradeLevels.find(
        (g) => g.level === value || g.grade_level_id === value
      );
      if (gl) {
        handleGradeLevelChange(gl.grade_level_id);
      }
      return;
    }

    if (key === 'section') {
      const sec = sections.find((s) => s.name === value || s.section_id === value);
      setFilters((prev) => ({
        ...prev,
        section:   sec?.name       ?? value,
        sectionId: sec?.section_id ?? null,
      }));
      return;
    }

    if (key === 'subject') {
      const subj = subjects.find(
        (s) => s.subject_name === value || s.subject_id === value
      );
      setFilters((prev) => ({
        ...prev,
        subject:   subj?.subject_name ?? value,
        subjectId: subj?.subject_id   ?? null,
      }));
      return;
    }

    setFilters((prev) => ({ ...prev, [key]: value }));
  }, [schoolYears, gradeLevels, sections, subjects, handleGradeLevelChange]);

  // ─────────────────────────────────────────────────────────────────────
  // 4. Load students + PACE data when filters are fully set
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const { sectionId, schoolYearId, gradeLevelId, subject } = filters;
    if (!sectionId || !schoolYearId || !gradeLevelId || !subject) return;

    async function loadTableData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch enrollments for this section + school year + grade level
        const enrollments = await enrollmentApi.list({
          section_id:      sectionId,
          school_year_id:  schoolYearId,
          grade_level_id:  gradeLevelId,
        });

        if (enrollments.length === 0) {
          setEncodingData([]);
          return;
        }

        // Fetch all pace records for these enrollments (by enrollment_id)
        // We do it in parallel per enrollment to keep things fast
        const paceResults = await Promise.all(
          enrollments.map((enr) =>
            paceApi.list({ enrollment_id: enr.enrollment_id }).catch(() => [])
          )
        );

        // Build the table rows
        const rows = enrollments.map((enr, idx) => {
          const allPaces = paceResults[idx] || [];
          // Filter to the selected subject only
          const subjectPaces = allPaces.filter(
            (p) => p.subject === subject
          );

          return {
            studentId:    enr.student_id,
            enrollmentId: enr.enrollment_id,
            name:         `${enr.student?.last_name ?? ''}, ${enr.student?.first_name ?? ''}`.trim(),
            paceRecords:  toPaceRecords(subjectPaces),
          };
        });

        // Find the max pace count any student has — this is the "expected" column count
        const maxPaces = Math.max(...rows.map((r) => r.paceRecords.length), 0);

        // Backfill missing records for students who are behind
        if (maxPaces > 0) {
          const backfillResults = await Promise.all(
            rows.map(async (row) => {
              const missing = maxPaces - row.paceRecords.length;
              if (missing <= 0) return { studentId: row.studentId, newPaces: [] };

              const newPaces = [];
              for (let i = 0; i < missing; i++) {
                try {
                  const response = await paceApi.create({
                    student_id:    row.studentId,
                    enrollment_id: row.enrollmentId,
                    subject:       subject,
                    pace_percent:  0,
                    paces_behind:  0,
                  });
                  newPaces.push(response?.pace ?? response);
                } catch (err) {
                  console.error(`Backfill failed for student ${row.studentId}:`, err.message);
                }
              }
              return { studentId: row.studentId, newPaces };
            })
          );

          // Merge backfilled records into rows
          const backfillMap = {};
          backfillResults.forEach(({ studentId, newPaces }) => {
            backfillMap[studentId] = newPaces;
          });

          rows.forEach((row) => {
            const newPaces = backfillMap[row.studentId] ?? [];
            if (newPaces.length === 0) return;
            const addedRecords = newPaces.map((p, i) => ({
              paceNo:       row.paceRecords.length + i + 1,
              testScore:    0,
              totalScore:   100,
              paceId:       p.pace_id,
              enrollmentId: p.enrollment_id,
              pacesBehind:  0,
            }));
            row.paceRecords = [...row.paceRecords, ...addedRecords];
          });
        }

        setEncodingData(rows);
      } catch (err) {
        setError('Failed to load class data: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [filters.sectionId, filters.schoolYearId, filters.gradeLevelId, filters.subject]);

  // ─────────────────────────────────────────────────────────────────────
  // 5. Handle score change — debounced auto-save to backend
  // ─────────────────────────────────────────────────────────────────────
  const handleDataChange = useCallback((updatedData) => {
    setEncodingData(updatedData);

    // Persist each changed record after a short debounce
    updatedData.forEach((student) => {
      student.paceRecords.forEach((record) => {
        if (record.paceId == null) return; // not yet saved → created by handleAddPaceForCurrent

        const key = `${student.studentId}-${record.paceId}`;
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);

        saveTimers.current[key] = setTimeout(async () => {
          try {
            await paceApi.update(record.paceId, {
              pace_percent: record.testScore ?? 0,
              paces_behind: record.pacesBehind ?? 0,
            });
          } catch (err) {
            console.error('Auto-save failed for pace', record.paceId, err.message);
          }
        }, 800);
      });
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // 6. Add a new PACE column for the current class & subject
  // ─────────────────────────────────────────────────────────────────────
  const handleAddPaceForCurrent = useCallback(async () => {
    if (!encodingData || encodingData.length === 0) {
      alert('No students found in this class. Cannot add PACE record.');
      return;
    }

    const { subject } = filters;

    // The new column index = current max pace count across all students
    const currentMaxPaces = Math.max(
      ...encodingData.map((s) => s.paceRecords?.length ?? 0),
      0
    );
    const newPaceNo = currentMaxPaces + 1;

    setLoading(true);

    try {
      // For each student, create as many records as needed to reach newPaceNo
      // (students who are behind get caught up with gap records too)
      const results = await Promise.all(
        encodingData.map(async (student) => {
          const studentPaceCount = student.paceRecords?.length ?? 0;
          if (studentPaceCount >= newPaceNo) {
            // Already has a record at this index — skip
            return { studentId: student.studentId, newPaces: [] };
          }

          const missingCount = newPaceNo - studentPaceCount;
          const newPaces = [];

          for (let i = 0; i < missingCount; i++) {
            try {
              const response = await paceApi.create({
                student_id:    student.studentId,
                enrollment_id: student.enrollmentId,
                subject:       subject,
                pace_percent:  0,
                paces_behind:  0,
              });
              newPaces.push(response?.pace ?? response);
            } catch (err) {
              console.error(`Failed to create pace for student ${student.studentId}:`, err.message);
            }
          }

          return { studentId: student.studentId, newPaces };
        })
      );

      // Map results by studentId for quick lookup
      const resultMap = {};
      results.forEach(({ studentId, newPaces }) => {
        resultMap[studentId] = newPaces;
      });

      // Update local state
      setEncodingData((prev) =>
        prev.map((student) => {
          const newPaces = resultMap[student.studentId];
          if (!newPaces || newPaces.length === 0) return student;

          const existingRecords = student.paceRecords ?? [];
          const addedRecords = newPaces.map((newPace, i) => ({
            paceNo:       existingRecords.length + i + 1,
            testScore:    0,
            totalScore:   100,
            paceId:       newPace.pace_id,
            enrollmentId: newPace.enrollment_id,
            pacesBehind:  0,
          }));

          return {
            ...student,
            paceRecords: [...existingRecords, ...addedRecords],
          };
        })
      );
    } catch (err) {
      setError('Failed to add PACE record: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [encodingData, filters]);

  // ─────────────────────────────────────────────────────────────────────
  // Derived option lists for the filter dropdowns
  // ─────────────────────────────────────────────────────────────────────
  const scopedSchoolYear = resolveTeacherSchoolYear(schoolYears, teacher);
  const schoolYearOptions = teacher
    ? [scopedSchoolYear?.year].filter(Boolean)
    : schoolYears.map((sy) => sy.year);
  const gradeLevelOptions = gradeLevels.map((gl) => gl.level);
  const sectionOptions    = sections.map((s) => s.name);
  const subjectOptions    = [...new Set(subjects.map((s) => s.subject_name))];

  return {
    // filter state (display values for dropdowns)
    filters,
    updateFilter,

    // option lists for dropdowns
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
  };
}