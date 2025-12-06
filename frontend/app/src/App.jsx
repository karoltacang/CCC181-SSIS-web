import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/global/Sidebar";
import Students from "./pages/Students";
import Programs from "./pages/Programs";
import Colleges from "./pages/Colleges";
import Login from "./pages/login/Login";
import './App.css';

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

  if (!token) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/students" />} />
            <Route path="/students" element={<Students />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/colleges" element={<Colleges />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;