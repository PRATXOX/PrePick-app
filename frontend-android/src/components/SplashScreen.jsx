import React from 'react';
import logo from '../assets/newwlogo.png'; // Aapka Logo import kiya

function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Animated Logo */}
      <div className="animate-bounce mb-4">
        <img 
            src={logo} 
            alt="PrePick Logo" 
            className="w-40 h-40 object-contain drop-shadow-xl" // Logo ka size
        />
      </div>
      
      {/* Brand Name (Agar logo mein text hai toh ye hata bhi sakte ho) */}
      <h1 className="text-4xl font-extrabold text-secondary tracking-tight font-poppins">
        PrePick
      </h1>

      {/* Tagline */}
      <p className="text-gray-500 text-sm mt-2 font-medium tracking-widest uppercase animate-pulse">
        Skip the Queue
      </p>

      {/* Loading Spinner (Orange color mein) */}
      <div className="absolute bottom-16">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export default SplashScreen;