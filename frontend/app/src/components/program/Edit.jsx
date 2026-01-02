import { useState, useEffect } from 'react';
import { programsAPI } from '../../services/api';
import '../Components.css';

function EditProgramModal({ isOpen, onClose, program, onSuccess, colleges }) {
  const [formData, setFormData] = useState({
    program_code: '',
    program_name: '',
    college_code: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (program && isOpen) {
      setFormData({
        program_code: program.code || '',
        program_name: program.name || '',
        college_code: program.college || ''
      });
    }
  }, [program, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.program_code.trim()) newErrors.program_code = 'Program Code is required';
    if (!formData.college_code) newErrors.college_code = 'College is required';
    if (!formData.program_name.trim()) newErrors.program_name = 'Program Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      const response = await programsAPI.update(program.code, { program_code: formData.program_code, program_name: formData.program_name, college_code: formData.college_code});
      if (response.status === 200) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to update program');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('unique')) {
        setError('Program Code already exists.');
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
          <h2>Edit Program</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <div className="edit-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>Program Code</label>
                <input
                  type="text"
                  name="program_code"
                  className={errors.program_code ? 'input-error' : ''}
                  value={formData.program_code}
                  onChange={handleChange}
                />
                <span className="field-error">{errors.program_code || '\u00A0'}</span>
              </div>
              <div className="form-group">
                <label>College Code *</label>
                <select
                  name="college_code"
                  className={errors.college_code ? 'input-error' : ''}
                  value={formData.college_code}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <span className="field-error">{errors.college_code || '\u00A0'}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Program Name *</label>
              <input
                type="text"
                name="program_name"
                className={errors.program_name ? 'input-error' : ''}
                value={formData.program_name}
                onChange={handleChange}
                required
              />
              <span className="field-error">{errors.program_name || '\u00A0'}</span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default EditProgramModal;