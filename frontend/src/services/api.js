import axios from 'axios';

// const api = axios.create({
//   // Web ke liye wapas localhost kar diya
//   baseURL: 'http://localhost:5000/api', 
// });


const api = axios.create({ baseURL: 'https://prepick-app.onrender.com' });
// Response Interceptor (Token Expire hone par logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      alert('Your session has expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;