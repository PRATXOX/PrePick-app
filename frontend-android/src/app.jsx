// frontend-android/src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORTS ---
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav'; // 👈 Bottom Nav Import
import SplashScreen from './components/SplashScreen'; 

// --- PAGES ---
import HomePage from './pages/HomePage'; // Login Page
import RegisterPage from './pages/RegisterPage';
import ShopList from './pages/ShopList';
import ShopMenu from './pages/ShopMenu';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import VendorDashboard from './pages/VendorDashboard';
import ProfilePage from './pages/ProfilePage';

// --- CONTEXT ---
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // --- SPLASH SCREEN TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); 
    }, 2500); 

    return () => clearTimeout(timer);
  }, []);

  // 1. Splash Screen Logic
  if (showSplash) {
    return <SplashScreen />;
  }

  // 2. Loading Logic
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // --- 🚦 TRAFFIC POLICE COMPONENT (Iska naam DecideHome hai) ---
  const DecideHome = () => {
    if (!user) {
      return <HomePage />; // Login Page
    }
    if (user.role === 'VENDOR') {
      return <Navigate to="/vendor-dashboard" replace />;
    }
    return <Navigate to="/shops" replace />; // Student Home
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20"> {/* pb-20 for BottomNav */}
      
      {/* Top Navbar */}
      {user && <Navbar />}

      <Routes>
        {/* 👇 YAHAN GALTI THI (Ab Sahi Hai) */}
        <Route path="/" element={<DecideHome />} /> 
        
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
        
        {/* Student Routes */}
        <Route path="/shops" element={user ? <ShopList /> : <Navigate to="/" />} />
        <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/" />} />
        <Route path="/my-orders" element={user ? <OrderHistoryPage /> : <Navigate to="/" />} />
        <Route path="/shops/:shopId" element={user ? <ShopMenu /> : <Navigate to="/" />} />

        {/* Vendor Routes */}
        <Route path="/vendor-dashboard" element={
          user && user.role === 'VENDOR' ? <VendorDashboard /> : <Navigate to="/" />
        } />
      </Routes>

      {/* Bottom Navbar (Always Visible) */}
      {user && <BottomNav />}

    </div>
  );
}

export default App;