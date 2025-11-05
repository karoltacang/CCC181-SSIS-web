import { useState } from 'react';
import '../Components.css';

const UploadPhotoModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/students/${student.id}/photo`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="content">
        <div className="header">
          <h2>Upload Photo for {student.firstname}</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <div className="add-body">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
