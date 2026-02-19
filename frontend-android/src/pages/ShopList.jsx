// frontend-android/src/pages/ShopList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ShopList() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    // 1. Fetch Shops on Load
    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async (query = '') => {
        setLoading(true);
        try {
            // Agar search query hai to search API, warna normal list
            const endpoint = query 
                ? `/shops/search?q=${query}` 
                : '/shops';
            
            const response = await api.get(endpoint);
            setShops(response.data);
        } catch (error) {
            console.error("Failed to fetch shops", error);
        } finally {
            setLoading(false);
        }
    };

    // Search Handler (Debounce type ka simple logic)
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        // Thoda delay dekar search karo ya button par (abhi direct call karte hain)
        if(value.length > 2 || value.length === 0) {
            fetchShops(value);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 taaki bottom content chhupe na */}
            
            {/* Header Section */}
            <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 font-poppins">
                            Hello, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-sm text-gray-500">Hungry? Let's find some food.</p>
                    </div>
                    {/* Cart Icon (Small shortcut) */}
                    <Link to="/cart" className="p-2 bg-red-50 rounded-full text-red-600">
                        🛒
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search 'Burger', 'Canteen'..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                </div>
            </div>

            {/* Shops List */}
            <div className="p-4 space-y-4">
                <h2 className="text-lg font-bold text-gray-700">Campus Outlets</h2>

                {loading ? (
                    <p className="text-center text-gray-400 mt-10">Finding shops...</p>
                ) : shops.length === 0 ? (
                    <div className="text-center mt-10">
                        <p className="text-gray-500">No shops found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    shops.map((shop) => (
                        <div key={shop.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Shop Image */}
                            <div className="h-32 bg-gray-200 relative">
                                <img 
                                    src={shop.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000"} 
                                    alt={shop.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Rating Badge */}
                                <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center">
                                    ⭐ {shop.averageRating || "New"}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{shop.name}</h3>
                                        <p className="text-sm text-gray-500">📍 {shop.location}</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                        Open
                                    </span>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                        🕒 {shop.openTime} - {shop.closeTime}
                                    </p>
                                    <Link 
                                        to={`/shops/${shop.id}`} // Yeh route Menu page par le jayega
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700"
                                    >
                                        View Menu
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ShopList;