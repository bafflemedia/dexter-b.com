import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import BATS from './pages/BATS'; 
import { Login } from './pages/Login';

const App: React.FC = () => {
  // 1. The Clearance State: Defaults to locked (false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#2b3d4f] text-[#e2e8f0] font-sans selection:bg-[#e2001a] selection:text-white relative overflow-x-hidden">
        {/* Persistent Engineering Grid: Stays visible across all routes */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#8a8e91 1px, transparent 1px), linear-gradient(90deg, #8a8e91 1px, transparent 1px)`, backgroundSize: '50px 50px' }}>
        </div>

        <Routes>
          {/* Public Sector */}
          <Route path="/" element={<Home />} />
          
          {/* The Gatekeeper UI */}
          <Route path="/login" element={<Login setAuthStatus={setIsAuthenticated} />} />

          {/* Protected Sector: The BATS Hub */}
          <Route 
            path="/bats" 
            element={
              isAuthenticated ? <BATS /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;