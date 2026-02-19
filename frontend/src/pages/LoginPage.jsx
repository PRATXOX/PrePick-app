import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, login } = useAuth();

  useEffect(() => {
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/shops');
      }
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(identifier, password);
      if (response.data.user.role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/shops');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };




return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900">
      <div className="flex w-full max-w-4xl h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Image Section */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981')" }}>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center text-secondary dark:text-white font-poppins">Welcome Back!</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Login to continue your delicious journey.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email or Phone</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-primary focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 text-white bg-primary rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Login
            </button>
          </form>
          <div className="text-sm text-center mt-4">
            <Link to="/forgot-password" className="font-medium text-primary-dark hover:underline">
              Forgot password?
            </Link>
          </div>
          <p className="text-sm text-center text-gray-600 mt-4 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary-dark hover:underline font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
