import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

// Public Navbar (isi file mein, LandingPage jaisa)
function PublicNavbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/50 to-transparent">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-3xl font-extrabold font-poppins text-white tracking-tighter">PrePick 🍔</Link>
                <div className="space-x-4">
                    <Link to="/login" className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-5 rounded-full hover:bg-white/30 transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="bg-primary text-white font-semibold py-2 px-5 rounded-full hover:bg-primary-dark transition-colors">
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// Scroll animation component
const AnimatedSection = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

function FeaturesPage() {
  return (
    <div className="bg-background dark:bg-gray-900 text-secondary dark:text-gray-200">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="relative text-white text-center py-32 px-6 bg-secondary">
        <div 
            className="absolute inset-0 bg-cover bg-center filter brightness-50" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2070')" }}
        ></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold font-poppins drop-shadow-lg">One Platform, Two Worlds</h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto drop-shadow">Whether you're a hungry student or a campus vendor, PrePick is designed for you.</p>
        </div>
      </div>

      {/* For Students Section */}
      <div className="py-20 container mx-auto px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-left">
              <span className="font-bold text-primary">FOR STUDENTS</span>
              <h2 className="text-4xl font-bold font-poppins mt-2">Never Wait in Line Again</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Focus on your classes, not the queues. PrePick makes campus life easier and more delicious.</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center"><span className="text-green-500 mr-3">✔</span> Browse all campus menus in one place.</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✔</span> Order ahead and pay online or at pickup.</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✔</span> Get live updates and pick up when ready.</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img src="https://images.unsplash.com/photo-1576866209830-589e1bfd40d6?q=80&w=2070" alt="Student receiving food" className="rounded-2xl shadow-lg"/>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* For Vendors Section */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
            <AnimatedSection>
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="md:w-1/2 text-left md:text-right">
                <span className="font-bold text-primary">FOR VENDORS</span>
                <h2 className="text-4xl font-bold font-poppins mt-2">Streamline Your Business</h2>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Manage orders, update your menu, and grow your sales, all from one simple dashboard.</p>
                <ul className="mt-6 space-y-3">
                    <li className="flex items-center md:justify-end"><span className="text-green-500 mr-3 md:mr-0 md:ml-3 order-first md:order-last">✔</span> Easily manage your menu and item availability.</li>
                    <li className="flex items-center md:justify-end"><span className="text-green-500 mr-3 md:mr-0 md:ml-3 order-first md:order-last">✔</span> Receive live orders and update their status.</li>
                    <li className="flex items-center md:justify-end"><span className="text-green-500 mr-3 md:mr-0 md:ml-3 order-first md:order-last">✔</span> Reduce rush-hour chaos and increase efficiency.</li>
                </ul>
                </div>
                <div className="md:w-1/2">
                <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070" alt="Vendor using a tablet" className="rounded-2xl shadow-lg"/>
                </div>
            </div>
            </AnimatedSection>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}




export default FeaturesPage;
