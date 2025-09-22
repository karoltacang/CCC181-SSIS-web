import { useState, useEffect } from "react";
import DataPage from "../layout/DataPage";
import { programsAPI } from "../services/api";

const programColumns = ["Code", "Name", "College"];

export default function Programs() {
  const [programData, setProgramData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programsAPI.getAll();
      // Transform API data to match your table format
      const formattedData = response.data.map(program => ({
        code: program.program_code,
        name: program.program_name,
        college: program.college_code
      }));
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

  return <DataPage title="Programs" data={programData} columns={programColumns} />;
}