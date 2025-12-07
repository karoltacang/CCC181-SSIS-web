import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/global/Sidebar";
import Students from "./pages/Students";
import Programs from "./pages/Programs";
import Colleges from "./pages/Colleges";
import Login from "./pages/login/Login";
import './App.css';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    return <Login />;
  }
  
  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Router>
      {!token ? (
        <Login />
      ) : (
        <div className="app">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="main">
            <Routes>
              <Route path="/" element={<Navigate to="/students" replace />} />
              <Route 
                path="/students" 
                element={
                  <ProtectedRoute>
                    <Students />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/programs" 
                element={
                  <ProtectedRoute>
                    <Programs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/colleges" 
                element={
                  <ProtectedRoute>
                    <Colleges />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;