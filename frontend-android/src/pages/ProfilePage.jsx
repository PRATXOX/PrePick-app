import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return <p className="p-10 text-center">Please login first.</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold font-poppins text-gray-800 dark:text-white mb-6">My Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Role</span>
            <span className="font-semibold dark:text-white">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Phone</span>
            <span className="font-semibold dark:text-white">{user.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">University</span>
            <span className="font-semibold dark:text-white">{user.university?.name || "N/A"}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-6 bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition"
        >
          Log Out 🚪
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;