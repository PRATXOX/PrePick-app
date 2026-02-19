import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

// --- STAR RATING COMPONENT ---
const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => setRating ? setRating(star) : null}
          className={`w-8 h-8 ${setRating ? 'cursor-pointer' : ''} ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
 
  // States for the QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [orderToPay, setOrderToPay] = useState(null);
 
  // States for the Review Modal
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

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 5 seconds (Simple polling)
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);
 
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('order_updated', (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Order cancelled successfully.');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel order.');
    }
  };
 
  const handlePayNowClick = async (order) => {
    try {
      const response = await api.get(`/shops/${order.shop.id}`);
      if (response.data.qrCodeUrl) {
        setQrCodeUrl(response.data.qrCodeUrl);
        setOrderToPay(order);
        setShowQRModal(true);
      } else {
        alert('This shop does not have a QR code for online payments.');
      }
    } catch (error) {
      alert('Could not fetch QR code.');
    }
  };
 
  const handleConfirmPayment = async () => {
    if (!orderToPay) return;
    try {
      await api.patch(`/orders/${orderToPay.id}/confirm-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Payment confirmed! Your order is now prioritized.');
      setShowQRModal(false);
      fetchOrders();
    } catch (error) {
      alert('Failed to confirm payment.');
    }
  };
 
  const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      READY: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-indigo-100 text-indigo-800',
      CANCELLED: 'bg-red-100 text-red-800',
  };

  const handleOpenReviewModal = (order) => {
    setOrderToReview(order);
    setShowReviewModal(true);
    setRating(0); 
    setComment(''); 
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
   
    try {
      await api.post('/reviews', {
        orderId: orderToReview.id,
        shopId: orderToReview.shop.id,
        rating: rating,
        comment: comment,
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Thank you for your review!');
      setShowReviewModal(false);
      fetchOrders(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review.');
    }
  };

  if (loading) return <p className="text-center p-10">Loading your orders...</p>;

  return (
    <>
      <div className="bg-background dark:bg-gray-900 min-h-screen pb-20">
        <div className="container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-extrabold font-poppins mb-8 text-center dark:text-white">Your Order History</h1>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                 
                  {/* --- HEADER --- */}
                  <div className="flex justify-between items-start border-b dark:border-gray-700 pb-4">
                    <div>
                      <h2 className="text-xl font-bold font-poppins dark:text-white">{order.shop?.name || 'Shop Unavailable'}</h2>
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        Ordered on: {new Date(order.orderTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`font-bold px-3 py-1 text-xs rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* --- ITEMS --- */}
                  <div className="py-4">
                    {order.items.map((orderItem) => (
                      <div key={orderItem.id} className="flex justify-between items-center py-1 dark:text-gray-300 text-sm">
                        <span>{orderItem.item?.name || 'Item Unavailable'} (x{orderItem.quantity})</span>
                        <span className="font-semibold">₹{((orderItem.item?.price || 0) * orderItem.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* --- 👇 TOTAL & OTP SECTION (YE NEW HAI) 👇 --- */}
                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                      <div>
                          <p className="text-xs text-gray-400">Total Amount</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                              {/* Total calculate kar rahe hain agar backend se totalAmount nahi aa raha */}
                              ₹{order.totalAmount || order.items.reduce((sum, i) => sum + (i.item.price * i.quantity), 0)}
                          </p>
                      </div>

                      {/* OTP BOX */}
                      {order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && order.status !== 'NO_SHOW' && (
                          <div className="text-right bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                              <p className="text-[10px] text-blue-500 dark:text-blue-300 font-bold uppercase tracking-wider">Pickup OTP</p>
                              <p className="text-2xl font-mono font-extrabold text-blue-700 dark:text-blue-400 tracking-widest leading-none mt-1">
                                  {order.pickupOtp || order.otp || "----"}
                              </p>
                          </div>
                      )}
                  </div>

                  {/* --- BUTTONS --- */}
                  <div className="flex justify-end items-center space-x-3">
                    {order.status === 'PENDING' && order.paymentMethod === 'CASH_ON_PICKUP' && (
                        <button onClick={() => handlePayNowClick(order)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">
                          Pay Now
                        </button>
                    )}
                    {order.status === 'PENDING' && (
                        <button onClick={() => handleCancelOrder(order.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
                          Cancel Order
                        </button>
                    )}
                    {order.status === 'PICKED_UP' && !order.review && (
                        <button
                          onClick={() => handleOpenReviewModal(order)}
                          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark"
                        >
                          Add Review
                        </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
     
      {/* QR MODAL */}
      {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center max-w-sm w-full">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Scan to Pay</h2>
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto border" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">After payment, click below to confirm.</p>
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-md mt-6"
              >
                I have Paid
              </button>
              <button onClick={() => setShowQRModal(false)} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md mt-4">
                Close
              </button>
            </div>
          </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-sm w-full">
            <h2 className="text-2xl font-bold font-poppins mb-4 dark:text-white text-center">Rate Your Experience</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4 flex flex-col items-center">
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Your Rating</label>
                <StarRating rating={rating} setRating={setRating} />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Add a comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="How was the food and service?"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-600 dark:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-md bg-primary text-white font-semibold">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default OrderHistoryPage;