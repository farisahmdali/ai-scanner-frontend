import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'
import Login from './pages/Login'
import Layout from './layout/layout';
import ResumeScanner from './pages/ResumeScanner';
import JobRoles from './pages/JobRoles';
import ScanHistory from './pages/ScanHistory';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/resumes" element={<ResumeScanner />} />
          <Route path="/job-roles" element={<JobRoles />} />
          <Route path="/scan-history" element={<ScanHistory />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App
