import { useState, useEffect } from 'react';
import { studentsAPI } from '../../services/api';
import '../Edit.css';

function EditStudentModal({ isOpen, onClose, student, onSuccess }) {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    program_code: '',
    year_level: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        student_id: student.id || '',
        first_name: student.firstname || '',
        last_name: student.lastname || '',
        program_code: student.program || '',
        year_level: student.year || '',
        gender: student.gender || '',
      });
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await studentsAPI.update(student.id, { first_name: formData.first_name, last_name: formData.last_name, program_code: formData.program_code, year_level: formData.year_level, gender: formData.gender});
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
          <h2>Edit Student</h2>
          <button className="edit-close" onClick={onClose}>&times;</button>
        </div>

        <div className="edit-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group inactive">
              <label>Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                disabled
              />
            </div>

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <label>Program *</label>
              <input
                type="text"
                name="program_code"
                value={formData.program_code}
                onChange={handleChange}
                required
              />
              <label>Year Level *</label>
              <input
                type="text"
                name="year_level"
                value={formData.year_level}
                onChange={handleChange}
                required
              />
              <label>Gender *</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
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

export default EditStudentModal;