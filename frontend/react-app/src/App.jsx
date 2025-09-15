import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import Students from "./pages/Students";
import Programs from "./pages/Programs";
import Colleges from "./pages/Colleges";
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="main">
          <Routes>
            <Route path="/students" element={<Students />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/settings" element={<h1> Settings </h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;