import { useState } from "react";
import "../App.css";

export default function DataPage({ title, data, columns, search, onSearchChange, onSearchSubmit }) {
  const [page, setPage] = useState(1);

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

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col}>{item[col.toLowerCase().replace(/\s/g, "")]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="per-page">
          <p> Show </p>
          <select
      
          >
            {/*value={perPage}*/}
            {/*onChange={(e) => setPerPage(Number(e.target.value))}*/}
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <p> per page </p>
        </div>
        
        <div className="navigation">
          <button className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span className="page-number">{page}</span>
          <button className="btn" onClick={() => setPage(page + 1)}>
            Next
        </button>
        </div>
      </div>
    </div>
  );
}
