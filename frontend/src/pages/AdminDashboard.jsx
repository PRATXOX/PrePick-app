import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [withdrawals, setWithdrawals] = useState([]);
  const { token } = useAuth();

  // Load Requests
  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/withdrawals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(res.data);
    } catch (error) {
      console.error("Failed to load", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Handle "Mark as Paid"
  const handleMarkAsPaid = async (txnId, vendorName, amount) => {
    if(!window.confirm(`Did you send ₹${amount} to ${vendorName}?`)) return;

    try {
        await api.post('/admin/approve-payout', { transactionId: txnId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert("Success! Marked as Paid.");
        fetchRequests(); // List refresh karo
    } catch (error) {
        alert("Failed to update.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-poppins">
      <h1 className="text-3xl font-bold mb-2">👮‍♂️ Admin Control Room</h1>
      <p className="text-gray-400 mb-8">Manage Payouts & Commissions</p>

      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <h2 className="p-4 bg-gray-700 font-bold border-b border-gray-600">Pending Withdrawal Requests</h2>
        
        {withdrawals.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No pending requests right now.</p>
        ) : (
            <div>
                {withdrawals.map((req) => (
                    <div key={req.id} className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center hover:bg-gray-750 transition-colors">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold text-green-400">{req.user.name}</h3>
                            <p className="text-sm text-gray-400">Shop: {req.user.shop?.name || 'Unknown'}</p>
                            <p className="font-mono text-yellow-300 mt-1">📞 GPay: {req.user.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(req.timestamp).toLocaleString()}</p>
                        </div>

                        <div className="text-right flex items-center gap-4">
                            <div className="mr-4">
                                <span className="block text-xs text-gray-400">Amount to Pay</span>
                                <span className="text-2xl font-bold text-white">₹{req.amount.toFixed(2)}</span>
                            </div>
                            
                            {/* Agar already paid hai toh button mat dikhao */}
                            {req.details.includes("Payout Completed") ? (
                                <span className="px-4 py-2 bg-green-900 text-green-300 rounded-lg text-sm border border-green-700">✅ Paid</span>
                            ) : (
                                <button 
                                    onClick={() => handleMarkAsPaid(req.id, req.user.name, req.amount)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform active:scale-95 transition-all"
                                >
                                    Mark Paid ✅
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;