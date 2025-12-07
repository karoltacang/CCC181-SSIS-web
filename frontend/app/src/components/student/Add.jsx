import { useState } from 'react';
import { studentsAPI } from '../../services/api';
import '../Components.css';

function AddStudentModal({ isOpen, onClose, onSuccess, programs }) {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    program_code: '',
    year_level: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.student_id.trim()) newErrors.student_id = 'Student ID is required';
    if (!formData.year_level) newErrors.year_level = 'Year Level is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First Name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last Name is required';
    if (!formData.program_code) newErrors.program_code = 'Program is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      const response = await studentsAPI.create(formData);
      if (response.status === 201) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to add student');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('unique')) {
        setError('Student ID already exists.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="content" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <h2>Add Student</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <div className="add-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>Student ID *</label>
                <input
                  type="text"
                  name="student_id"
                  className={errors.student_id ? 'input-error' : ''}
                  value={formData.student_id}
                  onChange={handleChange}
                />
                <span className="field-error">{errors.student_id || '\u00A0'}</span>
              </div>
              <div className="form-group">
                <label>Year Level *</label>
                <select
                  name="year_level"
                  className={errors.year_level ? 'input-error' : ''}
                  value={formData.year_level}
                  onChange={handleChange}
                >
                  <option value="">Select Year Level</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <span className="field-error">{errors.year_level || '\u00A0'}</span>
              </div>
            </div>

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                className={errors.first_name ? 'input-error' : ''}
                value={formData.first_name}
                onChange={handleChange}
              />
              <span className="field-error">{errors.first_name || '\u00A0'}</span>
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                className={errors.last_name ? 'input-error' : ''}
                value={formData.last_name}
                onChange={handleChange}
              />
              <span className="field-error">{errors.last_name || '\u00A0'}</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Program *</label>
                <select
                  name="program_code"
                  className={errors.program_code ? 'input-error' : ''}
                  value={formData.program_code}
                  onChange={handleChange}
                >
                  <option value="">Select Program</option>
                  {programs.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
                <span className="field-error">{errors.program_code || '\u00A0'}</span>
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  className={errors.gender ? 'input-error' : ''}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="field-error">{errors.gender || '\u00A0'}</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Adding..." : "Add Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStudentModal;
