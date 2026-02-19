import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ShopMenuPage from './pages/ShopMenuPage';
import ChatBot from './components/ChatBot';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import VendorDashboard from './pages/VendorDashboard';
// import VendorProfilePage from './pages/VendorProfilePage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { useAuth } from './context/AuthContext';
// Upar import karo
import { PartnerPage, ContactSalesPage } from './pages/BusinessPages';
import { PrivacyPolicy, TermsOfService, CookiePolicy } from './pages/LegalPages';
import Footer from './components/Footer';
import VendorEarningsPage from './pages/VendorEarningsPage';
import VendorWalletPage from './pages/VendorWalletPage';
import AdminDashboard from './pages/AdminDashboard';

// This is a new layout component for all protected pages
function ProtectedLayout() {
    const { token, authLoading } = useAuth();

    if (authLoading) {
        return <p className="text-center p-10">Loading...</p>;
    }

    // If the user is not logged in, redirect them to the login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If logged in, show the main app layout
    return (
        <div>
            <Navbar />
            <main>
                <Outlet /> {/* This renders the current protected route's component */}
            </main>
            <ChatBot />
            <Footer />
        </div>
    );
}


function App() {
  return (
    <Routes>
      {/* Public Routes (Visible to everyone) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/partner" element={<PartnerPage />} />
      <Route path="/contact-sales" element={<ContactSalesPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/secret-admin-dashboard" element={<AdminDashboard />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      
      {/* Protected Routes (Visible only after login) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/shops" element={<HomePage />} />
        <Route path="/vendor/earnings" element={<VendorEarningsPage />} />
        <Route path="/shop/:shopId" element={<ShopMenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/my-orders" element={<OrderHistoryPage />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        {/* <Route path="/vendor/profile" element={<VendorProfilePage />} /> */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/vendor/wallet" element={<VendorWalletPage />} />
        
      </Route>
    </Routes>
  );
}

export default App;

