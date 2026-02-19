import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

// 1. Script Load Helper
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} onClick={() => setRating ? setRating(star) : null} className={`w-8 h-8 ${setRating ? 'cursor-pointer' : ''} ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  
  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('order_updated', (updatedOrder) => {
      setOrders(prevOrders => prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    });
    return () => socket.disconnect();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Order cancelled successfully.');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel order.');
    }
  };

  // --- 🔥 PAY NOW LOGIC 🔥 ---
  const handlePayNow = async (order) => {
    const res = await loadRazorpayScript();
    if (!res) return alert('Razorpay failed to load.');

    const totalAmount = order.items.reduce((acc, i) => acc + ((i.item?.price || 0) * i.quantity), 0);
    const options = {
        key: "rzp_test_RvWqIB6hNIoWAg", // ✅ Tumhari Key ID
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "PrePick Payment",
        description: `Order #${order.id.substring(0,5)}`,
        handler: async function (response) {
            try {
                await api.patch(`/orders/${order.id}/confirm-payment`, {
                    paymentId: response.razorpay_payment_id
                }, { headers: { Authorization: `Bearer ${token}` } });

                alert("Payment Successful! Order updated to ONLINE.");
                fetchOrders();
            } catch (error) {
                alert("Payment verified but failed to update order.");
            }
        },
        prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone
        },
        theme: { color: "#22c55e" }
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // --- Review Handlers ---
  const handleOpenReviewModal = (order) => {
    setOrderToReview(order);
    setShowReviewModal(true);
    setRating(0); setComment(''); 
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
    try {
      await api.post('/reviews', {
        orderId: orderToReview.id,
        shopId: orderToReview.shop.id,
        rating, comment,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Thank you for your review!');
      setShowReviewModal(false);
      fetchOrders(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review.');
    }
  };
  
  const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      READY: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-indigo-100 text-indigo-800',
      CANCELLED: 'bg-red-100 text-red-800',
  };

  if (loading) return <p className="text-center p-10">Loading orders...</p>;

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-extrabold font-poppins mb-8 text-center dark:text-white">Your Order History</h1>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold font-poppins dark:text-white">{order.shop?.name}</h2>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.orderTime).toLocaleDateString()} at {new Date(order.orderTime).toLocaleTimeString()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Method: <span className="font-semibold">{order.paymentMethod === 'CASH_ON_PICKUP' ? 'Cash' : 'Online'}</span>
                      </p>
                    </div>
                    <span className={`font-bold px-3 py-1 text-xs rounded-full ${statusStyles[order.status]}`}>{order.status}</span>
                  </div>

                  {/* Items */}
                  <div className="py-4 border-b">
                    {order.items.map((orderItem) => (
                      <div key={orderItem.id} className="flex justify-between py-1 text-sm dark:text-gray-300">
                        <span>{orderItem.item?.name} x{orderItem.quantity}</span>
                        <span className="font-semibold">₹{((orderItem.item?.price || 0) * orderItem.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* 👇 HERE IS THE OTP SECTION 👇 */}
                  {['PENDING', 'PREPARING', 'READY', 'PAID'].includes(order.status) && (
                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-xl text-center flex flex-col items-center justify-center">
                          <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider">Secret Pickup Code</p>
                          <p className="text-3xl font-mono font-black text-blue-800 dark:text-blue-400 tracking-[0.5em] mt-1">
                              {order.pickupOtp || '----'}
                          </p>
                          <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">Show this code to vendor for pickup</p>
                      </div>
                  )}
                  {/* 👆 OTP SECTION END 👆 */}

                  {/* Footer & Buttons */}
                  <div className="flex justify-between items-center mt-4">
                     <p className="font-bold text-lg dark:text-white">Total: ₹{order.items.reduce((acc, i) => acc + ((i.item?.price || 0) * i.quantity), 0).toFixed(2)}</p>

                     <div className="flex space-x-3">
                        {order.status === 'PENDING' && (
                            <>
                                <button onClick={() => handleCancelOrder(order.id)} className="text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-50">
                                  Cancel
                                </button>
                                
                                {/* PAY NOW BUTTON (Cash Order Only) */}
                                {order.paymentMethod === 'CASH_ON_PICKUP' && (
                                    <button 
                                        onClick={() => handlePayNow(order)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg"
                                    >
                                        Pay Online ⚡
                                    </button>
                                )}
                            </>
                        )}

                        {order.status === 'PICKED_UP' && !order.review && (
                            <button onClick={() => handleOpenReviewModal(order)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
                              Add Review
                            </button>
                        )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Rate Your Meal</h2>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4 flex justify-center"><StarRating rating={rating} setRating={setRating} /></div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3" className="w-full p-2 border rounded" placeholder="Comment..."></textarea>
                  <div className="flex justify-end mt-4 gap-2">
                    <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
                  </div>
                </form>
             </div>
        </div>
      )}
    </>
  );
}

export default OrderHistoryPage;