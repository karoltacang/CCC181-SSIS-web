import { useState, useEffect } from "react";
import DataPage from "../components/DataPage";
import EditProgramModal from "../components/program/Edit";
import { programsAPI } from "../services/api";

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

  useEffect(() => {
    fetchPrograms(); // Fetch programs on initial render
  }, [currentPage, perPage]);

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

  const fetchPrograms = async (searchTerm = search.trim()) => {
    try {
      setLoading(true);
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
    fetchPrograms();
  };

  if (loading) return <div>Loading programs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <DataPage
        title="Programs"
        data={programData}
        columns={programColumns}
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
        <EditProgramModal
          isOpen={true}
          program={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}