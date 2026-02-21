import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 1. Ye Import zaroori hai

const Footer = () => {
  // 👇 2. YE LINE MISSING THI - Isse add karo!
  const { user } = useAuth(); 

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 font-poppins">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-extrabold text-primary flex items-center gap-2">
              🍔 PrePick
            </Link>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Order food from your campus canteens without standing in long queues. Save time, eat fresh.
            </p>
          </div>

          {/* 2. Quick Links Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li>
                {/* 👇 Ab ye code chalega kyunki 'user' defined hai */}
                {user?.role === 'VENDOR' ? (
                    <Link to="/vendor/dashboard" className="hover:text-primary transition-colors">
                        My Dashboard 🏪
                    </Link>
                ) : (
                    <Link to="/shops" className="hover:text-primary transition-colors">
                        Browse Shops 🍔
                    </Link>
                )}
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-primary transition-colors">My Orders</Link>
              </li>
            </ul>
          </div>

          {/* 3. For Business Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">For Business</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">Partner with Us</Link>
              </li>
              <li>
                <a href="mailto:sales@prepick.com" className="hover:text-primary transition-colors">Contact Sales</a>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="hover:text-primary transition-colors">Vendor Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* 4. Legal Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">Legal</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} PrePick. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm text-gray-400">
             <span>Made with ❤️ for Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;