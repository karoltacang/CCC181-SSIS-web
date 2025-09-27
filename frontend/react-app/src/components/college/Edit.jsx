import { useState, useEffect } from 'react';
import { collegesAPI } from '../../services/api';
import '../Components.css';

function EditCollegeModal({ isOpen, onClose, college, onSuccess }) {
  const [formData, setFormData] = useState({
    college_code: '',
    college_name: ''
  });
  const [error, setError] = useState('');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await collegesAPI.update(college.code, { college_name: formData.college_name });
      if (response.status === 200) {
      onSuccess();
      onClose();
    } else {
      setError('Failed to update college');
    }
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.error || err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-header">
          <h2>Edit College</h2>
          <button className="edit-close" onClick={onClose}>&times;</button>
        </div>

        <div className="edit-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group inactive">
              <label>College Code</label>
              <input
                type="text"
                name="college_code"
                value={formData.college_code}
                disabled
              />
            </div>

            <div className="form-group">
              <label>College Name *</label>
              <input
                type="text"
                name="college_name"
                value={formData.college_name}
                onChange={handleChange}
                required
              />
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