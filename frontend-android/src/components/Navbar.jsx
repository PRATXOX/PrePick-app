import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/newwlogo.png'; 

const SunIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
const MoonIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>;

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shops?search=${searchTerm.trim()}`);
    } else {
      navigate('/shops');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Left Side: Brand & Logo */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link to={user ? (user.role === 'VENDOR' ? "/vendor/dashboard" : "/shops") : "/"} className="flex items-center gap-3 group">
             <div className="relative">
                 <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                 {/* YEH HAI CHANGE: Size h-20 kar diya hai (bada logo) */}
                 <img 
                    src={logo} 
                    alt="PrePick Logo" 
                    className="relative h-20 w-auto rounded-xl transition-all duration-300 dark:filter dark:brightness-0 dark:invert" 
                 />
             </div>
             {/* Text hata diya kyunki logo mein already text hai, agar text alag se chahiye to niche wali line uncomment kar dein */}
             {/* <span className="text-2xl font-extrabold font-poppins text-primary-dark tracking-tight hidden sm:block group-hover:text-primary transition-colors">PrePick</span> */}
          </Link>
          
          {/* University Name Badge */}
          {user && user.role === 'STUDENT' && user.university && (
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1.5 border border-gray-200 dark:border-gray-600">
                  <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                      {user.university.name}
                  </span>
              </div>
          )}

          {/* ... Navigation Links same rahenge ... */}
          <div className="hidden md:flex items-center space-x-6">
            {user && user.role === 'STUDENT' && (
              <Link to="/my-orders" className="text-gray-600 dark:text-gray-300 hover:text-primary-dark font-semibold transition-colors">My Orders</Link>
            )}
            {user && user.role === 'VENDOR' && (
              <>
                <Link to="/vendor/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-dark font-semibold transition-colors">Dashboard</Link>
                <Link to="/vendor/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-dark font-semibold transition-colors">Manage Shop</Link>
                <Link to="/vendor/wallet" className="text-gray-600 dark:text-gray-300 hover:text-primary-dark font-semibold transition-colors flex items-center">
                    <span>Wallet</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Center: Search Bar (Only for Students) */}
        {user && user.role === 'STUDENT' && (
          <div className="flex-1 max-w-lg mx-4 hidden lg:block">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shops..." 
                className="w-full px-5 py-2.5 pr-12 border border-gray-200 rounded-full bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-600 transition-all shadow-sm"
              />
              <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </form>
          </div>
        )}

        {/* Right Side: Icons */}
        <div className="flex items-center space-x-3 md:space-x-5">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          
          {user && user.role === 'STUDENT' && (
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800 transform translate-x-1 -translate-y-1">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user && (
            <>
              <Link to="/profile" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
              <button 
                onClick={handleLogout}
                className="hidden md:block bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary-dark shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;