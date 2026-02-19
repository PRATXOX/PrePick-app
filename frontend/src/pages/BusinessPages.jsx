import React from 'react';
import { Link } from 'react-router-dom';

// 1. Partner With Us Page
export const PartnerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins pt-20 px-6 pb-10">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-10 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Grow with PrePick 🚀</h1>
          <p className="text-white/90 text-lg">Join the fastest growing campus food network.</p>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold dark:text-white">Zero Commission</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">First month is completely free for new vendors.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold dark:text-white">Fast Payouts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get your earnings directly in your bank every week.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold dark:text-white">Easy Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage menu and orders from a simple dashboard.</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Ready to start?</h2>
            <Link to="/register" className="inline-block bg-primary hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full transition-transform transform hover:scale-105 shadow-lg">
              Register as Vendor Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Contact Sales Page
export const ContactSalesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins pt-20 px-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Contact Sales Team 💼</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Want to bring PrePick to your University? Fill out the form below or call us directly.
        </p>

        <form className="space-y-4">
          <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <input type="email" placeholder="Official Email" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <input type="text" placeholder="University/College Name" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <textarea rows="4" placeholder="How can we help you?" className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
          
          <button className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800">
            Send Inquiry
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Or email us directly at <a href="mailto:sales@prepick.com" className="text-primary font-bold">sales@prepick.com</a>
        </div>
      </div>
    </div>
  );
};