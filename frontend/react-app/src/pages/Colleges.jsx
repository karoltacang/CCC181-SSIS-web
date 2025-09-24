import { useState, useEffect } from "react";
import DataPage from "../components/DataPage";
import EditCollegeModal from "../components/college/Edit";
import { collegesAPI } from "../services/api";

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

  if (loading) return <div>Loading colleges...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <DataPage
        title="Colleges"
        data={collegeData}
        columns={collegeColumns}
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
        <EditCollegeModal
          isOpen={true}
          college={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}