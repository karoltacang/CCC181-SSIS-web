import { useState, useEffect } from "react";
import EditProgramModal from "../components/program/Edit";
import AddProgramModal from "../components/program/Add";
import DeleteModal from "../components/global/Delete";
import Table from "../components/global/Table";
import { programsAPI, collegesAPI } from "../services/api";
import "../App.css";

const programColumns = ["Code", "Name", "College"];

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

  useEffect(() => {
    fetchPrograms(); // Fetch programs on initial render
  }, [currentPage, perPage]);

  useEffect(() => {
    const fetchCollegesList = async () => {
      try {
        const response = await collegesAPI.getAll({ per_page: 1000, only_codes: true });
        setCollegesList(response.data.data || []);
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

  const fetchPrograms = async (searchTerm = search.trim(), background = false) => {
    try {
      if (!background) setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await programsAPI.getAll(params);

      const formattedData = response.data.data.map(program => ({
        code: program.program_code,
        name: program.program_name,
        college: program.college_code
      }));

      console.log(formattedData);
      setProgramData(formattedData);
      setTotalCount(response.data.total);
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
    fetchPrograms(undefined, true);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await programsAPI.delete(deleteItem.code);
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
          <div className="action-buttons">
            <button className="btn btn-outline">Export</button>
            <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>+ Add new program</button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search programs"
            className="search-bar"
            value={search}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          <div className="right-side">
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
            <button className="btn btn-outline sort-btn">Sort</button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={programColumns}
          data={programData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="pagination">
          <div className="results-info">
            Showing {startIndex} to {endIndex} of {totalCount} results
          </div>
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
          onSuccess={() => fetchPrograms(undefined, true)}
          colleges={collegesList}
        />
      )}
    </>
  );
}