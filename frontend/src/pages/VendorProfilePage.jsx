import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function VendorProfilePage() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  // States for file inputs
  const [selectedQrFile, setSelectedQrFile] = useState(null);
  const [selectedShopFile, setSelectedShopFile] = useState(null);

  const fetchShopDetails = async () => {
    if (!token) return;
    try {
      const response = await api.get('/shops/my-shop', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShop(response.data);
    } catch (error) {
      console.error('Failed to fetch shop details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [token]);

  const handleQrUpload = async (e) => {
    e.preventDefault();
    if (!selectedQrFile) return alert('Please select a QR code image first.');
    
    const formData = new FormData();
    formData.append('qrImage', selectedQrFile);

    try {
      const response = await api.post('/upload/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setShop(response.data); // Update shop with new QR URL
      setSelectedQrFile(null);
      alert('QR Code uploaded successfully!');
    } catch (error) {
      alert('Failed to upload QR code.');
    }
  };
  
  const handleShopImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedShopFile) return alert('Please select a shop image first.');

    const formData = new FormData();
    formData.append('shopImage', selectedShopFile);

    try {
      const response = await api.post('/shops/my-shop/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setShop(response.data); // Update shop with new image URL
      setSelectedShopFile(null);
      alert('Shop image uploaded successfully!');
    } catch (error) {
      alert('Failed to upload shop image.');
    }
  };
   





  if (loading) return <p className="text-center p-10">Loading...</p>;
  if (!shop) return <p className="text-center p-10">Shop not found. Please create one from the registration page.</p>;

  return (
    <div className="bg-background dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center font-poppins dark:text-white">Manage Your Shop</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Shop Image Management */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold font-poppins mb-4 text-secondary dark:text-white">Shop Display Image</h2>
            <img 
              src={shop.imageUrl || 'https://placehold.co/500x300/e2e8f0/333333?text=No+Image'} 
              alt="Shop"
              className="w-full h-48 object-cover rounded-lg mb-4 flex-grow"
            />
            <form onSubmit={handleShopImageUpload} className="mt-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload new image</label>
              <input 
                type="file" 
                onChange={(e) => setSelectedShopFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-dark hover:file:bg-primary/30"
                accept="image/*"
              />
              {selectedShopFile && <p className="text-xs text-center mt-1 dark:text-gray-400">{selectedShopFile.name}</p>}
              <button type="submit" disabled={!selectedShopFile} className="w-full mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
                Upload Shop Image
              </button>

            
            </form>
          </div>


        

          {/* QR Code Management */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold font-poppins mb-4 text-secondary dark:text-white">Payment QR Code</h2>
            <img 
              src={shop.qrCodeUrl || 'https://placehold.co/300x300/e2e8f0/333333?text=No+QR'} 
              alt="QR Code" 
              className="w-48 h-48 object-cover rounded-lg mb-4 mx-auto border-2 flex-grow" 
            />
            <form onSubmit={handleQrUpload} className="mt-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload new QR code</label>
              <input 
                type="file" 
                onChange={(e) => setSelectedQrFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-dark hover:file:bg-primary/30"
                accept="image/*"
              />
              {selectedQrFile && <p className="text-xs text-center mt-1 dark:text-gray-400">{selectedQrFile.name}</p>}
              <button type="submit" disabled={!selectedQrFile} className="w-full mt-4 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-400">
                Upload QR Code
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default VendorProfilePage;

