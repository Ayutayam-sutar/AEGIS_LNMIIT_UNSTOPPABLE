import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/navbar'; // 1. Import the Navbar
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        
        {/* 2. Add Navbar here so it appears on ALL pages */}
        <Navbar />

        {/* 3. Add padding-top (pt-24) so content isn't hidden behind the fixed Navbar */}
        <div className="pt-24 px-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
};

export default App;