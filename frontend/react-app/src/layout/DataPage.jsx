import { useState } from "react";
import "../App.css";

export default function DataPage({ title, data, columns }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

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
          onChange={(e) => setSearch(e.target.value)}
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
            {filteredData.map((item, index) => (
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
        <button className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span className="page-number">{page}</span>
        <button className="btn" onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
