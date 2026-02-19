import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function VendorEarningsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!token) return;
      try {
        const response = await api.get('/vendor/earnings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(response.data);
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [token]);

  if (loading) return <p className="text-center p-10">Generating your report...</p>;
  if (!report) return <p className="text-center p-10">Could not load your earnings report.</p>;

  return (
    <div className="bg-background dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-extrabold font-poppins text-secondary dark:text-white mb-8">Earnings Report</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Sales via PrePick</h3>
            <p className="text-3xl font-bold font-poppins text-green-500 mt-2">₹{report.totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">PrePick's Commission ({report.commissionRate * 100}%)</h3>
            <p className="text-3xl font-bold font-poppins text-red-500 mt-2">₹{report.amountOwed.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Completed Orders</h3>
            <p className="text-3xl font-bold font-poppins text-blue-500 mt-2">{report.completedOrdersCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold font-poppins text-secondary dark:text-white">How Billing Works</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                At the end of each month, we will send you an invoice for the commission amount. You can pay this via bank transfer. This report helps you track all your successful sales through our platform.
            </p>
        </div>
      </div>
    </div>
  );
}

export default VendorEarningsPage;

