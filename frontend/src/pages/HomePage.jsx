import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // 👈 1. useNavigate Import kiya
import api from '../services/api';
import ShopCard from '../components/ShopCard';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate(); // 👈 2. Navigate function banaya

  useEffect(() => {
    // 🛡️ SECURITY GUARD: Agar Vendor hai to turant wapas bhejo
    if (user && user.role === 'VENDOR') {
        navigate('/vendor/dashboard', { replace: true });
        return; // Aage ka code mat चलाओ
    }

    const searchTerm = searchParams.get('search');

    const fetchShops = async () => {
      setLoading(true);
      try {
        let url = '/shops'; 
        // Backend ke hisab se search URL set kiya
        if (searchTerm) {
          url = `/shops/search?q=${searchTerm}`;
        }
        
        const response = await api.get(url, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Sirf tab fetch karo agar user Vendor NAHI hai
    if (user && user.role !== 'VENDOR') {
        fetchShops();
    }
  }, [searchParams, user, navigate]); // navigate dependency mein add kiya

  // Agar Vendor hai toh UI render hi mat hone do (Extra Safety)
  if (user?.role === 'VENDOR') return null;

  return (
    <div className="bg-background dark:bg-gray-900 min-h-screen">
      
      {/* Hero Section with Search Banner look */}
      <div className="relative text-white text-center py-24 px-6 rounded-b-3xl overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center filter brightness-50" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')" }}></div>
        <div className="relative z-10 bg-black bg-opacity-40 backdrop-blur-sm max-w-3xl mx-auto p-8 rounded-2xl">
          <h1 className="text-5xl font-extrabold font-poppins drop-shadow-lg">Your Campus Cravings, Solved.</h1>
          <p className="mt-4 text-lg drop-shadow">Pre-book your favorite meals from {user?.university?.name || 'Campus'}!</p>
        </div>
      </div>
      
      {/* Shops Grid */}
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-secondary dark:text-gray-100">
            Shops at {user?.university?.name || 'Your Campus'}
        </h2>
        
        {loading ? (
            <div className="flex justify-center p-10">
                <p className="text-xl text-gray-500 animate-pulse">Finding best food spots...</p>
            </div>
        ) : (
            shops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
            </div>
            ) : (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xl text-gray-500 dark:text-gray-400">No shops found right now. 😕</p>
                <p className="text-sm text-gray-400">Try searching for something else!</p>
            </div>
            )
        )}
      </div>
    </div>
  );
}
export default HomePage;