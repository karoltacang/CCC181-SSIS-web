import { useState, useEffect } from "react";
import DataPage from "../components/DataPage";
import { programsAPI } from "../services/api";

const programColumns = ["Code", "Name", "College"];

export default function Programs() {
  const [programData, setProgramData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrograms(search.trim()); // Fetch programs based on the current search term
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchPrograms(search.trim());
  };

  const fetchPrograms = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await programsAPI.getAll({ search: searchTerm });

      const formattedData = response.data.map(program => ({
        code: program.program_code,
        name: program.program_name,
        college: program.college_code
      }));
      console.log(formattedData);
      setProgramData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading programs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DataPage
      title="Programs"
      data={programData}
      columns={programColumns}
      search={search}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit} />
  );
}