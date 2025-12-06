import { useState, useEffect } from "react";
import EditCollegeModal from "../components/college/Edit";
import AddCollegeModal from "../components/college/Add";
import DeleteModal from "../components/global/Delete";
import Table from "../components/global/Table";
import { collegesAPI } from "../services/api";
import "../App.css";

const collegeColumns = [
  { label: "Code", key: "code", sortable: true },
  { label: "Name", key: "name", sortable: true }
];

export default function Colleges() {
  const [collegeData, setCollegeData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [editItem, setEditItem] = useState((null));
  const [deleteItem, setDeleteItem] = useState(null);
  const [goToPage, setGoToPage] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });

  const clearCollegeCache = () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('colleges_')) {
        sessionStorage.removeItem(key);
      }
    });
    // Also clear the list used by Programs page
    sessionStorage.removeItem('colleges_list');
  };

  useEffect(() => {
    fetchColleges(); // Fetch all colleges on initial render
  }, [currentPage, perPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchColleges(search.trim());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (perPage) => {
    setPerPage(perPage);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    fetchColleges(search.trim(), false, key, direction);
  };

  const fetchColleges = async (searchTerm = search.trim(), background = false, sortBy = sortConfig.key, order = sortConfig.direction) => {
    try {
      if (!background) setLoading(true);
      
      const keyMap = { 'code': 'college_code', 'name': 'college_name' };
      const backendSortBy = keyMap[sortBy] || sortBy;

      const cacheKey = `colleges_${currentPage}_${perPage}_${searchTerm}_${backendSortBy}_${order}`;
      let data, total;

      const cached = sessionStorage.getItem(cacheKey);
      if (cached && !background) {
        const parsed = JSON.parse(cached);
        data = parsed.data;
        total = parsed.total;
      } else {
        const params = {
          page: currentPage,
          per_page: perPage
        }
  
        if (searchTerm) {
          params.search = searchTerm
        }
        params.sort_by = backendSortBy;
        params.order = order;
  
        const response = await collegesAPI.getAll(params);
        data = response.data.data;
        total = response.data.total;
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, total }));
      }

      const formattedData = data.map(college => ({
        code: college.college_code,
        name: college.college_name
      }));

      setCollegeData(formattedData);
      setTotalCount(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
  }

  const handleEditSuccess = () => {
    setEditItem(null);
    clearCollegeCache();
    fetchColleges(undefined, true);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await collegesAPI.delete(deleteItem.code);
      clearCollegeCache();
      setDeleteItem(null);
      fetchColleges(undefined, true);
    } catch (err) {
      console.error("Error deleting college:", err);
      setError("Failed to delete college");
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalCount / perPage);
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(currentPage * perPage, totalCount);

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="data-page">
        {/* Header */}
        <div className="header-row">
          <h1 className="title">Colleges</h1>
        </div>

        {/* Functions */}
        <div className="functions">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search colleges"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <span className="results-info">{totalCount} Results</span>
          </div>
          <div className="right-side">
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>+ Add new college</button>
            </div>
            <div className="per-page">
              <p> Show </p>
              <select value={perPage} onChange={(e) => handlePerPageChange(Number(e.target.value))}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <p> per page </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper colleges-table">
          {loading && (
            <div className="loading-overlay">
              Loading...
            </div>
          )}
          <Table
            columns={collegeColumns}
            data={collegeData}
            onSort={handleSort}
            sortConfig={sortConfig}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="navigation">
            <button className="btn" disabled={currentPage === 1} onClick={handlePrevPage}>Prev</button>
            <span className="page-number">Page {currentPage} of {totalPages}</span>
            <button className="btn" disabled={currentPage === totalPages || totalPages === 0} onClick={handleNextPage}>Next</button>
            <p>Go to</p>
            <input type="number" value={goToPage} onChange={(e) => setGoToPage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()} placeholder="Page" min="1" max={totalPages} style={{ width: '60px' }} />
            <button className="btn btn-sm" onClick={handleGoToPage} disabled={!goToPage}>Go</button>
          </div>
        </div>
      </div>

      {editItem && (
        <EditCollegeModal
          isOpen={true}
          college={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deleteItem && (
        <DeleteModal
          isOpen={true}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDeleteConfirm}
          itemName={`${deleteItem.code} - ${deleteItem.name}`}
        />
      )}

      {addModalOpen && (
        <AddCollegeModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => { clearCollegeCache(); fetchColleges(undefined, true); }}
        />
      )}
    </>
  );
}