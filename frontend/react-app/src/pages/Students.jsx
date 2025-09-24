import { useState, useEffect } from "react";
import DataPage from "../components/DataPage";
import { studentsAPI } from "../services/api";
import EditStudentModal from "../components/student/Edit";

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

  useEffect(() => {
    fetchStudents(); // Fetch all students on initial render
  }, [currentPage, perPage]);

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

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <DataPage
        title="Students"
        data={studentData}
        columns={studentColumns}
        search={search}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        totalCount={totalCount}
        currentPage={currentPage}
        perPage={perPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        onEdit={handleEdit}
        />

      {editItem && (
        <EditStudentModal
          isOpen={true}
          student={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}