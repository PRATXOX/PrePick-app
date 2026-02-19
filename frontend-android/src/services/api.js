import axios from 'axios';

// 👇 Yahan wo IP daalo jo tumhare error log mein dikh raha hai
// Tumhare log ke hisab se ye: 172.21.161.24 hai.
// Agar ye WSL ka IP hai aur phone connect na ho, to 'ipconfig' wala '192.168...' use karna.
const API_URL = 'http://172.21.165.21:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// --- 1. REQUEST INTERCEPTOR (Ye hai asli hero) 🦸‍♂️ ---
// Har request bhejne se pehle ye check karega ki Token hai ya nahi
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 1. Token nikalo
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 2. Header mein chipkao
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. RESPONSE INTERCEPTOR (Error Handling) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar Token expire ho gaya ya galat hai (401/403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("Session Expired. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (window.location sabse safe tareeka hai yahan)
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api; 