// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.post('/auth/forgot-password', { identifier });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <p className="text-center text-sm text-gray-600">Enter your email or phone number and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-md">
            Send Reset Link
          </button>
        </form>
         <p className="text-sm text-center text-gray-600">
          Remembered your password? <Link to="/" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;


















