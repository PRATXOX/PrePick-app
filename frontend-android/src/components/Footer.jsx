import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-secondary dark:bg-gray-800 text-gray-300">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <h1 className="text-3xl font-extrabold font-poppins text-white tracking-tighter">PrePick 🍔</h1>
            <p className="mt-4 text-sm text-gray-400">Your campus food, simplified.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold font-poppins text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shops" className="hover:text-primary">Browse Shops</Link></li>
              <li><Link to="/register" className="hover:text-primary">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-primary">Login</Link></li>
            </ul>
          </div>

          {/* Column 3: For Business */}
          <div>
            <h4 className="font-bold font-poppins text-white mb-4">For Business</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-primary">Partner with Us</Link></li>
              <li><Link to="#" className="hover:text-primary">Contact Sales</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-bold font-poppins text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-400">© 2025 PrePick. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social Media Icons */}
            <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.163C8.74 1 8.333.991 7.053.935c-3.626-.165-5.912 2.119-6.077 5.744-.057 1.281-.067 1.651-.067 4.321s.01 3.04.067 4.321c.165 3.626 2.451 5.912 6.077 5.744 1.28.057 1.65.067 4.947.067s3.667-.01 4.947-.067c3.626-.165 5.912-2.119 6.077-5.744.057-1.281.067-1.651.067-4.321s-.01-3.04-.067-4.321c-.165-3.626-2.451-5.912-6.077-5.744C15.667.991 15.26 1 12 1zm0 5.838a5 5 0 100 10 5 5 0 000-10zm0 8.838a3.838 3.838 0 110-7.676 3.838 3.838 0 010 7.676zm4.42-9.238a1.232 1.232 0 100-2.464 1.232 1.232 0 000 2.464z"></path></svg></a>
            <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.49-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.72-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.58-.7-.02-1.36-.21-1.94-.53v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.52 8.52 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.72 21 8.12 21c7.75 0 11.99-6.42 11.99-12 0-.18 0-.37-.01-.55.83-.6 1.54-1.36 2.11-2.22z"></path></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
