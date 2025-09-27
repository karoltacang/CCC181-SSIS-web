import { useState, useEffect } from "react";
import EditCollegeModal from "../components/college/Edit";
import AddCollegeModal from "../components/college/Add";
import DeleteModal from "../components/global/Delete";
import { collegesAPI } from "../services/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

const collegeColumns = ["Code", "Name"];

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

  const fetchColleges = async (searchTerm = search.trim()) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await collegesAPI.getAll(params);

      const formattedData = response.data.data.map(college => ({
        code: college.college_code,
        name: college.college_name
      }));

      setCollegeData(formattedData);
      setTotalCount(response.data.total);
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
    fetchColleges();
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await collegesAPI.delete(deleteItem.code);
      setDeleteItem(null);
      fetchColleges();
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

  if (loading) return <div>Loading colleges...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="data-page">
        {/* Header */}
        <div className="header-row">
          <h1 className="title">Colleges</h1>
          <div className="action-buttons">
            <button className="btn btn-outline">Export</button>
            <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>+ Add new college</button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search colleges"
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
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {collegeColumns.map((col) => <th key={col}>{col}</th>)}
                <th> Actions </th>
              </tr>
            </thead>
            <tbody>
              {collegeData.map((item, index) => (
                <tr key={index}>
                  {collegeColumns.map((col) => (
                    <td key={col}>{item[col.toLowerCase().replace(/\s/g, "")]}</td>
                  ))}
                  <td className="actions-cell">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(item)}><FaEdit /></button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(item)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
          onSuccess={fetchColleges}
        />
      )}
    </>
  );
}