import { useState, useEffect } from "react";
import { studentsAPI, programsAPI } from "../services/api";
import EditStudentModal from "../components/student/Edit";
import DeleteModal from "../components/global/Delete";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

const studentColumns = ["ID", "First Name", "Last Name", "Program", "Year", "Gender"];

export default function Students() {
  const [studentData, setStudentData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [goToPage, setGoToPage] = useState("");
  const [programsList, setProgramsList] = useState([]);

  useEffect(() => {
    fetchStudents(); // Fetch all students on initial render
  }, [currentPage, perPage]);

  useEffect(() => {
    const fetchProgramsList = async () => {
      try {
        const response = await programsAPI.getAll({ per_page: 1000, only_codes: true });
        setProgramsList(response.data.data || []);
      } catch (err) {
        console.error("Failed to pre-fetch programs:", err);
      }
    };
    fetchProgramsList();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchStudents(search.trim());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (perPage) => {
    setPerPage(perPage);
    setCurrentPage(1);
  };

  const fetchStudents = async (searchTerm = search.trim()) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await studentsAPI.getAll(params);

      console.log("RESPONSE DATA:", response.data);
      const formattedData = response.data.data.map(student => ({
        id: student.student_id,
        firstname: student.first_name,
        lastname: student.last_name,
        program: student.program_code,
        year: student.year_level,
        gender: student.gender || 'N/A'
      }));

      setStudentData(formattedData);
      setTotalCount(response.data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
  }

  const handleEditSuccess = () => {
    setEditItem(null);
    fetchStudents();
  }

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await studentsAPI.delete(deleteItem.id);
      setDeleteItem(null);
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student");
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

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="data-page">
        {/* Header */}
        <div className="header-row">
          <h1 className="title">Students</h1>
          <div className="action-buttons">
            <button className="btn btn-outline">Export</button>
            <button className="btn btn-primary">+ Add new student</button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search students"
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
                {studentColumns.map((col) => <th key={col}>{col}</th>)}
                <th> Actions </th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((item, index) => (
                <tr key={index}>
                  {studentColumns.map((col) => (
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
        <EditStudentModal
          isOpen={true}
          student={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleEditSuccess}
          programs={programsList}
        />
      )}

      {deleteItem && (
        <DeleteModal
          isOpen={true}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDeleteConfirm}
          itemName={`${deleteItem.id} - ${deleteItem.firstname} ${deleteItem.lastname}`}
        />
      )}
    </>
  );
}