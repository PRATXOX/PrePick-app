import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import io from 'socket.io-client';

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {checked ? 'Available' : 'Sold Out'}
            </span>
        </label>
    );
};

function VendorDashboard() {
    // --- States ---
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [shop, setShop] = useState(null); // ⚠️ Agar ye null raha, toh create form dikhega
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    
    // Filters & Search
    const [activeFilter, setActiveFilter] = useState('ongoing');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [ongoingNotifCount, setOngoingNotifCount] = useState(0);
    const [cancelledNotifCount, setCancelledNotifCount] = useState(0);

    // Create/Edit Shop Form State
    const [shopForm, setShopForm] = useState({ name: '', location: '', openTime: '', closeTime: '' });
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);

    // Items State
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [itemToUpdateId, setItemToUpdateId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // --- SMART DATA FETCHING 🧠 ---
    const fetchData = useCallback(async (filter, query) => {
        if (!token) return;
        setLoading(true);
        
        try {
            // 1. SHOP FETCH KARO (Alag se try-catch mein)
            let currentShop = null;
            try {
                const shopRes = await api.get('/shops/my-shop', { headers: { Authorization: `Bearer ${token}` } });
                setShop(shopRes.data);
                currentShop = shopRes.data;
                
                // Form pre-fill karo taaki edit kar sakein
                setShopForm({
                    name: shopRes.data.name,
                    location: shopRes.data.location,
                    openTime: shopRes.data.openTime,
                    closeTime: shopRes.data.closeTime
                });
            } catch (err) {
                // Agar 404 aaya, matlab shop nahi bani hai. Koi baat nahi.
                console.warn("Shop not found. Showing create form.");
                setShop(null);
            }

            // 2. AGAR SHOP MIL GAYI, TABHI ITEMS AUR ORDERS LAO
            if (currentShop) {
                let ordersUrl = `/orders/vendor?status=${filter}`;
                if (query) ordersUrl = `/orders/vendor/search?q=${query}&status=${filter}`;
                
                const [ordersRes, itemsRes] = await Promise.all([
                    api.get(ordersUrl, { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/items/my-items', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                
                setOrders(ordersRes.data);
                setItems(itemsRes.data);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData(activeFilter, debouncedSearchTerm);
    }, [activeFilter, debouncedSearchTerm, fetchData]);

    // Socket IO
    useEffect(() => {
        if(!shop) return;
        const socket = io('http://localhost:5000');
        socket.on('new_order', (newOrder) => {
            if (activeFilter === 'ongoing') setOrders(prev => [newOrder, ...prev]);
            setOngoingNotifCount(prev => prev + 1);
        });
        socket.on('order_updated', (updatedOrder) => {
            fetchData(activeFilter, debouncedSearchTerm);
            if (updatedOrder.status === 'CANCELLED') setCancelledNotifCount(prev => prev + 1);
        });
        return () => socket.disconnect();
    }, [activeFilter, debouncedSearchTerm, fetchData, shop]);

    // --- HANDLERS ---

    // 🆕 CREATE SHOP (Agar registration ke waqt nahi bani thi)
    const handleCreateShop = async (e) => {
        e.preventDefault();
        try {
            await api.post('/shops', shopForm, { headers: { Authorization: `Bearer ${token}` } });
            alert("Shop Created Successfully! 🎉");
            fetchData('ongoing', ''); // Ab data load karo
        } catch (error) {
            alert(error.response?.data?.error || "Failed to create shop.");
        }
    };

    // ✏️ UPDATE SHOP
    const handleUpdateShop = async (e) => {
        e.preventDefault();
        try {
            await api.put('/shops/my-shop', shopForm, { headers: { Authorization: `Bearer ${token}` } });
            setShop({ ...shop, ...shopForm });
            setIsShopModalOpen(false);
            alert("Shop Updated!");
        } catch (error) {
            alert("Failed to update shop.");
        }
    };

    // ITEM HANDLERS (Add/Edit/Delete/Image)
    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/items', { name: newItemName, price: parseFloat(newItemPrice) }, { headers: { Authorization: `Bearer ${token}` } });
            setItems(prev => [res.data, ...prev]);
            setNewItemName(''); setNewItemPrice('');
            alert('Item added!');
        } catch (error) { alert('Failed to add item.'); }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/items/${editingItem.id}`, 
                { name: editingItem.name, price: parseFloat(editingItem.price), availability: editingItem.availability }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
            setIsEditItemModalOpen(false);
            alert("Item updated!");
        } catch (error) { alert("Failed to update."); }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await api.delete(`/items/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
            setItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) { alert('Failed to delete.'); }
    };

    const handleUploadClick = (itemId) => { setItemToUpdateId(itemId); fileInputRef.current.click(); };
    const handleFileSelected = async (event) => {
        const file = event.target.files[0];
        if (!file || !itemToUpdateId) return;
        const formData = new FormData();
        formData.append('itemImage', file);
        try {
            await api.post(`/items/${itemToUpdateId}/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
            fetchData(activeFilter, debouncedSearchTerm);
            alert('Image uploaded!');
        } catch (error) { alert('Failed to upload.'); }
        finally { setItemToUpdateId(null); if(fileInputRef.current) fileInputRef.current.value = null; }
    };

    const handleToggleAvailability = async (item) => {
        const newAvailability = !item.availability;
        try {
            await api.put(`/items/${item.id}`, { availability: newAvailability }, { headers: { Authorization: `Bearer ${token}` } });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, availability: newAvailability } : i));
        } catch (error) { alert('Update failed.'); }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        let otp = null;
        if (newStatus === 'PICKED_UP') {
            otp = window.prompt("🔐 Enter 4-Digit OTP from Student:");
            if (!otp) return; 
        }
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus, otp }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) { alert(error.response?.data?.error || 'Failed to update.'); }
    };

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        if (filter === 'ongoing') setOngoingNotifCount(0);
        else if (filter === 'cancelled') setCancelledNotifCount(0);
    };

    if (loading) return <p className="text-center mt-8 dark:text-gray-300">Checking shop status...</p>;

    // 🚨 SCENARIO: SHOP NOT FOUND (Show Create Form) 🚨
    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-2 text-center dark:text-white">Setup Your Shop 🏪</h2>
                    <p className="text-gray-500 text-center mb-6 text-sm">Please enter your shop details to continue.</p>
                    
                    <form onSubmit={handleCreateShop} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Shop Name</label>
                            <input type="text" value={shopForm.name} onChange={(e) => setShopForm({...shopForm, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Location</label>
                            <input type="text" value={shopForm.location} onChange={(e) => setShopForm({...shopForm, location: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Open</label>
                                <input type="time" value={shopForm.openTime} onChange={(e) => setShopForm({...shopForm, openTime: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Close</label>
                                <input type="time" value={shopForm.closeTime} onChange={(e) => setShopForm({...shopForm, closeTime: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Create Shop 🚀</button>
                    </form>
                </div>
            </div>
        );
    }

    // --- SCENARIO: SHOP EXISTS (Show Dashboard) ---
    return (
        <div className="bg-background min-h-screen dark:bg-gray-900 pb-20">
            <div className="container mx-auto p-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-extrabold font-poppins text-secondary dark:text-white flex items-center gap-2">
                            {`👋 ${shop.name}`}
                            <button onClick={() => setIsShopModalOpen(true)} className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 text-gray-700 dark:text-white" title="Edit Shop">✏️</button>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{shop.location} | {shop.openTime} - {shop.closeTime}</p>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()} className="relative w-full max-w-sm mt-4 md:mt-0">
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full border dark:border-gray-600 rounded-full px-4 py-2 pr-10 dark:bg-gray-700 dark:text-white"/>
                    </form>
                </div>
                
                {/* TABS */}
                <div className="flex space-x-2 border-b-2 border-gray-200 dark:border-gray-700 mb-6">
                    {['ongoing', 'completed', 'cancelled'].map(filter => (
                        <button key={filter} onClick={() => handleFilterClick(filter)} className={`relative py-3 px-4 font-semibold text-sm capitalize transition-colors ${activeFilter === filter ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                            {filter}
                            {filter === 'ongoing' && ongoingNotifCount > 0 && <span className="absolute top-1 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{ongoingNotifCount}</span>}
                            {filter === 'cancelled' && cancelledNotifCount > 0 && <span className="absolute top-1 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{cancelledNotifCount}</span>}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: ORDERS */}
                    <div className="lg:col-span-2">
                        {orders.length === 0 ? (
                            <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-xl shadow-md"><p className="text-gray-500 dark:text-gray-400">No orders here.</p></div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 relative">
                                        <div className="flex justify-between items-start border-b dark:border-gray-700 pb-4">
                                            <div>
                                                <h3 className="text-xl font-bold font-poppins dark:text-white">Order #{order.id.substring(0,5)}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{order.student.name} • {order.student.phone}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(order.orderTime).toLocaleTimeString()}</p>
                                            </div>
                                            <span className="font-bold px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">{order.status}</span>
                                        </div>
                                        <div className="py-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between py-1 dark:text-gray-300">
                                                    <span>{item.item.name} x{item.quantity}</span>
                                                    <span className="font-bold">₹{item.item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                                            {(order.status === 'PENDING' || order.status === 'PAID') && <button onClick={() => handleStatusChange(order.id, 'PREPARING')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Accept</button>}
                                            {order.status === 'PREPARING' && <button onClick={() => handleStatusChange(order.id, 'READY')} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold animate-pulse">Mark Ready</button>}
                                            {order.status === 'READY' && <button onClick={() => handleStatusChange(order.id, 'PICKED_UP')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">Complete (OTP)</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: MANAGE MENU */}
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 h-fit sticky top-24">
                        <h2 className="text-2xl font-bold font-poppins mb-4 border-b pb-3 dark:text-white">Menu</h2>
                        <form onSubmit={handleAddItem} className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <input type="text" placeholder="Item Name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full p-2 rounded border" required />
                            <input type="number" placeholder="Price (₹)" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="w-full p-2 rounded border" required />
                            <button type="submit" className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-primary-dark">+ Add Item</button>
                        </form>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.id} className={`bg-gray-50 dark:bg-gray-700 p-3 rounded-md border ${!item.availability ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <img src={item.imageUrl || 'https://placehold.co/50'} alt="" className="w-10 h-10 rounded object-cover mr-3"/>
                                            <div>
                                                <p className="font-bold dark:text-white">{item.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-300">₹{item.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingItem(item); setIsEditItemModalOpen(true); }} className="text-blue-500">✏️</button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500">🗑️</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-2 border-t dark:border-gray-600">
                                        <ToggleSwitch checked={item.availability} onChange={() => handleToggleAvailability(item)} />
                                        <button onClick={() => handleUploadClick(item.id)} className="text-xs text-blue-600 font-bold">📷 Photo</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} accept="image/*" />
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {isEditItemModalOpen && editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Item</h2>
                        <form onSubmit={handleUpdateItem} className="space-y-4">
                            <div><label className="block text-sm dark:text-gray-300">Name</label><input type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm dark:text-gray-300">Price (₹)</label><input type="number" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: e.target.value})} className="w-full p-2 border rounded" /></div>
                            <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setIsEditItemModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isShopModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Shop</h2>
                        <form onSubmit={handleUpdateShop} className="space-y-4">
                            <div><label className="block text-sm dark:text-gray-300">Name</label><input type="text" value={shopForm.name} onChange={(e) => setShopForm({...shopForm, name: e.target.value})} className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm dark:text-gray-300">Location</label><input type="text" value={shopForm.location} onChange={(e) => setShopForm({...shopForm, location: e.target.value})} className="w-full p-2 border rounded" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-sm dark:text-gray-300">Open</label><input type="time" value={shopForm.openTime} onChange={(e) => setShopForm({...shopForm, openTime: e.target.value})} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-sm dark:text-gray-300">Close</label><input type="time" value={shopForm.closeTime} onChange={(e) => setShopForm({...shopForm, closeTime: e.target.value})} className="w-full p-2 border rounded" /></div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setIsShopModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Update</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VendorDashboard;