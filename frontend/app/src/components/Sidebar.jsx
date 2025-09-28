import { NavLink } from "react-router-dom";
import "../App.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <div className="sidebar-header">
        <div className="user-avatar">
          <img 
            src="https://via.placeholder.com/80" 
            alt="User Avatar" 
          />
        </div>
        <h3 className="user-name">Admin User</h3>
        <p className="user-email">admin@ssis.edu</p>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon"> </span>
          <span className="nav-label">Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/students" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon"> </span>
          <span className="nav-label">Students</span>
        </NavLink>

        <NavLink 
          to="/programs" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon"> </span>
          <span className="nav-label">Programs</span>
        </NavLink>

        <NavLink 
          to="/colleges" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon"> </span>
          <span className="nav-label">Colleges</span>
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => console.log('Logout')}>
          <span className="nav-icon"> </span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
}