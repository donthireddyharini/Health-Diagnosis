import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import History from './pages/History';
import PredictionDetail from './pages/PredictionDetail';
import Consultations from './pages/Consultations';
import ConsultationDetail from './pages/ConsultationDetail';
import Diseases from './pages/Diseases';
import DiseaseDetail from './pages/DiseaseDetail';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

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
            element={user ? <Navigate to="/dashboard" /> : <Login login={login} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register login={login} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/predict" 
            element={user ? <Predict /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/history" 
            element={user ? <History /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/predictions/:id" 
            element={user ? <PredictionDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/consultations" 
            element={user ? <Consultations user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/consultations/:id" 
            element={user ? <ConsultationDetail user={user} /> : <Navigate to="/login" />} 
          />
          <Route path="/diseases" element={<Diseases />} />
          <Route path="/diseases/:name" element={<DiseaseDetail />} />
          <Route 
            path="/chat" 
            element={user ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
