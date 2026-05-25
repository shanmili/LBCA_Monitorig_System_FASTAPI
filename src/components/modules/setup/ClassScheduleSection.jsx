import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Plus, Pencil, Trash2, Save, X as XIcon } from 'lucide-react';
import { classScheduleApi } from '../../../services/api.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const ScheduleRow = ({ subject, schedules, onSave, onDelete, teachers, saving, schoolYearId, sectionId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:00',
    room: '',
    teacher_id: '',
  });

  const timeSlots = [];
  for (let hour = 7; hour <= 17; hour++) {
    for (let minute of ['00', '30']) {
      const time = `${hour.toString().padStart(2, '0')}:${minute}`;
      timeSlots.push(time);
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      room: schedule.room,
      teacher_id: schedule.teacher_id,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.room.trim()) {
      alert('Please enter a room');
      return;
    }
    if (!formData.teacher_id) {
      alert('Please select a teacher');
      return;
    }
    if (formData.end_time <= formData.start_time) {
      alert('End time must be after start time');
      return;
    }

    await onSave({
      schedule_id: editingSchedule?.id || null,
      subject_id: subject.subject_id,
      section_id: sectionId,
      school_year_id: schoolYearId,
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      room: formData.room,
      teacher_id: formData.teacher_id,
    }, editingSchedule?.id ? 'update' : 'create');

    setShowAddForm(false);
    setEditingSchedule(null);
    setFormData({
      day_of_week: 'Monday',
      start_time: '08:00',
      end_time: '09:00',
      room: '',
      teacher_id: '',
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingSchedule(null);
    setFormData({
      day_of_week: 'Monday',
      start_time: '08:00',
      end_time: '09:00',
      room: '',
      teacher_id: '',
    });
  };

  return (
    <div className="us-schedule-group" style={{
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '8px'
    }}>
      {/* Subject Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-secondary)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{subject.subject_name}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({subject.subject_code})</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={saving}
          className="us-inline-add-btn"
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          <Plus size={14} /> Add Schedule
        </button>
      </div>

      {/* Existing Schedules */}
      {schedules.map(schedule => (
        <div key={schedule.id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          paddingLeft: '32px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="setup-badge setup-badge-active" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {schedule.day_of_week}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{schedule.start_time} - {schedule.end_time}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Room: {schedule.room}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Teacher: {schedule.teacher_name || 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleEdit(schedule)}
              disabled={saving}
              className="setup-action-btn edit"
              style={{ color: 'var(--primary)' }}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(schedule.id)}
              disabled={saving}
              className="setup-action-btn delete"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--warning-bg)',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <select
              value={formData.day_of_week}
              onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value }))}
              className="setup-filter-select"
              style={{ minWidth: '100px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
            </select>

            <select
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              className="setup-filter-select"
              style={{ minWidth: '80px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
            </select>

            <span style={{ color: 'var(--text-primary)' }}>to</span>

            <select
              value={formData.end_time}
              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              className="setup-filter-select"
              style={{ minWidth: '80px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              {timeSlots.map(time => {
                if (time > formData.start_time) {
                  return <option key={time} value={time}>{time}</option>;
                }
                return null;
              }).filter(Boolean)}
            </select>

            <input
              type="text"
              placeholder="Room"
              value={formData.room}
              onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
              className="setup-filter-select"
              style={{ width: '100px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />

            <select
              value={formData.teacher_id}
              onChange={(e) => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
              className="setup-filter-select"
              style={{ minWidth: '150px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="submit-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Save size={14} /> {editingSchedule ? 'Update' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ClassScheduleSection = ({ 
  gradeLevels, 
  sections, 
  subjects, 
  teachers, 
  schoolYears,
  scheduleExpanded,
  setScheduleExpanded,
  schedules,
  scheduleLoading,
  scheduleError,
  fetchSchedules,
  saving,
  setSaving
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [subjectSchedules, setSubjectSchedules] = useState({});

  useEffect(() => {
    // Group schedules by subject
    const grouped = {};
    schedules.forEach(schedule => {
      if (!grouped[schedule.subject_id]) grouped[schedule.subject_id] = [];
      grouped[schedule.subject_id].push(schedule);
    });
    setSubjectSchedules(grouped);
  }, [schedules]);

  // Filter subjects when grade/section changes
  useEffect(() => {
    if (selectedSectionId) {
      const section = sections.find(s => s.section_id === parseInt(selectedSectionId));
      if (section) {
        const gradeSubjects = subjects.filter(s => s.grade_level_id === section.grade_level);
        setFilteredSubjects(gradeSubjects);
      } else {
        setFilteredSubjects([]);
      }
    } else if (selectedGradeId) {
      const gradeSubjects = subjects.filter(s => s.grade_level_id === parseInt(selectedGradeId));
      setFilteredSubjects(gradeSubjects);
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedGradeId, selectedSectionId, subjects, sections]);

  const currentSchoolYear = schoolYears.find(sy => sy.is_current);
  const currentSchoolYearId = currentSchoolYear?.school_year_id || (schoolYears[0]?.school_year_id);

  const availableSections = selectedGradeId 
    ? sections.filter(s => s.grade_level === parseInt(selectedGradeId))
    : sections;

  const handleGradeChange = (gradeId) => {
    setSelectedGradeId(gradeId);
    setSelectedSectionId('');
  };

  const handleSaveSchedule = async (data, action) => {
    setSaving(true);
    try {
      if (action === 'update') {
        await classScheduleApi.update(data.schedule_id, {
          school_year_id: data.school_year_id,
          section_id: data.section_id,
          subject_id: data.subject_id,
          teacher_id: data.teacher_id,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          room: data.room,
        });
      } else {
        await classScheduleApi.create({
          school_year_id: data.school_year_id,
          section_id: data.section_id,
          subject_id: data.subject_id,
          teacher_id: data.teacher_id,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          room: data.room,
        });
      }
      await fetchSchedules();
    } catch (err) {
      alert(`Failed to save schedule: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this schedule?')) return;
    setSaving(true);
    try {
      await classScheduleApi.delete(scheduleId);
      await fetchSchedules();
    } catch (err) {
      alert(`Failed to delete schedule: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="us-card">
      <div className="us-card-header" onClick={() => setScheduleExpanded(v => !v)}>
        <div className="us-card-title">
          <Calendar size={18} />
          <span>Class Schedules</span>
          <span className="us-count-badge">Schedule Matrix</span>
        </div>
        <div className="us-card-actions" onClick={e => e.stopPropagation()}>
          <button className="us-chevron-btn">
            {scheduleExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {scheduleExpanded && (
        <div className="us-card-body">
          {/* Filters */}
          <div className="setup-form-grid" style={{ marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: 'var(--text-muted)' }}>Grade Level</label>
              <select 
                value={selectedGradeId} 
                onChange={(e) => handleGradeChange(e.target.value)}
                className="setup-filter-select"
                style={{ width: '100%' }}
              >
                <option value="">-- Select Grade Level --</option>
                {gradeLevels.map(gl => (
                  <option key={gl.grade_level_id} value={gl.grade_level_id}>{gl.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: 'var(--text-muted)' }}>Section</label>
              <select 
                value={selectedSectionId} 
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="setup-filter-select"
                style={{ width: '100%' }}
                disabled={!selectedGradeId}
              >
                <option value="">-- Select Section --</option>
                {availableSections.map(section => (
                  <option key={section.section_id} value={section.section_id}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Matrix Table */}
          {selectedSectionId && currentSchoolYearId && (
            <>
              {scheduleLoading ? (
                <p className="us-empty-hint">Loading schedules…</p>
              ) : filteredSubjects.length === 0 ? (
                <p className="us-empty-hint">No subjects found for this grade level. Please add subjects first.</p>
              ) : (
                <div className="setup-table-card">
                  <div className="setup-table">
                    <div className="setup-table-header" style={{
                      display: 'grid',
                      background: 'var(--bg-secondary)',
                      padding: '12px 16px',
                      fontWeight: 600,
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <div>Subjects</div>
                    </div>
                    
                    {filteredSubjects.map(subject => {
                      const subjectScheds = subjectSchedules[subject.subject_id] || [];
                      const sectionSchedules = subjectScheds.filter(s => s.section_id === parseInt(selectedSectionId));
                      
                      return (
                        <ScheduleRow
                          key={subject.subject_id}
                          subject={subject}
                          schedules={sectionSchedules}
                          onSave={handleSaveSchedule}
                          onDelete={handleDeleteSchedule}
                          teachers={teachers}
                          saving={saving}
                          schoolYearId={currentSchoolYearId}
                          sectionId={parseInt(selectedSectionId)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
          
          {!selectedGradeId && (
            <p className="us-empty-hint">Select a grade level and section to configure schedules</p>
          )}
          {selectedGradeId && !selectedSectionId && (
            <p className="us-empty-hint">Select a section to configure schedules</p>
          )}
          {!currentSchoolYearId && (
            <p className="us-empty-hint">Please add a school year first</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassScheduleSection;