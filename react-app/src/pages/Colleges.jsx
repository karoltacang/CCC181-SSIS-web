import DataPage from "../components/DataPage";

const collegeData = [
  { code: "CCS", name: "College of Computer Studies"},
  { code: "CASS", name: "College of Arts and Social Sciences"},
];

const collegeColumns = ["Code", "Name"];

export default function Colleges() {
  return <DataPage title="Colleges" data={collegeData} columns={collegeColumns} />;
}