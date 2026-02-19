import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// Naya Star Rating Display Component
const StarDisplay = ({ rating, count }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {hasHalfStar && <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
            {[...Array(emptyStars)].map((_, i) => <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {count > 0 && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({count} reviews)</span>}
        </div>
    );
};
// ItemCard component ko yahan update karein
function ItemCard({ item, onAddToCart }) {
  const isAvailable = item.availability; // Check karein ki item available hai ya nahi

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 ${isAvailable ? 'transform hover:scale-105' : 'opacity-60'}`}>
      
      {/* "Sold Out" ka Tag */}
      {!isAvailable && (
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
          SOLD OUT
        </div>
      )}

      <img 
        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780'} 
        alt={item.name}
        className={`w-full h-48 object-cover ${!isAvailable ? 'grayscale' : ''}`} // Image ko grey karein
      />
      <div className="p-4">
        <h3 className="text-xl font-bold font-poppins text-secondary dark:text-gray-200">{item.name}</h3>
        <p className="text-lg font-semibold text-primary-dark mt-1">₹{item.price}</p>
        <button 
          onClick={() => onAddToCart(item)}
          disabled={!isAvailable} // Button ko disable karein
          className="w-full mt-4 py-2 text-white bg-primary rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-primary-dark"
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}


function ShopMenuPage() {
  const { shopId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;
      try {
        const [menuRes, reviewsRes] = await Promise.all([
          api.get(`/shops/${shopId}/menu`),
          api.get(`/shops/${shopId}/reviews`)
        ]);
        setMenuItems(menuRes.data.menu);
        setShop(menuRes.data.shop);
        setReviewsData(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shopId]);

  if (loading) return <p className="text-center p-10 dark:text-gray-300">Loading shop...</p>;

  return (
    <div className="bg-background dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold font-poppins text-secondary dark:text-gray-100">{shop?.name || 'Shop'}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{shop?.location}</p>
          <div className="flex justify-center items-center mt-4">
            <span className="font-bold text-xl mr-2 dark:text-white">{reviewsData.averageRating}</span>
            <StarDisplay rating={reviewsData.averageRating} count={reviewsData.reviews.length} />
          </div>
        </div>

        {/* <h2 className  = " col-end-auto *:"></h2> */}

        <h2 className="text-2xl font-bold font-poppins mb-6 dark:text-white">Menu</h2>
        {menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780'} alt={item.name} className="w-full h-48 object-cover"/>
                <div className="p-4">
                  <h3 className="text-xl font-bold font-poppins text-secondary dark:text-gray-200">{item.name}</h3>
                  <p className="text-lg font-semibold text-primary-dark mt-1">₹{item.price}</p>
                  <button onClick={() => addToCart({ ...item, shopId: shop.id })} className="w-full mt-4 py-2 text-white bg-primary rounded-lg font-semibold hover:bg-primary-dark transition-colors">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No items available in this shop.</p>
        )}
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold font-poppins mb-6 dark:text-white">What Students Are Saying</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {reviewsData.reviews.length > 0 ? reviewsData.reviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <p className="font-semibold dark:text-white">{review.author.name}</p>
                  <div className="ml-auto">
                    <StarDisplay rating={review.rating} />
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
              </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400">No reviews yet for this shop.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ShopMenuPage;

