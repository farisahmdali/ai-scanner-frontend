import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home';
import Layout from './layout/layout';
import ResumeScanner from './pages/ResumeScanner';
import JobRoles from './pages/JobRoles';
import ScanHistory from './pages/ScanHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resumes" element={<ResumeScanner />} />
          <Route path="/job-roles" element={<JobRoles />} />
          <Route path="/scan-history" element={<ScanHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
