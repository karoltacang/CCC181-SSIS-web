import DataPage from "../layout/DataPage";

const studentData = [
  { id: "2021-0107", firstname: "John", lastname: "Doe", course: "CS", year: "1st", gender: "Male" },
  { id: "2021-0108", firstname: "Jane", lastname: "Smith", course: "Math", year: "2nd", gender: "Female" },
];

const studentColumns = ["ID", "First Name", "Last Name", "Course", "Year", "Gender"];

export default function Students() {
  return <DataPage title="Students" data={studentData} columns={studentColumns} />;
}