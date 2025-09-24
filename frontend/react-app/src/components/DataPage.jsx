import { useState } from "react";
import "../App.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function DataPage({ 
  title, 
  data, 
  columns, 
  search, 
  onSearchChange, 
  onSearchSubmit,
  totalCount = 0,
  currentPage = 1,
  perPage = 10,
  onPageChange,
  onPerPageChange
}) {

  const [goToPage, setGoToPage] = useState("");
  
  const totalPages = Math.ceil(totalCount / perPage);
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(currentPage * perPage, totalCount);

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      if (onPageChange) {
        onPageChange(pageNum);
      }
      setGoToPage("");
    }
  };

  const handlePerPageSelect = (e) => {
    const value = Number(e.target.value);
    if (onPerPageChange) {
      onPerPageChange(value);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="data-page">
      {/* Header */}
      <div className="header-row">
        <h1 className="title">{title}</h1>
        <div className="action-buttons">
          <button className="btn btn-outline">Export</button>
          <button className="btn btn-primary">+ Add new {title.toLowerCase().slice(0, -1)}</button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="search-sort">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}`}
          className="search-bar" value={search}
          onChange={onSearchChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearchSubmit();
            }
          }}
        />
        <button className="btn btn-outline sort-btn">Sort</button>
      </div>

      {/* Results count (remove later)*/}
      <div className="results-info">
        Showing {startIndex} to {endIndex} of {totalCount} results
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              {/* For the actions */}
              <th> Actions </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col}>{item[col.toLowerCase().replace(/\s/g, "")]}</td>
                ))}
                {/* Action buttons */}
                <td className="actions-cell">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => onEdit(item)}
                  >
                    <FaEdit />
                  </button>

                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => onDelete(item)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="per-page">
          <p> Show </p>
          <select value={perPage} onChange={handlePerPageSelect} >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <p> per page </p>
        </div>
        
        <div className="navigation">
          <button 
            className="btn" 
            disabled={currentPage === 1} 
            onClick={handlePrevPage}
          >
            Prev
          </button>
          <span className="page-number">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn" 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={handleNextPage}
          >
            Next
          </button>
          <p>Go to</p>
          <input 
            type="number"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGoToPage();
              }
            }}
            placeholder="Page"
            min="1"
            max={totalPages}
            style={{ width: '60px' }}
          />
          <button 
            className="btn btn-sm" 
            onClick={handleGoToPage}
            disabled={!goToPage}
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}