import { useState, useEffect } from "react";
import DataPage from "../layout/DataPage";
import { collegesAPI } from "../services/api";

const collegeColumns = ["Code", "Name"];

export default function Colleges() {
  const [collegeData, setCollegeData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchColleges(); // Fetch all colleges on initial render
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchColleges(search.trim());
  };

  const fetchColleges = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await collegesAPI.getAll({ search: searchTerm });
      // Transform API data to match your table format
      const formattedData = response.data.map(college => ({
        code: college.college_code,
        name: college.college_name
      }));
      setCollegeData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading colleges...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DataPage
      title="Colleges"
      data={collegeData}
      columns={collegeColumns}
      search={search}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit} />
  );
}