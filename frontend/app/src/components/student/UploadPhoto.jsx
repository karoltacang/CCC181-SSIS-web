import { useState } from 'react';
import { studentsAPI } from '../../services/api';
import '../Components.css';

const UploadPhotoModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Invalid file type. Only images are allowed.');
      setFile(null);
      e.target.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await studentsAPI.uploadPhoto(student.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Upload failed');
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
            <div className="form-group file-input-wrapper">
              <label htmlFor="file-upload" className="custom-file-upload">
                {file ? file.name : "Click to Choose Image"}
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
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
