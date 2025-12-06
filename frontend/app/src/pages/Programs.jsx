import { useState, useEffect } from "react";
import EditProgramModal from "../components/program/Edit";
import AddProgramModal from "../components/program/Add";
import DeleteModal from "../components/global/Delete";
import Table from "../components/global/Table";
import { programsAPI, collegesAPI } from "../services/api";
import "../App.css";

const programColumns = [
  { label: "Code", key: "code", sortable: true },
  { label: "Name", key: "name", sortable: true },
  { label: "College", key: "college", sortable: true }
];

export default function Programs() {
  const [programData, setProgramData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [ totalCount, setTotalCount] = useState(0);
  const [editItem, setEditItem] = useState((null));
  const [deleteItem, setDeleteItem] = useState(null);
  const [goToPage, setGoToPage] = useState("");
  const [collegesList, setCollegesList] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });

  const clearProgramCache = () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('programs_')) {
        sessionStorage.removeItem(key);
      }
    });
    // Also clear the list used by Students page
    sessionStorage.removeItem('programs_list');
  };

  useEffect(() => {
    fetchPrograms(); // Fetch programs on initial render
  }, [currentPage, perPage]);

  useEffect(() => {
    const fetchCollegesList = async () => {
      const cached = sessionStorage.getItem('colleges_list');
      if (cached) {
        setCollegesList(JSON.parse(cached));
        return;
      }
      try {
        const response = await collegesAPI.getAll({ per_page: 1000, only_codes: true });
        const data = response.data.data || [];
        setCollegesList(data);
        sessionStorage.setItem('colleges_list', JSON.stringify(data));
      } catch (err) {
        console.error("Failed to pre-fetch colleges:", err);
      }
    };
    fetchCollegesList();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchPrograms(search.trim());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (perPage) => {
    setPerPage(perPage);
    setCurrentPage(1);
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    fetchPrograms(search.trim(), false, key, direction);
  };

  const fetchPrograms = async (searchTerm = search.trim(), background = false, sortBy = sortConfig.key, order = sortConfig.direction) => {
    try {
      if (!background) setLoading(true);
      
      const keyMap = { 'code': 'program_code', 'name': 'program_name', 'college': 'college_code' };
      const backendSortBy = keyMap[sortBy] || sortBy;

      const cacheKey = `programs_${currentPage}_${perPage}_${searchTerm}_${backendSortBy}_${order}`;
      let data, total;

      const cached = sessionStorage.getItem(cacheKey);
      if (cached && !background) {
        const parsed = JSON.parse(cached);
        data = parsed.data;
        total = parsed.total;
      } else {
        const params = {
          page: currentPage,
          per_page: perPage,
        }
  
        if (searchTerm) {
          params.search = searchTerm;
        }
        params.sort_by = backendSortBy;
        params.order = order;
  
        const response = await programsAPI.getAll(params);
        data = response.data.data;
        total = response.data.total;
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, total }));
      }

      const formattedData = data.map(program => ({
        code: program.program_code,
        name: program.program_name,
        college: program.college_code
      }));

      setProgramData(formattedData);
      setTotalCount(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
  }

  const handleEditSuccess = () => {
    setEditItem(null);
    clearProgramCache();
    fetchPrograms(undefined, true);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await programsAPI.delete(deleteItem.code);
      clearProgramCache();
      setDeleteItem(null);
      fetchPrograms(undefined, true);
    } catch (err) {
      console.error("Error deleting program:", err);
      setError("Failed to delete program");
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
          <h1 className="title">Programs</h1>
        </div>

        {/* Functions */}
        <div className="functions">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search programs"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <span className="results-info">{totalCount} Results</span>
          </div>
          <div className="right-side">
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>+ Add new program</button>
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
        <div className="table-wrapper programs-table">
          {loading && (
            <div className="loading-overlay">
              Loading...
            </div>
          )}
          <Table
            columns={programColumns}
            data={programData}
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
        <EditProgramModal
          isOpen={true}
          program={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleEditSuccess}
          colleges={collegesList}
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
        <AddProgramModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => { clearProgramCache(); fetchPrograms(undefined, true); }}
          colleges={collegesList}
        />
      )}
    </>
  );
}