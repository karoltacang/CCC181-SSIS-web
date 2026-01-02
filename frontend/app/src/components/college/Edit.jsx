import { useState, useEffect } from 'react';
import { collegesAPI } from '../../services/api';
import '../Components.css';

function EditCollegeModal({ isOpen, onClose, college, onSuccess }) {
  const [formData, setFormData] = useState({
    college_code: '',
    college_name: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (college && isOpen) {
      setFormData({
        college_code: college.code || '',
        college_name: college.name || ''
      });
    }
  }, [college, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.college_code.trim()) newErrors.college_code = 'College Code is required';
    if (!formData.college_name.trim()) newErrors.college_name = 'College Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      const response = await collegesAPI.update(college.code, { college_code: formData.college_code, college_name: formData.college_name });
      if (response.status === 200) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to update college');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('unique')) {
        setError('College Code already exists.');
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
          <h2>Edit College</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <div className="edit-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>College Code</label>
              <input
                type="text"
                name="college_code"
                className={errors.college_code ? 'input-error' : ''}
                value={formData.college_code}
                onChange={handleChange}
              />
              <span className="field-error">{errors.college_code || '\u00A0'}</span>
            </div>

            <div className="form-group">
              <label>College Name *</label>
              <input
                type="text"
                name="college_name"
                className={errors.college_name ? 'input-error' : ''}
                value={formData.college_name}
                onChange={handleChange}
                required
              />
              <span className="field-error">{errors.college_name || '\u00A0'}</span>
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

export default EditCollegeModal;