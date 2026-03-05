// src/context/CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // 1. Yeh naya function item remove karne ke liye hai
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === itemId);
      if (existingItem.quantity === 1) {
        return prevItems.filter((i) => i.id !== itemId);
      }
      return prevItems.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };
  const updateQuantity = (id, newQuantity) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      // Agar LocalStorage use ho raha hai, toh naya data save karo:
      localStorage.setItem('cartItems', JSON.stringify(updatedItems)); 
      return updatedItems;
    });
  };


  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart, // 2. Ise yahan add karein
    clearCart,
  };

  // CHECK KARO KI KYA AAPKI AAKHIRI LINE AISI DIKHTI HAI? 👇
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};