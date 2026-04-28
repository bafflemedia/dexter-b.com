import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BATS from './pages/BATS'; // Assuming this exists in your pages dir

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#2b3d4f] text-[#e2e8f0] font-sans selection:bg-[#e2001a] selection:text-white relative overflow-x-hidden">
        {/* Persistent Engineering Grid: Stays visible across all routes */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#8a8e91 1px, transparent 1px), linear-gradient(90deg, #8a8e91 1px, transparent 1px)`, backgroundSize: '50px 50px' }}>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bats" element={<BATS />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;