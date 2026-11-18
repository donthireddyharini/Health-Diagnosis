import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Consultations from './pages/Consultations';
import ConsultationDetail from './pages/ConsultationDetail';
import BrainDisease from './pages/BrainDisease';
import EyeDisease from './pages/EyeDisease';
import BoneFracture from './pages/BoneFracture';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login login={login} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register login={login} />} 
          />
          <Route 
            path="/dashboard" 
            element={<Navigate to="/" replace />} 
          />
          <Route 
            path="/predict" 
            element={<Navigate to="/" replace />} 
          />
          <Route 
            path="/history" 
            element={<Navigate to="/" replace />} 
          />
          <Route 
            path="/predictions/:id" 
            element={<Navigate to="/" replace />} 
          />
          <Route 
            path="/consultations" 
            element={user ? <Consultations user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/consultations/:id" 
            element={user ? <ConsultationDetail user={user} /> : <Navigate to="/login" />} 
          />
          <Route path="/diseases" element={<Navigate to="/" replace />} />
          <Route path="/diseases/:name" element={<Navigate to="/" replace />} />
          <Route 
            path="/chat" 
            element={<Navigate to="/" replace />} 
          />
          <Route 
            path="/brain-disease" 
            element={user ? <BrainDisease /> : <Navigate to="/login" replace state={{ from: '/brain-disease' }} />} 
          />
          <Route path="/brain" element={<Navigate to="/brain-disease" />} />
          <Route path="/brain-cancer" element={<Navigate to="/brain-disease" />} />
          <Route 
            path="/eye-disease" 
            element={user ? <EyeDisease /> : <Navigate to="/login" replace state={{ from: '/eye-disease' }} />} 
          />
          <Route path="/eye" element={<Navigate to="/eye-disease" />} />
          <Route path="/eye-detection" element={<Navigate to="/eye-disease" />} />
          <Route 
            path="/bone-fracture" 
            element={user ? <BoneFracture user={user} /> : <Navigate to="/login" replace state={{ from: '/bone-fracture' }} />} 
          />
          <Route path="/bone" element={<Navigate to="/bone-fracture" />} />
          <Route path="/fracture" element={<Navigate to="/bone-fracture" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
