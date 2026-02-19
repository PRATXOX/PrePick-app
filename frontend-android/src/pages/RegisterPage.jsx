import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';

function RegisterPage() {
    // --- States ---
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('STUDENT'); // Default Student
    
    // Vendor specific states
    const [shopName, setShopName] = useState('');
    const [location, setLocation] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');
    
    // University Search States
    const [universities, setUniversities] = useState([]); // Database wali list yahan aayegi
    const [newUniversityName, setNewUniversityName] = useState(''); // Jo select/type karega
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Error & Validation States
    const [error, setError] = useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    
    const debouncedUsername = useDebounce(username, 500);
    const navigate = useNavigate();

    // --- EFFECTS ---

    // 1. Fetch Universities from Backend (Page Load hote hi)
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await api.get('/universities'); // Backend ko call
                setUniversities(response.data); // State update
                console.log("Live Universities Fetched:", response.data.length); 
            } catch (error) {
                console.error("Failed to fetch universities", error);
                // Agar fail ho jaye, toh user ko pata chale
                // alert("Could not load universities. Check connection.");
            }
        };

        fetchUniversities();
    }, []);

    // 2. Check Username Availability
    useEffect(() => {
        if (debouncedUsername) {
            const checkUsername = async () => {
                setIsCheckingUsername(true);
                try {
                    const response = await api.post('/auth/check-username', { username: debouncedUsername });
                    setIsUsernameAvailable(response.data.available);
                } catch (err) { console.error("Username check failed", err); } 
                finally { setIsCheckingUsername(false); }
            };
            checkUsername();
        }
    }, [debouncedUsername]);

    // --- HANDLERS ---

    // 3. University Search Handler (UPDATED: Removed Static File Dependency)
    const handleUniversitySearch = (e) => {
        const value = e.target.value;
        setNewUniversityName(value);
        
        if (value.length > 0) {
            // A. Safe Check: Backend list agar nahi aayi to empty array maano
            const dbList = Array.isArray(universities) ? universities : [];

            // B. Sirf DB wale universities filter karo
            const filtered = dbList
                .map(uni => uni.name) // Object se name nikalo
                .filter(name => name && name.toLowerCase().includes(value.toLowerCase()));

            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // 4. Select University form List
    const selectUniversity = (uniName) => {
        setNewUniversityName(uniName);
        setShowSuggestions(false);
    };

    // 5. Handle Registration Submit
    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!isUsernameAvailable) {
            setError('Username is already taken.');
            return;
        }

        // Basic Data
        const registrationData = { 
            name, 
            username, 
            email, 
            password, 
            role, 
            phone,
            newUniversityName: newUniversityName // Backend khud ID dhoond lega
        };
        
        // Vendor Data
        if (role === 'VENDOR') {
            if(!shopName || !location || !openTime || !closeTime) {
                setError("Please fill all shop details");
                return;
            }
            registrationData.shopDetails = { name: shopName, location, openTime, closeTime };
        }

        try {
            await api.post('/auth/register', registrationData);
            alert('Registration successful! Please log in.');
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
            <div className="flex w-full max-w-4xl h-[700px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                
                {/* Form Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white font-poppins">Create Account</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Join PrePick today!</p>
                    
                    <form onSubmit={handleRegister} className="flex flex-col flex-grow overflow-hidden">
                        {/* Scrollable Area */}
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            
                            {/* --- ROLE SELECTION --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">I am a:</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-red-500">
                                    <option value="STUDENT">Student</option>
                                    <option value="VENDOR">Vendor</option>
                                </select>
                            </div>

                            {/* --- UNIVERSITY SMART SEARCH --- */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select or Add University</label>
                                <input
                                    type="text"
                                    value={newUniversityName}
                                    onChange={handleUniversitySearch}
                                    placeholder="Type university name..."
                                    className="w-full px-3 py-2 mt-1 border rounded-lg focus:ring-red-500"
                                    required
                                    autoComplete="off"
                                />
                                
                                {/* Suggestions List */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                                        {suggestions.map((uni, index) => (
                                            <li 
                                                key={index}
                                                onClick={() => selectUniversity(uni)}
                                                className="p-2 hover:bg-red-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0"
                                            >
                                                📍 {uni}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="text-xs text-gray-400 mt-1">*Type full name to add new college instantly</p>
                            </div>

                            {/* --- COMMON FIELDS --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-lg" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={`w-full px-3 py-2 mt-1 border rounded-lg ${!isUsernameAvailable && username ? 'border-red-500' : ''}`} required />
                                {!isCheckingUsername && !isUsernameAvailable && username && <p className="text-xs text-red-500">Taken</p>}
                                {!isCheckingUsername && isUsernameAvailable && username && <p className="text-xs text-green-500">Available</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-lg" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-lg" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-lg" required />
                            </div>
                            
                            {/* --- VENDOR ONLY FIELDS --- */}
                            {role === 'VENDOR' && (
                                <div className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase">Shop Details</h3>
                                    <div>
                                        <input type="text" placeholder="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Location (e.g. Block A)" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                                        <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Submit Button */}
                        <div className="mt-4 pt-2 border-t">
                            {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                            <button
                                type="submit"
                                disabled={!isUsernameAvailable || isCheckingUsername}
                                className="w-full py-3 text-white bg-red-600 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>
                    
                    <p className="text-sm text-center text-gray-600 mt-4">
                        Already have an account? <Link to="/" className="text-red-600 font-bold hover:underline">Log in</Link>
                    </p>
                </div>

                {/* Image Section */}
                <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974')" }}></div>
            </div>
        </div>
    );
}

export default RegisterPage;