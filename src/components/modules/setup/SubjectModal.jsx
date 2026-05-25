import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../../../styles/setup/SetupModal.css';

const SubjectModal = ({ isOpen, onClose, onSave, editingItem, gradeLevels = [] }) => {
  const [formData, setFormData] = useState({ grade_level_id: '', subject_name: '', subject_code: '', is_active: true });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          grade_level_id: editingItem.grade_level_id,
          subject_name: editingItem.subject_name,
          subject_code: editingItem.subject_code,
          is_active: editingItem.is_active,
        });
      } else {
        setFormData({ grade_level_id: '', subject_name: '', subject_code: '', is_active: true });
      }
      setErrors({});
    }
  }, [isOpen, editingItem]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.grade_level_id) newErrors.grade_level_id = 'Please select a grade level';
    if (!formData.subject_name.trim()) newErrors.subject_name = 'Subject name is required';
    if (!formData.subject_code.trim()) newErrors.subject_code = 'Subject code is required (e.g., MATH101)';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        grade_level_id: Number(formData.grade_level_id),
        subject_name: formData.subject_name.trim(),
        subject_code: formData.subject_code.trim(),
        is_active: formData.is_active,
      });
    } catch (err) {
      const errorMsg = err.message;
      if (errorMsg.includes('subject code')) {
        setErrors({ subject_code: 'Subject code must be unique' });
      } else {
        alert(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="setup-modal-overlay" onClick={onClose}>
      <div className="setup-modal-content" onClick={e => e.stopPropagation()}>
        <div className="setup-modal-header">
          <h3>{editingItem ? 'Edit Subject' : 'Add Subject'}</h3>
          <button className="setup-modal-close" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="setup-modal-form">
          <div className="setup-form-section">
            <h4 className="setup-form-section-title">Subject Information</h4>

            <div className="setup-form-group">
              <label>Grade Level <span className="required">*</span></label>
              <select
                name="grade_level_id"
                value={formData.grade_level_id}
                onChange={handleChange}
                className={errors.grade_level_id ? 'error' : ''}
                disabled={saving}
              >
                <option value="">-- Select Grade Level --</option>
                {gradeLevels.map(gl => (
                  <option key={gl.grade_level_id} value={gl.grade_level_id}>
                    {gl.name}
                  </option>
                ))}
              </select>
              {errors.grade_level_id && <span className="setup-error-text">{errors.grade_level_id}</span>}
              <span className="setup-field-hint">
                Choose which grade level this subject is assigned to.
              </span>
            </div>

            <div className="setup-form-group">
              <label>Subject Name <span className="required">*</span></label>
              <input
                type="text"
                name="subject_name"
                value={formData.subject_name}
                onChange={handleChange}
                placeholder="e.g., Mathematics"
                className={errors.subject_name ? 'error' : ''}
                disabled={saving}
              />
              {errors.subject_name && <span className="setup-error-text">{errors.subject_name}</span>}
            </div>

            <div className="setup-form-group">
              <label>Subject Code <span className="required">*</span></label>
              <input
                type="text"
                name="subject_code"
                value={formData.subject_code}
                onChange={handleChange}
                placeholder="e.g., MATH101"
                className={errors.subject_code ? 'error' : ''}
                disabled={saving}
              />
              {errors.subject_code && <span className="setup-error-text">{errors.subject_code}</span>}
              <span className="setup-field-hint">Must be unique. Max 50 characters.</span>
            </div>

            <div className="setup-form-checkbox" style={{ marginTop: '16px' }}>
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={saving}
              />
              <label htmlFor="is_active">Mark as active</label>
            </div>
          </div>

          <div className="setup-modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Saving...' : editingItem ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;