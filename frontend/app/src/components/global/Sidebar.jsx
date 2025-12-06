import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../App.css";

export default function Sidebar() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : {};
  });

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    sessionStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          localStorage.setItem('user_info', JSON.stringify(data));
        } else if (response.status === 401) {
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <div className="sidebar-header">
        <div className="user-avatar">
          <img 
            src={user.picture || "https://via.placeholder.com/80"} 
            alt="User Avatar" 
          />
        </div>
        <h3 className="user-name">{user.username}</h3>
        <p className="user-email">{user.email}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">        
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
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"> </span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
}