import { useState, useEffect } from "react";
import DataPage from "../layout/DataPage";
import { studentsAPI } from "../services/api";

const studentColumns = ["ID", "First Name", "Last Name", "Program", "Year", "Gender"];

export default function Students() {
  const [studentData, setStudentData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents(); // Fetch all students on initial render
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchStudents(search.trim());
  };

  const fetchStudents = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll({ search: searchTerm });

      const formattedData = response.data.map(student => ({
        id: student.student_id,
        firstname: student.first_name,
        lastname: student.last_name,
        program: student.program_code,
        year: student.year_level,
        gender: student.gender || 'N/A'
      }));
      setStudentData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DataPage
      title="Students"
      data={studentData}
      columns={studentColumns}
      search={search}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit} />
  );
}