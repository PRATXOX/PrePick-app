// backend/controllers/authController.js
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const University = require('../models/University');
const jwt = require('jsonwebtoken');

// --- 1. REGISTER FUNCTION (Vendor + Student + New University Logic) ---
exports.register = async (req, res) => {
  try {
    console.log("📥 Register Request:", req.body);

    const { 
      name, email, password, phone, role, username,
      universityId, newUniversityName, // University fields
      shopDetails                      // Vendor fields
    } = req.body;

    // A. Check Email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // B. Check Username
    if (username) {
        let userByName = await User.findOne({ username });
        if (userByName) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
    }

    // C. UNIVERSITY MAGIC LOGIC 🪄
    let finalUniversityId = universityId;

    // Agar Naya Naam aaya hai -> Toh Nayi University Banao
    if (!finalUniversityId && newUniversityName) {
      // Case-insensitive search
      let existingUni = await University.findOne({ 
        name: { $regex: new RegExp(`^${newUniversityName}$`, 'i') } 
      });

      if (existingUni) {
        finalUniversityId = existingUni._id;
      } else {
        const newUni = new University({
          name: newUniversityName,
          image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000',
          location: 'India'
        });
        await newUni.save();
        finalUniversityId = newUni._id;
      }
    }

    // Vendor ke liye University zaroori hai
    if (role === 'VENDOR' && !finalUniversityId) {
        return res.status(400).json({ message: 'University selection is required for Vendors' });
    }

    // D. Create User
    user = new User({
      name, email, password, phone, username,
      role: role || 'STUDENT',
      universityId: finalUniversityId // Student ke liye bhi save kar sakte hain
    });
    await user.save();

    // E. Create Vendor Profile (Agar Vendor hai)
    if (role === 'VENDOR') {
      const vendor = new Vendor({
        user: user._id,
        shopName: shopDetails?.name || 'My Shop',
        location: shopDetails?.location || 'Campus',
        openTime: shopDetails?.openTime || '09:00',
        closeTime: shopDetails?.closeTime || '17:00',
        university: finalUniversityId
      });
      await vendor.save();
    }

    // F. Token Generate
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, universityId: finalUniversityId }
    });

  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- 2. LOGIN FUNCTION (Jo miss ho gaya tha) ---
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email ya username

    // User dhoondho (Email ya Username se)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Password Check (Model ke method se)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Token Generate
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        universityId: user.universityId 
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- 3. CHECK USERNAME (Frontend mangta hai) ---
exports.checkUsername = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            return res.json({ available: false });
        }
        return res.json({ available: true });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};