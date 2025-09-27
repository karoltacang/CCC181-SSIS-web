import React from 'react';
import '../Components.css';

function DeleteModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="delete-overlay" onClick={onClose}>
      <div className="delete-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="delete-header">
          <h2>Confirm Deletion?</h2>
          <button className="delete-close" onClick={onClose}>&times;</button>
        </div>
        <div className="delete-body">
          <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
