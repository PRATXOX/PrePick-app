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
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();
    
    const [activeFilter, setActiveFilter] = useState('ongoing');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const [ongoingNotifCount, setOngoingNotifCount] = useState(0);
    const [cancelledNotifCount, setCancelledNotifCount] = useState(0);

    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemToUpdateId, setItemToUpdateId] = useState(null);
    const fileInputRef = useRef(null);
    
    // Fetch Shop Details
    useEffect(() => {
        const fetchShopDetails = async () => {
            if (!token) return;
            try {
                const response = await api.get('/shops/my-shop', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setShop(response.data);
            } catch (error) {
                console.error('Error fetching shop details:', error);
            }
        };
        fetchShopDetails();
    }, [token]);

    // Fetch Orders and Items
    const fetchData = useCallback(async (filter, query) => {
        if (!token) return;
        setLoading(true);
        try {
            let ordersUrl = `/orders/vendor?status=${filter}`;
            if (query) {
                ordersUrl = `/orders/vendor/search?q=${query}&status=${filter}`;
            }
            
            const [ordersRes, itemsRes] = await Promise.all([
                api.get(ordersUrl, { headers: { Authorization: `Bearer ${token}` } }),
                api.get('/items/my-items', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            
            setOrders(ordersRes.data);
            setItems(itemsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData(activeFilter, debouncedSearchTerm);
    }, [activeFilter, debouncedSearchTerm, fetchData]);

    // Socket.IO Connection
    useEffect(() => {
        // const socket = io('http://localhost:5000');
        const socket = io('https://prepick-app.onrender.com');
        
        socket.on('new_order', (newOrderData) => {
            if (activeFilter === 'ongoing') {
               setOrders(prevOrders => [newOrderData, ...prevOrders]);
            }
            setOngoingNotifCount(prevCount => prevCount + 1);
        });

        socket.on('order_updated', (updatedOrderData) => {
            fetchData(activeFilter, debouncedSearchTerm);
            if (updatedOrderData.status === 'CANCELLED') {
                setCancelledNotifCount(prevCount => prevCount + 1);
            }
        });

        return () => socket.disconnect();
    }, [activeFilter, debouncedSearchTerm, fetchData]);
    
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        if (filter === 'ongoing') {
            setOngoingNotifCount(0);
        } else if (filter === 'cancelled') {
            setCancelledNotifCount(0);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/items', { name: itemName, price: parseFloat(itemPrice) }, { headers: { Authorization: `Bearer ${token}` } });
            setItems(prev => [res.data, ...prev]);
            setItemName(''); setItemPrice('');
            alert('Item added!');
        } catch (error) { alert('Failed to add item.'); }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/items/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
            setItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) { alert('Failed to delete item.'); }
    };
    
    const handleUploadClick = (itemId) => {
        setItemToUpdateId(itemId);
        fileInputRef.current.click();
    };

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
            alert('Image uploaded successfully!');
        } catch (error) {
            alert('Failed to upload image.');
        } finally {
            setItemToUpdateId(null);
            if(fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) { alert(error.response?.data?.error || 'Failed to update status.'); }
    };

    const handleToggleAvailability = async (item) => {
        const newAvailability = !item.availability;
        try {
            await api.put(`/items/${item.id}`, { availability: newAvailability }, { headers: { Authorization: `Bearer ${token}` } });
            setItems(prevItems => 
                prevItems.map(i => i.id === item.id ? { ...i, availability: newAvailability } : i)
            );
        } catch (error) {
            alert('Failed to update item availability.');
        }
    };

    if (loading && !shop) return <p className="text-center mt-8 dark:text-gray-300">Loading dashboard...</p>;

    return (
        <div className="bg-background min-h-screen dark:bg-gray-900">
            <div className="container mx-auto p-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-extrabold font-poppins text-secondary dark:text-white">
                            {shop ? `Welcome, ${shop.name} 👋` : 'Vendor Dashboard'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your orders and menu in one place.</p>
                    </div>
                    
                    <form onSubmit={(e) => e.preventDefault()} className="relative w-full max-w-sm mt-4 md:mt-0">
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by item or student..." className="w-full border dark:border-gray-600 rounded-full px-4 py-2 pr-10 dark:bg-gray-700 dark:text-white"/>
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="p-2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>}
                        </div>
                    </form>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-2 border-b-2 border-gray-200 dark:border-gray-700 mb-6">
                    <button onClick={() => handleFilterClick('ongoing')} className={`relative py-3 px-4 font-semibold text-sm transition-colors ${activeFilter === 'ongoing' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        Ongoing
                        {ongoingNotifCount > 0 && <span className="absolute top-1 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{ongoingNotifCount}</span>}
                    </button>
                    <button onClick={() => handleFilterClick('completed')} className={`py-3 px-4 font-semibold text-sm transition-colors ${activeFilter === 'completed' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Completed</button>
                    <button onClick={() => handleFilterClick('cancelled')} className={`relative py-3 px-4 font-semibold text-sm transition-colors ${activeFilter === 'cancelled' ? 'border-b-2 border-primary text-primary dark:text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        Cancelled
                        {cancelledNotifCount > 0 && <span className="absolute top-1 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{cancelledNotifCount}</span>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Orders */}
                    <div className="lg:col-span-2">
                        {orders.length === 0 ? (
                            <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-xl shadow-md">
                                <p className="text-gray-500 dark:text-gray-400">No orders in this category.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                                        <div className="flex justify-between items-start border-b dark:border-gray-700 pb-4">
                                            <div>
                                                <h3 className="text-xl font-bold font-poppins dark:text-white">Order for: {order.student.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Contact: {order.student.phone}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Ordered: {new Date(order.orderTime).toLocaleString()}</p>
                                            </div>
                                            <span className={`font-bold px-3 py-1 text-sm rounded-full 
                                                ${order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                                                  order.status === 'NO_SHOW' ? 'bg-gray-300 text-gray-800' :
                                                  order.status === 'READY' ? 'bg-orange-100 text-orange-800' :
                                                  order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="py-4">
                                            {order.items.map((orderItem) => (
                                                <div key={orderItem.id} className="flex justify-between items-center py-1 dark:text-gray-300">
                                                    <span>{orderItem.item.name} (x{orderItem.quantity})</span>
                                                    <span className="font-semibold">₹{((orderItem.item.price * orderItem.quantity).toFixed(2))}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* --- UPDATED ACTION BUTTONS --- */}
                                        <div className="flex flex-col md:flex-row gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                                            
                                            {/* CASE 1: New Order (PENDING or PAID) */}
                                            {(order.status === 'PENDING' || order.status === 'PAID') && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
                                                    >
                                                        👨‍🍳 Accept & Cook
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {/* CASE 2: Preparing */}
                                            {order.status === 'PREPARING' && (
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'READY')}
                                                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-orange-600 shadow-md animate-pulse"
                                                >
                                                    🔔 Mark Food Ready
                                                </button>
                                            )}

                                            {/* CASE 3: Ready for Pickup */}
                                            {order.status === 'READY' && (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <p className="text-xs text-center text-green-600 font-bold">Waiting for Student...</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(order.id, 'PICKED_UP')}
                                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-700 shadow-md"
                                                        >
                                                            ✅ Complete Order
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(order.id, 'NO_SHOW')}
                                                            className="px-3 bg-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-300 text-xs"
                                                            title="Student did not come"
                                                        >
                                                            ❌ Didn't Come
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Manage Items */}
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 h-fit sticky top-24">
                        <h2 className="text-2xl font-bold font-poppins mb-4 border-b dark:border-gray-700 pb-3 dark:text-white">Manage Menu</h2>
                        <form onSubmit={handleAddItem} className="space-y-4 mb-6">
                            <h3 className="text-lg font-semibold dark:text-gray-200">Add New Item</h3>
                            <div className="dark:text-gray-300">
                                <label className="block text-sm font-medium">Item Name</label>
                                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="mt-1 block w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700" required />
                            </div>
                            <div className="dark:text-gray-300">
                                <label className="block text-sm font-medium">Price (₹)</label>
                                <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="mt-1 block w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700" required />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark">Add to Menu</button>
                        </form>
                        <h3 className="text-lg font-bold mb-4 dark:text-gray-200">Your Items</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {items.length > 0 ? items.map(item => (
                                <div key={item.id} className={`bg-gray-50 dark:bg-gray-700 p-3 rounded-md ${!item.availability ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center">
                                        <img src={item.imageUrl || 'https://placehold.co/60x60/e2e8f0/333333?text=No+Img'} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-4"/>
                                        <div className="flex-grow dark:text-gray-300">
                                            <span className="font-semibold">{item.name}</span>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">₹{item.price}</p>
                                        </div>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold p-2">Delete</button>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-600">
                                        <ToggleSwitch 
                                            checked={item.availability}
                                            onChange={() => handleToggleAvailability(item)}
                                        />
                                        <button onClick={() => handleUploadClick(item.id)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold p-2">
                                            Upload Image
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 dark:text-gray-400">No items added yet.</p>}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} accept="image/*" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorDashboard;