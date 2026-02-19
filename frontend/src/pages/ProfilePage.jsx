import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'settings', 'support'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-poppins">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-primary p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-primary mb-4 shadow-lg border-4 border-white">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
            <p className="text-white/80">{user?.role} • {user?.email}</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setActiveTab('profile')} className={`flex-1 py-4 text-center font-bold ${activeTab === 'profile' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>👤 My Profile</button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 text-center font-bold ${activeTab === 'settings' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>⚙️ Settings</button>
            <button onClick={() => setActiveTab('support')} className={`flex-1 py-4 text-center font-bold ${activeTab === 'support' ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>🎧 Support</button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold dark:text-white">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Full Name</label>
                            <p className="text-lg font-semibold dark:text-white">{user?.name}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Email Address</label>
                            <p className="text-lg font-semibold dark:text-white">{user?.email}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Phone Number</label>
                            <p className="text-lg font-semibold dark:text-white">{user?.phone}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Role</label>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-bold hover:bg-red-200 mt-6">
                        Logout
                    </button>
                </div>
            )}

            {/* 2. SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold dark:text-white">Account Settings</h2>
                    
                    {/* Password Change (Demo UI) */}
                    <div className="border p-4 rounded-xl dark:border-gray-700">
                        <h3 className="font-bold mb-4 dark:text-white">Change Password</h3>
                        <input type="password" placeholder="Current Password" className="w-full mb-3 p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
                        <input type="password" placeholder="New Password" className="w-full mb-3 p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
                        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">Update Password</button>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex justify-between items-center border p-4 rounded-xl dark:border-gray-700">
                        <div>
                            <h3 className="font-bold dark:text-white">Email Notifications</h3>
                            <p className="text-xs text-gray-500">Receive order updates via email</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 accent-primary" defaultChecked />
                    </div>
                </div>
            )}

            {/* 3. SUPPORT TAB */}
            {activeTab === 'support' && (
                <div className="space-y-6 animate-fade-in text-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Support" className="w-32 mx-auto opacity-80" />
                    <h2 className="text-2xl font-bold dark:text-white">Need Help?</h2>
                    <p className="text-gray-500">Facing issues with your order or payment? Our team is here to help you.</p>
                    
                    <div className="flex flex-col gap-4 mt-6 max-w-sm mx-auto">
                        <a href="mailto:support@prepick.com" className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                            📧 Email Support
                        </a>
                        <a href="tel:+919999999999" className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">
                            📞 Call Helpline
                        </a>
                        <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600">
    💬 Chat on WhatsApp
</a>
                    </div>

                    <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                        <strong>Note:</strong> Refunds for failed online payments are processed within 24-48 hours automatically.
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;