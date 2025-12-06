import React from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from 'react-icons/fa';

const Table = ({ columns, data, onSort, sortConfig, onEdit, onDelete }) => {
  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="sort-icon muted" />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />;
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                onClick={() => col.sortable ? onSort(col.key) : null}
                className={col.sortable ? 'sortable-header' : ''}
              >
                <div className="th-content">
                  {col.label}
                  {col.sortable && getSortIcon(col.key)}
                </div>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>{row[col.key]}</td>
                ))}
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => onEdit(row)}>
                    <FaEdit />
                  </button>
                  <button className="delete-btn" onClick={() => onDelete(row)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px' }}>No data found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;