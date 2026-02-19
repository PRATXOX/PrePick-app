
// frontend-android/src/pages/ShopMenu.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function ShopMenu() {
    const { shopId } = useParams(); // URL se Shop ID nikalo
    const [shop, setShop] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                // Humne backend mein '/api/shops/:id/menu' banaya tha
                const response = await api.get(`/shops/${shopId}/menu`);
                setShop(response.data.shop);
                setMenu(response.data.menu);
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShopData();
    }, [shopId]);

    if (loading) return <div className="text-center mt-10">Loading Menu...</div>;
    if (!shop) return <div className="text-center mt-10">Shop not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            
            {/* Shop Header (Image & Info) */}
            <div className="relative h-48">
                <img 
                    src={shop.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000"} 
                    alt={shop.name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold">{shop.name}</h1>
                        <p className="opacity-90">📍 {shop.location}</p>
                    </div>
                </div>
                {/* Back Button */}
                <Link to="/shops" className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md text-gray-800">
                    ⬅
                </Link>
            </div>

            {/* Menu Section */}
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Menu</h2>

                <div className="space-y-4">
                    {menu.length === 0 ? (
                        <p className="text-center text-gray-400">No items available right now.</p>
                    ) : (
                        menu.map((item) => (
                            <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                                {/* Item Details */}
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={item.imageUrl || "https://placehold.co/60x60/e2e8f0/333333?text=Img"} 
                                        alt={item.name} 
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                                        <p className="text-sm text-gray-500">₹{item.price}</p>
                                    </div>
                                </div>

                                {/* Add Button */}
                                <button 
                                    onClick={() => {
        addToCart({ ...item, shopId: shopId }); // 👈 YAHAN HAI MAGIC FIX
        alert(`${item.name} added to cart!`);
    }}
                                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-1 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    ADD +
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* View Cart Button (Floating) */}
            <div className="fixed bottom-4 left-0 right-0 px-4">
                <Link to="/cart" className="block w-full bg-red-600 text-white text-center py-3 rounded-xl font-bold shadow-lg hover:bg-red-700">
                    View Cart 🛒
                </Link>
            </div>
        </div>
    );
}

export default ShopMenu;