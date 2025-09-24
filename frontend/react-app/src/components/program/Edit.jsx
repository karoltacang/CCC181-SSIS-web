import { useState, useEffect } from 'react';
import { programsAPI } from '../../services/api';
import '../Edit.css';

function EditProgramModal({ isOpen, onClose, program, onSuccess }) {
  const [formData, setFormData] = useState({
    program_code: '',
    program_name: '',
    college_code: ''
  });
  const [error, setError] = useState('');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await programsAPI.update(program.code, { program_name: formData.program_name, college_code: formData.college_code});
      if (response.status === 200) {
      onSuccess();
      onClose();
    } else {
      setError('Failed to update program');
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
          <h2>Edit Program</h2>
          <button className="edit-close" onClick={onClose}>&times;</button>
        </div>

        <div className="edit-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group inactive">
              <label>Program Code</label>
              <input
                type="text"
                name="program_code"
                value={formData.program_code}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Program Name *</label>
              <input
                type="text"
                name="program_name"
                value={formData.program_name}
                onChange={handleChange}
                required
              />
              <label>College Code *</label>
              <input
                type="text"
                name="college_code"
                value={formData.college_code}
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

export default EditProgramModal;