import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">SSIS</div>
      <ul>
        <li>
          <Link to="/students">Students</Link>
        </li>
        <li>
          <Link to="/programs">Programs</Link>
        </li>
        <li>
          <Link to="/colleges">Colleges</Link>
        </li>
      </ul>
    </div>
  );
}
