import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // --- MODIFIED ADD TO CART (Shop Lock Logic 🔒) ---
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      // 1. Agar Cart khaali hai, toh bindass add karo
      if (prevItems.length === 0) {
        return [{ ...item, quantity: 1 }];
      }

      // 2. Check karo ki nayi item usi shop ki hai kya?
      const currentShopId = prevItems[0].shopId;
      
      if (currentShopId !== item.shopId) {
        // 3. Agar alag shop hai, toh User se pucho
        const confirmChange = window.confirm(
            "⚠️ You can only order from one shop at a time.\n\nDo you want to clear your current cart and start a new order from this shop?"
        );

        if (confirmChange) {
            // Purana saaf karo aur naya add karo
            return [{ ...item, quantity: 1 }];
        } else {
            // User ne mana kiya, purana cart waise hi rakho
            return prevItems;
        }
      }

      // 4. Agar same shop hai, toh quantity badhao (Normal Logic)
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === itemId);
      if (existingItem?.quantity === 1) {
        return prevItems.filter((i) => i.id !== itemId);
      }
      return prevItems.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};