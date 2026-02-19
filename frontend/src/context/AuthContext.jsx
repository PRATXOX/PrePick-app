import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Yeh line zaroori hai Navbar error hatane ke liye
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authLoading, setAuthLoading] = useState(true);
  
  // YEH HAI WO SPECIAL STATE: Selected University ID
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        
        // Agar user pehle se registered hai kisi University mein, to wahi select karo
        if (parsedUser.universityId) {
          setSelectedUniversityId(parsedUser.universityId);
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setAuthLoading(false);
  }, []);

  const login = async (identifier, password) => {
    // API call backend ko
    const response = await api.post('/auth/login', { identifier, password });
    
    // Response se data nikalo
    const { token, user } = response.data;

    // State update karo
    setToken(token);
    setUser(user);
    
    // Login karte hi user ki university set karein
    if (user.universityId) {
      setSelectedUniversityId(user.universityId);
    } // <--- YAHAN TUMHARA PURANA CODE TOOTA HUA THA (Bracket Miss tha)

    // LocalStorage mein save karo
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedUniversityId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Logout ke baad Home par bhejo
  };
  
  // University change karne ka function (Student Dashboard ke liye)
  const changeUniversity = (newUniversityId) => {
    setSelectedUniversityId(newUniversityId);
  };

  const value = { 
    user, 
    token,
    authLoading, 
    login, 
    logout,
    selectedUniversityId, // Export new state
    changeUniversity      // Export new function
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;