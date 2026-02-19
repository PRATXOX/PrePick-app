import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import api from '../services/api';
import logo from '../assets/newprepick.png'; 

// StarDisplay Component (Same as before)
const StarDisplay = ({ rating }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${rating > i ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

// Feature Card Component (Same as before)
const FeatureCard = ({ icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100 hover:shadow-2xl transition-all duration-300"
    >
        <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-6 text-4xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold font-poppins mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

// --- NAVBAR UPDATE ---
function PublicNavbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        
                        {/* YEH HAI MAGIC FIX: White Drop Shadow add kiya hai */}
                        <img 
                            src={logo} 
                            alt="PrePick Logo" 
                            // drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]: Yeh logo ke peeche safed chamak layega
                            className="relative h-24 w-auto rounded-2xl border-4 border-white shadow-lg group-hover:scale-105 transition-all duration-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]" 
                        />
                    </div>
                </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-white font-semibold text-lg px-6 py-3 rounded-full hover:bg-white/10 transition-all border border-white/30 shadow-sm">
                        Login
                    </Link>
                    <Link to="/register" className="bg-white text-secondary font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all transform">
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// Animation Wrapper (Same as before)
const AnimatedSection = ({ children, from }) => {
    const variants = {
        hidden: { opacity: 0, x: from === 'left' ? -100 : 100 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={variants}
        >
            {children}
        </motion.div>
    );
};

function LandingPage() {
  const [topShops, setTopShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopShops = async () => {
      try {
        const response = await api.get('/shops/top-rated');
        setTopShops(response.data);
      } catch (error) {
        console.error("Failed to fetch top shops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopShops();
  }, []);

  const handleSearchFocus = () => {
      navigate('/login');
  };

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden font-sans">
      <PublicNavbar />

      {/* --- HERO SECTION UPDATE --- */}
      <div className="relative h-[650px] flex items-center justify-center text-center px-4">
         <div className="absolute inset-0 z-0">
            <img src="https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png" alt="Food Background" className="w-full h-full object-cover" />
            {/* YEH HAI UPDATE: Upar ka hissa aur dark kiya (from-black/90) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent"></div>
         </div>

         <div className="relative z-10 w-full max-w-4xl mx-auto mt-20">
            <motion.h1 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-8xl font-extrabold text-white font-poppins mb-6 drop-shadow-2xl tracking-tight"
            >
                PrePick
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-3xl text-gray-100 mb-12 font-medium drop-shadow-md"
            >
                Skip the Queue. <span className="text-yellow-400">Savor the Moment.</span>
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-3 rounded-2xl shadow-2xl flex items-center max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300 border-4 border-white/20"
            >
                <span className="text-red-500 text-3xl mr-4 ml-2">📍</span>
                <input 
                    type="text" 
                    placeholder="Search for your college canteen or shop..." 
                    className="flex-grow text-gray-700 text-lg outline-none font-medium placeholder-gray-400"
                    onFocus={handleSearchFocus}
                />
                <button className="hidden md:block bg-red-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-md">
                    Find Food
                </button>
            </motion.div>
         </div>
      </div>

      {/* --- FEATURES CARDS --- */}
      <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 -mt-32 relative z-20">
                  <FeatureCard 
                    icon="🚀" 
                    title="No Minimum Order" 
                    desc="Order just a samosa or a full meal. No restrictions on your cravings."
                  />
                  <FeatureCard 
                    icon="📍" 
                    title="Live Order Tracking" 
                    desc="Know exactly when your food is being prepared and when it's ready to pick up."
                  />
                  <FeatureCard 
                    icon="⚡" 
                    title="Lightning Fast Pickup" 
                    desc="Skip the long queues. Just show your order ID and grab your meal instantly."
                  />
              </div>
          </div>
      </div>

      {/* --- TOP RATED SHOPS --- */}
      <div className="py-20 container mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 font-poppins text-center">Top Rated Campus Spots</h2>
        {loading ? (
             <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {topShops.length > 0 ? topShops.map((shop, index) => (
                    <Link to="/login" key={shop.id} className="group block">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-gray-200"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={shop.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070'} 
                                    alt={shop.name} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h3 className="text-white font-bold text-xl truncate">{shop.name}</h3>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        {shop.averageRating} ★
                                    </div>
                                    <span className="text-xs text-gray-500">{shop.openTime} - {shop.closeTime}</span>
                                </div>
                                <p className="text-gray-500 text-sm truncate">{shop.location}</p>
                            </div>
                        </motion.div>
                    </Link>
                )) : <p className="text-center text-gray-500 w-full col-span-4">No rated shops yet.</p>}
            </div>
        )}
      </div>

      {/* --- DETAILED ROLE-BASED SECTIONS --- */}
      <div className="py-24 container mx-auto px-6 space-y-32">
        
        {/* For Students */}
        <AnimatedSection from="left">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>
              <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070" alt="Student receiving food" className="relative rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"/>
            </div>
            <div className="md:w-1/2 text-left">
              <span className="font-bold text-red-500 tracking-widest text-sm uppercase">For Students</span>
              <h2 className="text-5xl font-extrabold font-poppins mt-4 mb-6 text-gray-900">Never Wait in Line Again</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">Focus on your classes and friends, not the canteen queues. PrePick makes your campus life easier, faster, and more delicious.</p>
              
              <div className="space-y-6">
                  <div className="flex items-start">
                      <div className="bg-green-100 p-3 rounded-full mr-4"><span className="text-green-600 text-xl">📱</span></div>
                      <div>
                          <h4 className="font-bold text-lg">Browse & Pre-Book</h4>
                          <p className="text-gray-500 text-sm">View all campus menus with prices and images. Order from your classroom.</p>
                      </div>
                  </div>
                  <div className="flex items-start">
                      <div className="bg-blue-100 p-3 rounded-full mr-4"><span className="text-blue-600 text-xl">💳</span></div>
                      <div>
                          <h4 className="font-bold text-lg">Flexible Payments</h4>
                          <p className="text-gray-500 text-sm">Pay via UPI/QR online or choose 'Cash on Pickup'.</p>
                      </div>
                  </div>
                  <div className="flex items-start">
                      <div className="bg-purple-100 p-3 rounded-full mr-4"><span className="text-purple-600 text-xl">🔔</span></div>
                      <div>
                          <h4 className="font-bold text-lg">Live Updates</h4>
                          <p className="text-gray-500 text-sm">Get real-time notifications: Accepted → Preparing → Ready.</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* For Vendors */}
        <AnimatedSection from="right">
            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                <div className="md:w-1/2 relative">
                  <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                  <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070" alt="Vendor using a tablet" className="relative rounded-3xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"/>
                </div>
                <div className="md:w-1/2 text-left md:text-right">
                  <span className="font-bold text-blue-500 tracking-widest text-sm uppercase">For Vendors</span>
                  <h2 className="text-5xl font-extrabold font-poppins mt-4 mb-6 text-gray-900">Streamline Your Business</h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">Manage orders efficiently, reduce crowd chaos during breaks, and grow your sales with our powerful dashboard.</p>
                  
                  <div className="space-y-6">
                      <div className="flex items-start md:flex-row-reverse">
                          <div className="bg-orange-100 p-3 rounded-full md:ml-4 md:mr-0 mr-4"><span className="text-orange-600 text-xl">📊</span></div>
                          <div>
                              <h4 className="font-bold text-lg">Real-Time Dashboard</h4>
                              <p className="text-gray-500 text-sm">Receive orders instantly with sound alerts. No refreshing needed.</p>
                          </div>
                      </div>
                      <div className="flex items-start md:flex-row-reverse">
                          <div className="bg-red-100 p-3 rounded-full md:ml-4 md:mr-0 mr-4"><span className="text-red-600 text-xl">⚡</span></div>
                          <div>
                              <h4 className="font-bold text-lg">Manage Menu & Stock</h4>
                              <p className="text-gray-500 text-sm">Toggle item availability instantly if you run out of stock.</p>
                          </div>
                      </div>
                      <div className="flex items-start md:flex-row-reverse">
                          <div className="bg-green-100 p-3 rounded-full md:ml-4 md:mr-0 mr-4"><span className="text-green-600 text-xl">💰</span></div>
                          <div>
                              <h4 className="font-bold text-lg">Automated Wallet</h4>
                              <p className="text-gray-500 text-sm">Transparent earnings tracking and automated commission handling.</p>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
        </AnimatedSection>
      </div>

      {/* --- MOBILE APP SHOWCASE --- */}
      <div className="bg-red-50 py-20">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-extrabold font-poppins text-gray-800 mb-6 leading-tight">
                      Restaurants in <br/> your pocket
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                      Order from your favorite campus spots anytime, anywhere. Real-time updates, easy payments, and zero waiting time.
                  </p>
                  
                  {/* COMING SOON BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <button disabled className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center opacity-80 cursor-not-allowed hover:opacity-80">
                         <span className="mr-2"></span> Download for iOS
                         <span className="ml-2 text-xs bg-red-500 px-2 py-0.5 rounded text-white">Coming Soon</span>
                      </button>
                      <button disabled className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center opacity-80 cursor-not-allowed hover:opacity-80">
                         <span className="mr-2">🤖</span> Download for Android
                         <span className="ml-2 text-xs bg-red-500 px-2 py-0.5 rounded text-white">Coming Soon</span>
                      </button>
                  </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                  <img src="https://b.zmtcdn.com/data/o2_assets/f773629053b24263e69f601925790f301680693809.png" alt="Mobile App" className="max-w-md w-full drop-shadow-2xl"/>
              </div>
          </div>
      </div>

      <Footer />
    </div>
  );
}

export default LandingPage;