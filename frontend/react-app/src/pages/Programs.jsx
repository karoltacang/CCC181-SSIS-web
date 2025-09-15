import DataPage from "../layout/DataPage";

const programData = [
  { code: "CS101", name: "Computer Science", college: "CCS" },
  { code: "ENG201", name: "English", college: "CASS" },
];

const programColumns = ["Code", "Name", "College"];

export default function Programs() {
  return <DataPage title="Programs" data={programData} columns={programColumns} />;
}