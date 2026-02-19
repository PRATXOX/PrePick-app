import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function VendorWalletPage() {
  const [walletData, setWalletData] = useState({ walletBalance: 0, walletTransactions: [] });
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false); // Button loading state
  const { token } = useAuth();

  // 1. Data Fetch Karne ka Function
  const fetchWalletData = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/vendor/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // 2. Withdraw Logic (Paisa Bank Bhejne ki Request)
  const handleWithdraw = async () => {
    const balance = walletData.walletBalance || 0;
    
    if (balance <= 0) {
        return alert("Insufficient balance to withdraw.");
    }

    if (!window.confirm(`Are you sure you want to withdraw ₹${balance.toFixed(2)} to your bank account?`)) {
        return;
    }

    setIsWithdrawing(true);
    try {
      // Backend API call (Jo humne pichle step mein banayi thi)
      await api.post('/vendor/withdraw', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert('Withdrawal Request Sent! Admin will transfer the money shortly.');
      
      // Data refresh karo (taaki balance 0 dikhe)
      await fetchWalletData(); 
      
    } catch (error) {
      alert(error.response?.data?.error || 'Withdrawal failed. Try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) return <p className="text-center p-10 dark:text-gray-300">Loading Wallet...</p>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-extrabold font-poppins text-gray-800 dark:text-white mb-8">My Earnings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: BALANCE & WITHDRAW --- */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-2xl shadow-xl text-center sticky top-24">
              <h3 className="text-sm font-medium opacity-90 uppercase tracking-wider">Available for Payout</h3>
              
              <p className="text-5xl font-bold font-poppins mt-3 mb-1">
                ₹{(walletData.walletBalance || 0).toFixed(2)}
              </p>
              <p className="text-xs opacity-75 mb-8">Updated instantly after order completion</p>
              
              {/* Withdraw Button */}
              <button 
                onClick={handleWithdraw}
                disabled={walletData.walletBalance <= 0 || isWithdrawing}
                className="w-full bg-white text-green-800 font-bold py-3 px-4 rounded-xl shadow-md hover:bg-gray-100 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isWithdrawing ? 'Processing...' : 'Withdraw to Bank 🏦'}
              </button>
              
              <p className="text-xs mt-4 opacity-70 border-t border-green-500/30 pt-3">
                *Withdrawals are processed manually by Admin within 24 hours.
              </p>
            </div>
          </div>

          {/* --- RIGHT COLUMN: TRANSACTION HISTORY --- */}
          {/* ... Upar ka code same rahega ... */}

{/* Right Column: Transaction History */}
<div className="md:col-span-2">
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
    <h2 className="text-xl font-bold font-poppins text-gray-800 dark:text-white mb-6 flex items-center">
      📊 Recent Transactions
    </h2>
    
    <div className="space-y-4">
      {walletData.walletTransactions && walletData.walletTransactions.length > 0 ? (
        walletData.walletTransactions.map((tx) => {
          
          // --- LOGIC START: Type Pehchano ---
          const isCommission = tx.details.includes("Commission");
          const isPayout = tx.details.includes("Payout");
          const isCredit = tx.type === 'CREDIT';

          let title = "Order Earnings";
          let colorClass = "text-green-600";
          let bgClass = "bg-green-100";
          let statusText = "Success";
          let icon = (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          );

          if (isCommission) {
            title = "Platform Fee (Commission)";
            colorClass = "text-orange-600"; // Commission ke liye Orange
            bgClass = "bg-orange-100";
            statusText = "Deducted";
            icon = <span className="text-lg font-bold">📉</span>;
          } else if (isPayout) {
            title = "Payout Request";
            colorClass = "text-red-600"; // Withdrawal ke liye Red
            bgClass = "bg-red-100";
            statusText = "Processing"; // Jab tak Admin pay na kare
            // Agar Admin ne pay kar diya (details update hui thi)
            if(tx.details.includes("Completed")) statusText = "Paid ✅";
            
            icon = (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            );
          }
          // --- LOGIC END ---

          return (
            <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
              
              {/* Left: Icon & Details */}
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
                    {icon}
                </div>
                <div>
                  <p className={`font-bold text-sm ${colorClass}`}>
                     {title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx.details}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="text-right">
                <p className={`font-bold text-lg ${isCredit ? 'text-green-600' : 'text-gray-600'}`}>
                  {isCredit ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                </p>
                <span className={`text-[10px] px-2 py-1 rounded-full ${statusText === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                    {statusText}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-10">
            <p className="text-gray-400 mb-2">No transactions found.</p>
        </div>
      )}
    </div>
  </div>
</div>
          
        </div>
      </div>
    </div>
  );
}

export default VendorWalletPage;