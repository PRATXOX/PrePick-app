import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    // 🚨 NAYA LOGIC: Pehle bahar check karo (Popup ko setCartItems ke andar nahi rakhte)
    if (cartItems.length > 0 && cartItems[0].shopId !== item.shopId) {
      const confirmClear = window.confirm(
        "Your cart contains items from a different shop. Do you want to clear your cart and add this item?"
      );
      
      if (confirmClear) {
        // User ne 'Yes' bola -> Purana cart clear karke naya item daal do
        setCartItems([{ ...item, quantity: 1 }]);
      }
      // Agar 'No' bola toh kuch mat karo, bas wapas laut jao
      return; 
    }

    // Purana logic (agar same dukaan ka hai)
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

  // 👇 Aapka favorite clean tareeka: Ek object mein sab kuch pack karo
  const value = {
    cartItems,
    addToCart,
    removeFromCart, 
    clearCart,
    updateQuantity // 🚨 Ise bhi yahan daalna zaroori tha!
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};