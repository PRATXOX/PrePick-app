import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CartPage() {
  // 👇 Yahan humne 'updateQuantity' ko bhi import kar liya
  const { cartItems, clearCart, removeFromCart, updateQuantity } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCodBlocked, setIsCodBlocked] = useState(false);

  // --- 🆕 PLUS/MINUS LOGIC ---
  // --- 🆕 PLUS/MINUS LOGIC (FIXED) ---
  const handleQuantityChange = (item, change) => {
    // Isko pakka Number bana diya taaki "1" + 1 = 2 ho
    const currentQty = Number(item.quantity) || 1; 

    // Agar quantity 1 hai aur user minus (-) dabata hai
    if (change === -1 && currentQty === 1) {
      const confirmRemove = window.confirm("Are you sure you want to remove this item?");
      if (confirmRemove) {
        removeFromCart(item.id);
      }
    } else {
      // Normal plus ya minus
      updateQuantity(item.id, currentQty + change);
    }
  };

  // --- 💰 PRICE CALCULATIONS ---
  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0; 
    return total + (item.quantity * price);
  }, 0);

  const platformFee = 5.00;
  const cashHandlingFee = 10.00;

  const totalForOnline = subtotal + platformFee; 
  const totalForCash = subtotal + platformFee + cashHandlingFee;
  const totalSavings = cashHandlingFee;

  useEffect(() => {
      const checkUserStatus = async () => {
          try {
              const response = await api.get('/users/me', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              if (response.data.noShowCount >= 3) setIsCodBlocked(true);
          } catch (error) { console.error("Status check failed", error); }
      };
      if(token) checkUserStatus();
  }, [token]);

  // --- A. CASH ORDER FUNCTION ---
  const placeCodOrder = async () => {
    if (!token) return alert("Please Login first.");
    if (isCodBlocked) return alert("COD blocked due to missed orders. Please Pay Online.");

    if(!window.confirm(`⚠️ You are paying ₹${totalForCash.toFixed(2)} (Includes ₹10 Cash Fee & ₹5 Platform Fee).\n\nPay Online to save ₹${totalSavings}?\n\nPress OK to continue with Cash.`)) {
        return;
    }
    
    setIsProcessing(true);
    try {
        const orderData = {
          shopId: cartItems[0].shopId,
          items: cartItems.map(item => ({ itemId: item.id, quantity: item.quantity })),
          pickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          paymentMethod: 'CASH_ON_PICKUP',
          totalAmount: totalForCash  
        };
        
        await api.post('/orders', orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        alert('Order placed successfully! Please pay cash at the counter.');
        clearCart();
        navigate('/my-orders');

    } catch (error) {
        alert(error.response?.data?.error || 'Failed to place order.');
    } finally { 
        setIsProcessing(false); 
    }
  };

  // --- B. ONLINE PAYMENT FUNCTION ---
  const handleOnlinePayment = async () => {
    setIsProcessing(true);
    const res = await loadRazorpayScript();
    if (!res) {
        alert('Razorpay SDK failed to load.');
        setIsProcessing(false);
        return;
    }

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const orderRes = await api.post('/payment/create-order', { amount: totalForOnline }, config);
        const { id: order_id, amount, currency } = orderRes.data; 

        const options = {
            key: "rzp_test_RvWqIB6hNIoWAg", 
            amount: amount,
            currency: currency,
            name: "PrePick Campus",
            description: `You saved ₹${totalSavings} cash fee!`, 
            order_id: order_id, 
            handler: async function (response) {
              try {
                  const verifyRes = await api.post('/payment/verify', {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      cartItems: cartItems,
                      shopId: cartItems[0].shopId,
                      pickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                      totalAmount: totalForOnline 
                  }, config);

                  if(verifyRes.status === 200) {
                      alert(`Payment Successful! You saved ₹${totalSavings}.`);
                      clearCart();
                      navigate('/my-orders');
                  }
              } catch (err) {
                  alert("Payment verified but order creation failed. Contact Admin.");
              }
            },
            prefill: { name: user?.name, email: user?.email, contact: user?.phone },
            theme: { color: "#10B981" } 
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert("Session expired. Please Login again.");
            navigate('/');
        } else {
            alert("Payment initialization failed.");
        }
    } finally {
        setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center p-10 bg-background min-h-screen">
        <h1 className="text-3xl font-bold font-poppins">Your Cart is Empty</h1>
        <Link to="/shops" className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-4xl font-extrabold font-poppins mb-6 dark:text-white">Your Cart</h1>
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
              
              <div className="flex-grow ml-4">
                <h2 className="text-lg font-bold dark:text-white">{item.name}</h2>
                
                {/* 🆕 PLUS / MINUS BUTTONS UI */}
                <div className="flex items-center space-x-3 mt-2">
                  <button 
                    onClick={() => handleQuantityChange(item, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-800 dark:text-white w-4 text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(item, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-600 dark:text-gray-300 hover:bg-green-100 hover:text-green-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs mt-2 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary (The Business Part) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sticky top-24 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold border-b dark:border-gray-700 pb-4 dark:text-white">Bill Details</h2>
            
            <div className="space-y-3 my-4 text-sm">
              <div className="flex justify-between dark:text-gray-300">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-green-600 font-medium">
                  <span>Platform Fee</span>
                  <span>+ ₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="bg-green-100 text-green-800 p-2 rounded-lg text-xs text-center font-bold border border-green-200 mt-2">
                  🎉 Pay Online to Save ₹{totalSavings} Cash Fee!
              </div>

              <div className="border-t border-dashed my-2 dark:border-gray-600"></div>

              <div className="flex justify-between items-center text-green-600 font-bold text-lg">
                  <span>Total (Online)</span>
                  <span>₹{totalForOnline.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-gray-400 text-xs mt-1">
                  <span>Total (Cash) incl. ₹10 penalty</span>
                  <span className="line-through decoration-red-500">₹{totalForCash.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <button 
                onClick={handleOnlinePayment} 
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-green-800 transform active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                 {isProcessing ? 'Processing...' : `⚡ Pay ₹${totalForOnline.toFixed(2)} Online`}
              </button>

              <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <button 
                onClick={placeCodOrder} 
                disabled={isProcessing || isCodBlocked}
                className={`w-full py-3 rounded-xl font-semibold border text-sm transition-colors
                    ${isCodBlocked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    }`}
              >
                {isCodBlocked ? 'COD Blocked 🚫' : `Pay ₹${totalForCash.toFixed(2)} with Cash`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CartPage;