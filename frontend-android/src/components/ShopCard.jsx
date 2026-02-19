import React from 'react';
import { useNavigate } from 'react-router-dom';

// StarDisplay component
const StarDisplay = ({ rating }) => {
    return (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${rating > i ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

function ShopCard({ shop }) {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/shop/${shop.id}`);
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg m-4 w-full max-w-sm cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden"
    >
      <img 
        src={shop.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400'}
        alt={shop.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary-dark font-poppins dark:text-primary truncate">{shop.name}</h3>
            <div className="flex items-center">
                <StarDisplay rating={shop.averageRating} />
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-semibold">{shop.averageRating}</span>
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{shop.location}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Hours: {shop.openTime} - {shop.closeTime}
        </p>
      </div>
    </div>
  );
}

export default ShopCard;

