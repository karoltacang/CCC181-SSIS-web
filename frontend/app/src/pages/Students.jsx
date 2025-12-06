import { useState, useEffect } from "react";
import { studentsAPI, programsAPI } from "../services/api";
import EditStudentModal from "../components/student/Edit";
import AddStudentModal from "../components/student/Add";
import UploadPhotoModal from "../components/student/UploadPhoto";
import DeleteModal from "../components/global/Delete";
import Table from "../components/global/Table";
import "../App.css";

const studentColumns = [
  { label: "Photo", key: "photo", sortable: false },
  { label: "ID", key: "id", sortable: true },
  { label: "First Name", key: "firstname", sortable: true },
  { label: "Last Name", key: "lastname", sortable: true },
  { label: "Program", key: "program", sortable: true },
  { label: "Year", key: "year", sortable: true },
  { label: "Gender", key: "gender", sortable: true }
];

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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadItem, setUploadItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const clearStudentCache = () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('students_')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    fetchStudents(); // Fetch all students on initial render
  }, [currentPage, perPage]);

  useEffect(() => {
    const fetchProgramsList = async () => {
      const cached = sessionStorage.getItem('programs_list');
      if (cached) {
        setProgramsList(JSON.parse(cached));
        return;
      }
      try {
        const response = await programsAPI.getAll({ per_page: 1000, only_codes: true });
        const data = response.data.data || [];
        setProgramsList(data);
        sessionStorage.setItem('programs_list', JSON.stringify(data));
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    fetchStudents(search.trim(), false, key, direction);
  };

  const fetchStudents = async (searchTerm = search.trim(), background = false, sortBy = sortConfig.key, order = sortConfig.direction) => {
    try {
      if (!background) setLoading(true);
      
    const keyMap = {
      'id': 'student_id',
      'firstname': 'first_name',
      'lastname': 'last_name',
      'program': 'program_code',
      'year': 'year_level',
      'gender': 'gender'
    };
    const backendSortBy = keyMap[sortBy] || sortBy;
      
      const cacheKey = `students_${currentPage}_${perPage}_${searchTerm}_${backendSortBy}_${order}`;
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
  
        const response = await studentsAPI.getAll(params);
        data = response.data.data;
        total = response.data.total;
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, total }));
      }

      const formattedData = data.map(student => ({
        photo: (
          <div 
            className="student-photo-cell" 
            onClick={() => handleUploadClick({ id: student.student_id, firstname: student.first_name })}
            style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {student.photo_url ? (
              <img src={student.photo_url} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#888' }}>Add</span>
            )}
          </div>
        ),
        id: student.student_id,
        firstname: student.first_name,
        lastname: student.last_name,
        program: student.program_code,
        year: student.year_level,
        gender: student.gender || 'N/A'
      }));

      setStudentData(formattedData);
      setTotalCount(total);
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
    clearStudentCache();
    fetchStudents(undefined, true);
  }

  const handleDelete = (item) => {
    setDeleteItem(item);
  };

  const handleDeleteConfirm = async () => {
    try {
      await studentsAPI.delete(deleteItem.id);
      clearStudentCache();
      setDeleteItem(null);
      fetchStudents(undefined, true);
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student");
    }
  };

  const handleUploadClick = (student) => {
    setUploadItem(student);
    setUploadModalOpen(true);
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
          <h1 className="title">Students</h1>
        </div>

        {/* Functions */}
        <div className="functions">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search students"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <span className="results-info">{totalCount} Results</span>
          </div>
          <div className="right-side">
            <div className="action-buttons">
              <button className="btn btn-outline">Export</button>
              <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>+ Add new student</button>
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
        <div className="table-wrapper students-table">
          {loading && (
            <div className="loading-overlay">
              Loading...
            </div>
          )}
          <Table
            columns={studentColumns}
            data={studentData}
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

      {addModalOpen && (
        <AddStudentModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => { clearStudentCache(); fetchStudents(undefined, true); }}
          programs={programsList}
        />
      )}

      {uploadModalOpen && uploadItem && (
        <UploadPhotoModal
          isOpen={uploadModalOpen}
          student={uploadItem}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => { clearStudentCache(); fetchStudents(undefined, true); }}
        />
      )}
    </>
  );
}