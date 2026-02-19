import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/newwlogo.png'; // Logo Import

function HomePage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      
      {/* Logo Area */}
      <div className="mb-8 text-center flex flex-col items-center">
        <img src={logo} alt="PrePick" className="w-32 h-32 mb-4 object-contain" />
        <h1 className="text-3xl font-extrabold text-secondary font-poppins">Welcome Back!</h1>
        <p className="text-gray-400 mt-1">Order food from your classroom.</p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="student@university.edu"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-orange-200 flex justify-center items-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Don't have an account?</p>
          <Link to="/register" className="text-primary font-bold hover:underline mt-1 inline-block">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;