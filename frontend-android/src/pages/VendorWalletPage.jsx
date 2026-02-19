import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function VendorWalletPage() {
  const [walletData, setWalletData] = useState({ walletBalance: 0, walletTransactions: [] });
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const { token } = useAuth();

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

  // YEH HAI DEMO TOP-UP FUNCTION
  // Yeh seedha backend ko bolta hai ki paise add kar do
  // YEH HAI UPDATED DEMO TOP-UP FUNCTION
  const handleDemoTopUp = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      return alert('Please enter a valid amount.');
    }

    try {
      await api.post('/vendor/wallet/topup', { amount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert(`Success! ₹${amount} added to your wallet (Demo Mode).`);
      setTopUpAmount('');
      
      // Yahan humne 'await' lagaya hai taaki naya data aane tak intezaar kare
      await fetchWalletData(); 
      
    } catch (error) {
      alert('Top-up failed. Please try again.');
    }
  };

  if (loading) return <p className="text-center p-10 dark:text-gray-300">Loading Wallet...</p>;

  return (
    <div className="bg-background dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-extrabold font-poppins text-secondary dark:text-white mb-8">My Wallet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Balance and Top-up */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Balance</h3>
              <p className="text-5xl font-bold font-poppins text-primary-dark mt-2">₹{(walletData.walletBalance || 0).toFixed(2)}</p>
              
              <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> This is a Demo Mode. Money will be added instantly for testing.
                    </p>
                </div>
                
                <form onSubmit={handleDemoTopUp}>
                    <h4 className="font-semibold mb-2 dark:text-white">Add Demo Balance</h4>
                    <input 
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="e.g., 500"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    />
                    <button type="submit" className="w-full mt-3 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Add Money (Demo)
                    </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction History */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold font-poppins text-secondary dark:text-white mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {walletData.walletTransactions && walletData.walletTransactions.length > 0 ? walletData.walletTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                    <div>
                      <p className={`font-semibold ${tx.type === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>{tx.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tx.details}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.type === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
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