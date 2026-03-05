require('dotenv').config();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');


const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createServer } = require('http'); // 1. Import http
const { Server } = require("socket.io"); // 2. Import socket.io Server
const { authenticateToken, isVendor } = require('./middleware/auth');

const app = express();
const httpServer = createServer(app); // 3. Create an HTTP server from our app
const io = new Server(httpServer, { // 4. Attach Socket.IO to the server
  cors: {
    origin: "*", // Allow your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});


const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// --- Socket.IO Connection ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});



// const Razorpay = require('razorpay');
// // ...
// const instance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// --- RAZORPAY SETUP (Upar Imports ke paas add karo) ---


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});




// Add these imports at the top of backend/index.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // A temporary folder to store uploads

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// // Add this new endpoint
// app.post('/api/upload/qr', authenticateToken, isVendor, upload.single('qrImage'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded.' });
//     }

//     // Upload the file to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "prepick_qrcodes" // A folder in Cloudinary
//     });

//     // Get the secure URL of the uploaded image
//     const qrCodeUrl = result.secure_url;

//     // Save this URL to the vendor's shop
//     const ownerId = req.user.userId;
//     await prisma.shop.update({
//       where: { ownerId },
//       data: { qrCodeUrl },
//     });

//     res.status(200).json({ message: 'QR Code uploaded successfully!', url: qrCodeUrl });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Image upload failed.' });
//   }
// });




// --- AUTH ROUTES ---
// --- UPDATED AUTH REGISTER ROUTE ---
app.post('/api/auth/register', async (req, res) => {
  const { 
    name, username, email, password, role, phone, 
    shopDetails, universityId, newUniversityName // <--- Added newUniversityName
  } = req.body;

  // 1. UNIVERSITY LOGIC (The Fix)
  let finalUniversityId = universityId;

  try {
    // If no ID is provided but a New Name IS provided
    if (!finalUniversityId && newUniversityName) {
      console.log("Checking for university:", newUniversityName);
      
      // Case-insensitive search for existing university
      const existingUni = await prisma.university.findFirst({
        where: {
          name: {
            equals: newUniversityName,
            mode: 'insensitive', // Search without caring about capital letters
          },
        },
      });

      if (existingUni) {
        finalUniversityId = existingUni.id;
      } else {
        // Create the new university
        const newUni = await prisma.university.create({
          data: {
            name: newUniversityName,
            location: 'India', // Default location
            image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000' // Default image
          }
        });
        finalUniversityId = newUni.id;
        console.log("Created new university:", newUni.name);
      }
    }

    // Now check if we have a valid ID (for Vendors, it's mandatory)
    if (role === 'VENDOR' && !finalUniversityId) {
      return res.status(400).json({ error: 'University selection is required for Vendors.' });
    }
    const phoneRegex = /^[6-9]\d{9}$/;

    // 2. Validate Phone
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // 3. Check for duplicates
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken.' });
    }
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    
    // 4. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({ 
      data: { 
        name, 
        username, 
        email, 
        password: hashedPassword, 
        role, 
        phone, 
        universityId: finalUniversityId // Use the final ID
      } 
    });

    // 5. Create Shop (if Vendor)
    if (role === 'VENDOR' && shopDetails) {
      await prisma.shop.create({
        data: {
          name: shopDetails.name,
          location: shopDetails.location,
          openTime: shopDetails.openTime,
          closeTime: shopDetails.closeTime,
          ownerId: newUser.id,
          universityId: finalUniversityId // Use the final ID
        }
      });
    }

    res.status(201).json({ id: newUser.id, message: "Registration successful!" });

  } catch (error) { 
    console.error("Registration Error:", error); // Better error logging
    res.status(500).json({ error: 'Registration failed.', details: error.message }); 
  }
});
// src/index.js

// backend/index.js - OPTIMIZED LOGIN ROUTE

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;

  console.log("LOGIN ATTEMPT:", identifier); // Jasoosi Log

  try {
    // 👇 YAHAN 'findUnique' KI JAGAH 'findFirst' USE KARO
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { phone: identifier }
        ]
      },
      include: { university: true }
    });

    if (!user) {
      console.log("❌ User nahi mila");
      return res.status(404).json({ error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Password galat hai");
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    console.log("✅ Login Success:", user.name);

    const token = jwt.sign(
        { userId: user.id, role: user.role, universityId: user.universityId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
    );
    
    res.status(200).json({ token, user });

  } catch (error) { 
    console.error("🔥 DATABASE ERROR:", error);
    // Connection pool error handle karo
    res.status(500).json({ error: 'Server busy, please try again.' });
  }
});

 



// src/index.js

// Endpoint 1: FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
  const { identifier } = req.body; // Can be email or phone
  const isEmail = identifier.includes('@');

  const user = await prisma.user.findUnique({
    where: isEmail ? { email: identifier } : { phone: identifier },
  });
 
  if (!user) {
    return res.status(404).json({ error: 'No account with that information exists.' });
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(20).toString('hex');
  const passwordResetExpires = new Date(Date.now() + 3600000); // Token expires in 1 hour

  await prisma.user.update({
    where: { email: user.email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: passwordResetExpires,
    },
  });

  const resetURL = `https://prepick-app.onrender.com/reset-password/${resetToken}`;

  // --- Send the Email ---
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    to: user.email,
    from: 'passwordreset@demo.com',
    subject: 'PrePick Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error sending email.' });
    }
    res.status(200).json({ message: 'A password reset link has been sent to your email.' });
  });
});

// Endpoint 2: RESET PASSWORD
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { gt: new Date() }, // Check if token is not expired
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ message: 'Password has been updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// --- VENDOR ROUTES ---



// Vendor uploads an image for a specific item
app.post('/api/items/:itemId/upload-image', authenticateToken, isVendor, upload.single('itemImage'), async (req, res) => {
  const { itemId } = req.params;
  const ownerId = req.user.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Security check: Ensure item belongs to the vendor's shop
    const item = await prisma.item.findUnique({ where: { id: itemId }, include: { shop: true } });
    if (!item || item.shop.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Access denied to this item.' });
    }

    // Image ko Cloudinary par upload karein
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "prepick_items"
    });

    // Image URL ko database mein save karein
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { imageUrl: result.secure_url },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed.' });
  }
});



// Vendor fetches their earnings report
// Vendor fetches their earnings report
app.get('/api/vendor/earnings', authenticateToken, isVendor, async (req, res) => {
  const ownerId = req.user.userId;

  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId } });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const completedOrders = await prisma.order.findMany({
      where: {
        shopId: shop.id,
        status: 'PICKED_UP',
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    let totalSales = 0;
    completedOrders.forEach(order => {
      order.items.forEach(orderItem => {
        if (orderItem.item) {
          totalSales += orderItem.item.price * orderItem.quantity;
        }
      });
    });

    const commissionRate = 0.15; // Aapka naya commission rate
    const commissionFromSales = totalSales * commissionRate;

    // YEH HAI SABSE ZAROORI FIX: Frontend 'amountOwed' expect kar raha hai
    const amountOwed = commissionFromSales; 

    res.status(200).json({
      totalSales,
      commissionRate,
      amountOwed, // Ab yeh variable maujood hai
      completedOrdersCount: completedOrders.length,
      // Baaki convenience fee waali cheezein abhi ke liye hata di hain taaki code saaf rahe
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate earnings report.' });
  }
});




// app.post('/api/shops', authenticateToken, isVendor, async (req, res) => {
//   const { name, location, openTime, closeTime } = req.body;
//   const ownerId = req.user.userId;
//   try {
//     const existingShop = await prisma.shop.findUnique({ where: { ownerId } });
//     if (existingShop) {
//       return res.status(400).json({ error: 'This vendor already owns a shop.' });
//     }
//     const newShop = await prisma.shop.create({
//       data: { name, location, openTime, closeTime, ownerId },
//     });
//     res.status(201).json(newShop);
//   } catch (error) {
//     res.status(500).json({ error: 'Something went wrong while creating the shop.' });
//   }
// });



// Get the logged-in vendor's shop details
// app.get('/api/shops/my-shop', authenticateToken, isVendor, async (req, res) => {
//   const ownerId = req.user.userId;
//   try {
//     const shop = await prisma.shop.findUnique({
//       where: { ownerId: ownerId },
//     });
//     if (!shop) {
//       return res.status(404).json({ error: 'Shop not found for this vendor.' });
//     }
//     res.status(200).json(shop);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch shop details.' });
//   }
// });



// backend/index.js

// // UPDATE SHOP DETAILS (Name, Time, Location & QR) 🏪
// app.put('/api/shops/my-shop', authenticateToken, isVendor, async (req, res) => {
//   // Frontend se jo bhi data aayega, hum use update karenge
//   const { name, location, openTime, closeTime, qrCodeUrl } = req.body;
//   const ownerId = req.user.userId;

//   try {
//     const updatedShop = await prisma.shop.update({
//       where: { ownerId: ownerId },
//       data: { 
//           // Agar frontend ne bheja hai toh update karo, nahi toh purana hi rakho (undefined check)
//           ...(name && { name }),
//           ...(location && { location }),
//           ...(openTime && { openTime }),
//           ...(closeTime && { closeTime }),
//           ...(qrCodeUrl && { qrCodeUrl })
//       },
//     });
//     res.status(200).json(updatedShop);
//   } catch (error) {
//     console.error("Shop Update Error:", error);
//     res.status(500).json({ error: 'Failed to update shop details.' });
//   }
// });

//656
// 1. GET SHOP (Isme 404 aana normal hai agar shop nahi bani)
app.get('/api/shops/my-shop', authenticateToken, isVendor, async (req, res) => {
  const ownerId = req.user.userId;
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: ownerId },
    });
    if (!shop) {
      // 404 Bhejo taaki Frontend samjh sake ki shop nahi hai
      return res.status(404).json({ error: 'Shop not found.' });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop details.' });
  }
});



// 2. CREATE SHOP (Ye tab chalega jab 404 aayega)
// backend/index.js

app.get('/api/shops', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1. Student ki Uni pata karo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { universityId: true, name: true }
    });

    console.log("🕵️‍♂️ Student:", user.name);
    console.log("🎓 Student University ID:", user.universityId);

    if (!user || !user.universityId) {
      return res.status(400).json({ error: 'User university not found.' });
    }

    // 2. Shops dhoondho
    const shops = await prisma.shop.findMany({
      where: { universityId: user.universityId }, // Strict Filter
      include: { reviews: true } // Ratings ke liye
    });

    console.log("🏪 Shops Found:", shops.length); // Kitni dukane mili?
    if(shops.length === 0) {
        // Debugging: Check karo kya total shops hain bhi ya nahi?
        const totalShops = await prisma.shop.count();
        console.log("⚠️ Total Shops in DB:", totalShops);
    }

    // ... baaki formatting code same rahega ...
    
    // Rating calculation logic
    const shopsWithRating = shops.map(shop => {
        const totalRating = shop.reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = shop.reviews.length > 0 ? totalRating / shop.reviews.length : 0;
        return { ...shop, averageRating: parseFloat(averageRating.toFixed(1)) };
    });

    res.status(200).json(shopsWithRating);

  } catch (error) {
    console.error("🔥 Error fetching shops:", error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 3. UPDATE SHOP (Ye tab chalega jab Dashboard se edit karoge)
app.put('/api/shops/my-shop', authenticateToken, isVendor, async (req, res) => {
  const { name, location, openTime, closeTime } = req.body;
  const ownerId = req.user.userId;
  try {
    const updatedShop = await prisma.shop.update({
      where: { ownerId: ownerId },
      data: { 
          // Sirf wahi update karo jo bheja gaya hai
          ...(name && { name }),
          ...(location && { location }),
          ...(openTime && { openTime }),
          ...(closeTime && { closeTime })
      },
    });
    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shop.' });
  }
});




// GET /api/orders/vendor/search function ko isse replace karein
app.get('/api/orders/vendor/search', authenticateToken, isVendor, async (req, res) => {
  const { q, status } = req.query;
  const ownerId = req.user.userId;

  if (!q) return res.status(400).json({ error: 'Search query is required.' });

  const statusMap = {
    // 👇 YAHAN BHI 'PREPARING' ADD KARO
    ongoing: ['PENDING', 'PAID', 'PREPARING', 'READY'],
    completed: ['PICKED_UP'],
    cancelled: ['CANCELLED', 'NO_SHOW'],
  };
  
  let statusFilter = {};
  if (status && statusMap[status]) {
    statusFilter = { status: { in: statusMap[status] } };
  }

  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId } });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const orders = await prisma.order.findMany({
      where: {
        shopId: shop.id,
        ...statusFilter,
        OR: [
          { items: { some: { item: { name: { contains: q, mode: 'insensitive' } } } } },
          { student: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        student: { select: { name: true, phone: true } },
        items: { include: { item: { select: { name: true, price: true } } } },
      },
      orderBy: { orderTime: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ error: 'Failed to search orders.' }); }
});



app.put('/api/shops/my-shop', authenticateToken, isVendor, async (req, res) => {
  const { qrCodeUrl } = req.body;
  const ownerId = req.user.userId;
  try {
    const updatedShop = await prisma.shop.update({
      where: { ownerId: ownerId },
      data: { qrCodeUrl: qrCodeUrl },
    });
    res.status(200).json(updatedShop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shop.' });
  }
});

app.post('/api/items', authenticateToken, isVendor, async (req, res) => {
  const { name, price } = req.body;
  const ownerId = req.user.userId;
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: ownerId } });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found. Please create a shop first.' });
    }
    const newItem = await prisma.item.create({
      data: { name, price, shopId: shop.id },
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while adding the item.' });
  }
});

app.get('/api/items/my-items', authenticateToken, isVendor, async (req, res) => {
  const ownerId = req.user.userId;
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: ownerId } });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found for this vendor.' });
    }
    const items = await prisma.item.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching items.' });
  }
});

app.put('/api/items/:itemId', authenticateToken, isVendor, async (req, res) => {
  const { itemId } = req.params;
  const { name, price, availability } = req.body;
  const ownerId = req.user.userId;
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: ownerId } });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found for this vendor.' });
    }
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.shopId !== shop.id) {
      return res.status(403).json({ error: 'Access denied. Item does not belong to your shop.' });
    }
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { name, price, availability },
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while updating the item.' });
  }
});





app.delete('/api/items/:itemId', authenticateToken, isVendor, async (req, res) => {
  const { itemId } = req.params;
  const ownerId = req.user.userId;
  
  try {
    // Security check: Check karein ki item vendor ka hi hai
    const shop = await prisma.shop.findUnique({ where: { ownerId: ownerId } });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found for this vendor.' });
    }
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.shopId !== shop.id) {
      return res.status(403).json({ error: 'Access denied. Item does not belong to your shop.' });
    }
    
    // YEH HAI ASLI CHANGE: Delete karne ki jagah, item ko unavailable banayein
    await prisma.item.update({
      where: { id: itemId },
      data: { availability: false }, // Item ko deactivate karein
    });
    
    res.status(200).json({ message: 'Item deactivated successfully.' });
  } catch (error) {
    console.error('Error deactivating item:', error);
    res.status(500).json({ error: 'Something went wrong while deactivating the item.' });
  }
});















app.get('/api/orders/vendor', authenticateToken, isVendor, async (req, res) => {
  const ownerId = req.user.userId;
  const { status } = req.query;

  const statusMap = {
    // 👇 YAHAN 'PREPARING' ADD KARNA THA
    ongoing: ['PENDING', 'PAID', 'PREPARING', 'READY'], 
    completed: ['PICKED_UP'],
    cancelled: ['CANCELLED', 'NO_SHOW'], // NO_SHOW ko bhi yahan add kar lo
  };

  let whereClause = {};
  if (status && statusMap[status]) {
    whereClause.status = { in: statusMap[status] };
  }

  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId } });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    whereClause.shopId = shop.id;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true, phone: true } },
        items: { include: { item: { select: { name: true, price: true } } } },
      },
      orderBy: { orderTime: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch orders.' }); }
});



// Vendor uploads an image for their shop
app.post('/api/shops/my-shop/upload-image', authenticateToken, isVendor, upload.single('shopImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "prepick_shops" // Cloudinary mein ek naya folder ban jayega
    });

    const ownerId = req.user.userId;
    const updatedShop = await prisma.shop.update({
      where: { ownerId },
      data: { imageUrl: result.secure_url }, // Image ka URL database mein save karein
    });

    
    res.status(200).json(updatedShop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image upload failed.' });
  }
});


//yess bby klloo like when u write in this green it ill not affect on my code oo
//when u an something to write n bs kya krna // or fir write okiee okiiii
//si m sending u all the sql question adn answer and study meterial also okiieee mna pdf bhja tha hn exerscie vale ya notes valee ??ha notes  sexerscie vale nhi ?  vo pdhne h thk he me sb bhej dungaa okiee usi chapter se he n bs sql ??thkk h






// u wanna se how many line i wrriten 
     
// ese 
// backe hh thkk nd/index.js kkk

// backend/index.js
// UPDATE ORDER STATUS (With OTP Check for PICKED_UP) 🔐
app.patch('/api/orders/:orderId/status', authenticateToken, isVendor, async (req, res) => {
  const { orderId } = req.params;
  const { status, otp } = req.body; // 👈 Frontend se OTP aayega
  const ownerId = req.user.userId;
  const commissionRate = 0.10;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shop: true, items: { include: { item: true } } }
    });

    if (!order || order.shop.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // 🛑 OTP CHECK LOGIC (Sirf jab status PICKED_UP ho raha ho)
    if (status === 'PICKED_UP') {
        if (!otp) {
            return res.status(400).json({ error: "Please enter the OTP provided by the student." });
        }
        if (otp !== order.pickupOtp) {
            return res.status(400).json({ error: "Wrong OTP! Ask student for correct code." });
        }
    }

    // --- TRANSACTION START (Commission Logic Same as before) ---
    await prisma.$transaction(async (tx) => {
      
      if (status === 'NO_SHOW' && order.status !== 'NO_SHOW') {
         await tx.user.update({ where: { id: order.studentId }, data: { noShowCount: { increment: 1 } } });
      }

      // Commission Logic (Same)
      if (status === 'PICKED_UP' && order.status === 'READY') {
        if (order.paymentMethod === 'CASH_ON_PICKUP') {
            let orderTotal = 0;
            order.items.forEach(oi => { if(oi.item) orderTotal += (oi.item.price * oi.quantity) });
            const commissionAmount = orderTotal * commissionRate;

            await tx.user.update({
              where: { id: ownerId },
              data: { walletBalance: { decrement: commissionAmount } },
            });

            await tx.walletTransaction.create({
              data: { userId: ownerId, amount: commissionAmount, type: 'DEBIT', details: `Commission for Cash Order #${order.id.substring(0, 5)}` }
            });
        }
      }

      // Update Status
      await tx.order.update({
        where: { id: orderId },
        data: { status: status }
      });
    });

    // Live Update
    const updatedOrder = await prisma.order.findUnique({ where: { id: orderId }, include: { student: true, items: { include: { item: true } }, shop: true } });
    io.emit('order_updated', updatedOrder);
    res.status(200).json(updatedOrder);

  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update status.' });
  }
});

// --- STUDENT/PUBLIC ROUTES ---
app.get('/api/shops', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Pehle pata karein ki student kis university ka hai
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { universityId: true }
    });

    if (!user || !user.universityId) {
      return res.status(400).json({ error: 'User is not linked to any university.' });
    }

    // Sirf usi university ki shops fetch karein
    const shops = await prisma.shop.findMany({
      where: { universityId: user.universityId }, // STRICT FILTER
      select: { 
        id: true, 
        name: true, 
        location: true, 
        openTime: true, 
        closeTime: true, 
        imageUrl: true,
        // Rating bhi yahin calculate karke bhej sakte hain agar chahiye
        reviews: { select: { rating: true } }
      },
    });

    // Average rating calculate karke bhejein
    const shopsWithRating = shops.map(shop => {
      const totalRating = shop.reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = shop.reviews.length > 0 ? totalRating / shop.reviews.length : 0;
      const { reviews, ...shopData } = shop;
      return { ...shopData, averageRating: parseFloat(averageRating.toFixed(1)) };
    });

    res.status(200).json(shopsWithRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shops.' });
  }
});


app.get('/api/shops/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { universityId: true }
    });

    if (!user || !user.universityId) {
      return res.status(400).json({ error: 'User is not linked to any university.' });
    }

    const shops = await prisma.shop.findMany({
      where: { 
        universityId: user.universityId, // STRICT FILTER
        name: { contains: q, mode: 'insensitive' } 
      },
      include: { reviews: { select: { rating: true } } }
    });

    // Rating calculation logic (same as above)
    const shopsWithRating = shops.map(shop => {
        const totalRating = shop.reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = shop.reviews.length > 0 ? totalRating / shop.reviews.length : 0;
        const { reviews, ...shopData } = shop;
        return { ...shopData, averageRating: parseFloat(averageRating.toFixed(1)) };
    });

    res.status(200).json(shopsWithRating);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search for shops.' });
  }
});


app.get('/api/shops/top-rated', async (req, res) => {
  try {
    // Pehle, har shop ki average rating calculate karein
    const shopsWithAvgRating = await prisma.shop.findMany({
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const calculatedShops = shopsWithAvgRating
      .filter(shop => shop.reviews.length > 0) // Sirf unhein chunein jinka kam se kam ek review hai
      .map(shop => {
        const totalRating = shop.reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / shop.reviews.length;
        const { reviews, ...shopData } = shop;
        return {
          ...shopData,
          averageRating: parseFloat(averageRating.toFixed(1)),
        };
      });

    // Ab, unhein rating ke hisab se sort karein aur top 4 lein
    const topRatedShops = calculatedShops
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);

    res.status(200).json(topRatedShops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch top-rated shops.' });
  }
});

app.get('/api/shops/:shopId', async (req, res) => {
  const { shopId } = req.params;
  try {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop details.' });

  }
});
// Get the menu for a specific shop
app.get('/api/shops/:shopId/menu', async (req, res) => {
  const { shopId } = req.params;
  try {
    const shop = await prisma.shop.findUnique({ 
      where: { id: shopId }, 
      select: { id: true, name: true, location: true } 
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }

    // GET /api/shops/:shopId/menu ke andar
const items = await prisma.item.findMany({
  where: { shopId: shopId, availability: true },
  select: { id: true, name: true, price: true, imageUrl: true ,shopId: true}, // <-- imageUrl add karein
});

    res.status(200).json({ shop: shop, menu: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching the menu.' });
  }
});




// backend/index.js

// backend/index.js
// POST /api/orders (Create New Order with OTP) 📝
// backend/index.js

app.post('/api/orders', authenticateToken, async (req, res) => {
  // 👇 1. totalAmount frontend se receive karna zaroori hai
  const { shopId, items, pickupTime, paymentMethod, totalAmount } = req.body;
  const studentId = req.user.userId;

  try {
    // --- BLOCKING LOGIC START ---
    if (paymentMethod === 'CASH_ON_PICKUP') {
        const student = await prisma.user.findUnique({ 
            where: { id: studentId },
            select: { noShowCount: true } 
        });

        if (student && student.noShowCount >= 3) {
            return res.status(400).json({ 
                error: 'Your Cash on Pickup facility is blocked due to 3+ missed orders. Please pay Online.' 
            });
        }
    }
    // --- BLOCKING LOGIC END ---

    // 2. Shop Check
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }

    // 3. OTP Generate karo
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 4. Order Create karo (Total Amount & Items ke saath)
    const newOrder = await prisma.order.create({
      data: {
        studentId: studentId,
        shopId: shopId,
        pickupTime: new Date(pickupTime),
        paymentMethod: paymentMethod,
        status: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        
        // 👇 Schema ke hisab se yahan 'pickupOtp' hi aayega (Sahi hai)
        pickupOtp: otp, 

        // 👇 YE MISSING THA! Iske bina crash ho raha tha
        totalAmount: parseFloat(totalAmount), 

        // 👇 Items ko yahi direct add kar do (Better & Faster)
        items: {
            create: items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
            }))
        }
      },
      // Return mein hamein ye sab chahiye
      include: { 
        items: { include: { item: true } }, 
        shop: true,
        student: true
      }
    });

    // 5. Socket Event Emit karo (Live Update ke liye)
    io.emit('new_order', newOrder);

    res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder.id });

  } catch (error) {
    console.error("🔥 Order Error:", error);
    res.status(500).json({ error: error.message || 'Order creation failed.' });
  }
});






app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  const studentId = req.user.userId;
  try {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Access denied.' });
    const orders = await prisma.order.findMany({
      where: { studentId },
      include: {
        shop: { select: { id: true, name: true, owner: { select: { phone: true } } } },
        items: { include: { item: { select: { name: true, price: true } } } },
      },
      orderBy: { orderTime: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch order history.' }); }
});



//src/index.js 
// src/index.js

app.patch('/api/orders/:orderId/cancel', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const studentId = req.user.userId;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.studentId !== studentId) {
      return res.status(403).json({ error: 'Access denied. This is not your order.' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'This order can no longer be cancelled.' });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      // Add this include block to return the full data
      include: {
        student: { select: { name: true } },
        items: { include: { item: { select: { name: true, price: true } } } },
      },
    });

    // This will now send the complete order object for live updates
    io.emit('order_updated', cancelledOrder);

    res.status(200).json(cancelledOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while cancelling the order.' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the PrePick API! 👋');
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// Get the profile of the currently logged-in user
app.get('/api/users/me', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // We select specific fields to avoid sending sensitive data like the password
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        username: true,
        createdAt: true

      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching the profile.' });
  }
});







// Update user profile
app.put('/api/users/me', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { name } = req.body; // Only accept the name from the request

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name, // Only update the name
      },
      select: { // Send back the updated profile without the password
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while updating the profile.' });
  }
});





// Check if a username is available
app.post('/api/auth/check-username', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (user) {
      return res.status(200).json({ available: false });
    }
    res.status(200).json({ available: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



// Student confirms they have paid
// backend/index.js

// STUDENT LATE PAYMENT (Convert Cash -> Online) 🔄
app.patch('/api/orders/:orderId/confirm-payment', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { paymentId } = req.body; // Frontend se payment ID aayegi
  const studentId = req.user.userId;

  try {
    // 1. Order Dhoondho
    const order = await prisma.order.findFirst({
      where: { id: orderId, studentId: studentId },
      include: { 
        items: { include: { item: true } },
        shop: true 
      }
    });

    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.status !== 'PENDING') return res.status(400).json({ error: 'Order already processed.' });

    // 2. Transaction Start
    await prisma.$transaction(async (tx) => {
        
        // A. Total Amount Nikalo
        let totalAmount = 0;
        order.items.forEach(oi => { if(oi.item) totalAmount += (oi.item.price * oi.quantity) });

        // B. Vendor ka Hissa (90%)
        const vendorShare = totalAmount * 0.90;

        // C. Vendor Wallet mein Paisa Daalo (Credit)
        await tx.user.update({
            where: { id: order.shop.ownerId },
            data: { walletBalance: { increment: vendorShare } }
        });

        // D. Transaction Note Karo
        await tx.walletTransaction.create({
            data: {
                userId: order.shop.ownerId,
                amount: vendorShare,
                type: 'CREDIT',
                details: `Late Online Payment for Order #${order.id.substring(0,5)}`
            }
        });

        // E. Order Update Karo (Method -> ONLINE, Status -> PAID)
        await tx.order.update({
            where: { id: orderId },
            data: { 
                status: 'PAID',
                paymentMethod: 'ONLINE', // Important: Ab ye cash order nahi raha
                paymentId: paymentId
            }
        });
    });

    // 3. Live Update
    const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
            student: { select: { name: true } }, 
            items: { include: { item: { select: { name: true, price: true } } } },
            shop: { select: { name: true } }
        }
    });
    
    io.emit('order_updated', updatedOrder);
    res.status(200).json(updatedOrder);

  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ error: 'Failed to process payment.' });
  }
});




// backend/index.js ke end mein check karo

app.get('/api/universities', async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(universities);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch universities.' });
  }
});



// 1. GET: Vendor Wallet Balance & Transactions (Yeh missing tha)
// 1. Get Wallet Data (Balance + History)
app.get('/api/vendor/wallet', authenticateToken, isVendor, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        walletBalance: true,
        walletTransactions: { orderBy: { timestamp: 'desc' } } // History bhi bhejo
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet." });
  }
});

// 2. Withdraw Money (Reset Balance to 0)
app.post('/api/vendor/withdraw', authenticateToken, isVendor, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user.walletBalance <= 0) {
        return res.status(400).json({ error: "Insufficient balance to withdraw." });
    }

    const amountToWithdraw = user.walletBalance;

    // Transaction: Balance kaato aur History mein likho
    await prisma.$transaction(async (tx) => {
        // Balance 0 karo
        await tx.user.update({
            where: { id: userId },
            data: { walletBalance: 0 } 
        });

        // History mein "DEBIT" entry daalo
        await tx.walletTransaction.create({
            data: {
                userId: userId,
                amount: amountToWithdraw,
                type: 'DEBIT',
                details: 'Payout Request (Sent to Admin)'
            }
        });
    });

    res.json({ message: "Withdrawal successful! Admin will transfer money shortly." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Withdrawal failed." });
  }
});


// Vendor adds money to their wallet (recharge)
app.post('/api/vendor/wallet/topup', authenticateToken, isVendor, async (req, res) => {
  const userId = req.user.userId;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid top-up amount.' });
  }

  try {
    // Transaction ko ek saath karein taaki data safe rahe
    await prisma.$transaction(async (tx) => {
      // 1. User ka balance badhayein
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      });
      // 2. Ek "CREDIT" transaction record karein
      await tx.walletTransaction.create({
        data: {
          userId: userId,
          amount: amount,
          type: 'CREDIT',
          details: 'Wallet Top-up'
        },
      });
    });
    res.status(200).json({ message: 'Wallet topped up successfully.' });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Top-up failed.' }); 
  }
});





// Get all reviews and average rating for a specific shop
app.get('/api/shops/:shopId/reviews', async (req, res) => {
  const { shopId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { // Review ke saath author ka naam bhi bhejein
          select: { name: true, username: true }
        }
      }
    });

    // Shop ki average rating calculate karein
    const avgRatingResult = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      where: { shopId },
    });
    const averageRating = avgRatingResult._avg.rating || 0;

    res.status(200).json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)), // Rating ko 1 decimal place tak round karein
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});



// Student adds a review for a completed order
app.post('/api/reviews', authenticateToken, async (req, res) => {
  const { orderId, shopId, rating, comment } = req.body;
  const authorId = req.user.userId;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, studentId: authorId, status: 'PICKED_UP' }
    });

    if (!order) {
      return res.status(403).json({ error: 'You can only review completed orders that you have picked up.' });
    }

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        authorId,
        shopId,
        orderId,
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint failed error code
      return res.status(400).json({ error: 'You have already reviewed this order.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});


// 1. Create Razorpay Order (Jab Student 'Pay Online' dabata hai)
app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
  const { amount } = req.body; // Amount frontend se aayega

  const options = {
    amount: Math.round(amount * 100), // Razorpay paise mein leta hai (₹100 = 10000 paise)
    currency: "INR",
    receipt: "order_rcptid_" + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order); // Frontend ko Order ID bhejo
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send(error);
  }
});


// 2. Verify Payment & Create Order (MAIN LOGIC 🧠)
// 2. Verify Payment & Create Order (ONLINE WALAROUTE ⚡)
// 2. Verify Payment & Create Order (ONLINE WALAROUTE ⚡) - UPDATED FIX 🛠️
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    cartItems, 
    pickupTime,
    shopId,
    totalAmount // 👈 1. YAHAN TOTAL AMOUNT RECEIVE KIYA
  } = req.body;

  const studentId = req.user.userId;

  // A. Signature Verification (Security Check)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      // --- DATABASE TRANSACTION START ---
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. Shop Check
        const shop = await tx.shop.findUnique({ where: { id: shopId } });
        if(!shop) throw new Error("Shop not found");

        // 2. OTP Generate karo
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Order Create karo (Status: PAID + OTP + TotalAmount)
        const newOrder = await tx.order.create({
          data: {
            studentId,
            shopId,
            pickupTime: new Date(pickupTime),
            paymentMethod: 'ONLINE',
            status: 'PAID', // Paisa aa gaya!
            paymentId: razorpay_payment_id,
            pickupOtp: otp,
            
            // 👇 2. YAHAN DATABASE MEIN SAVE KIYA
            totalAmount: parseFloat(totalAmount) 
          }
        });

        // 4. Items Add karo
        const orderItemsData = cartItems.map(item => ({
          orderId: newOrder.id,
          itemId: item.id,
          quantity: item.quantity,
        }));
        await tx.orderItem.createMany({ data: orderItemsData });

        // 5. COMMISSION LOGIC (90% Vendor, 10% Admin)
        // Calculation hum backend pe dobara karte hain safety ke liye
        let calculatedTotal = 0;
        cartItems.forEach(item => { calculatedTotal += (item.price * item.quantity) });
        
        const vendorShare = calculatedTotal * 0.90; 

        // Vendor ka Wallet Update
        await tx.user.update({
          where: { id: shop.ownerId },
          data: { walletBalance: { increment: vendorShare } }
        });

        // Transaction History
        await tx.walletTransaction.create({
          data: {
            userId: shop.ownerId,
            amount: vendorShare,
            type: 'CREDIT',
            details: `Earnings for Online Order #${newOrder.id.substring(0,6)}`
          }
        });

        return newOrder;
      });
      // --- TRANSACTION END ---

      // Live Update
      const fullOrder = await prisma.order.findUnique({
          where: { id: result.id },
          include: { 
            student: { select: { name: true, phone: true } }, 
            items: { include: { item: { select: { name: true, price: true } } } },
            shop: { select: { name: true}}
          }
      });
      io.emit('new_order', fullOrder);

      res.json({ message: "Payment Successful, Order Placed!", orderId: result.id });

    } catch (error) {
      console.error("DB Error:", error);
      // Agar totalAmount abhi bhi NaN hai toh ye error aayega
      res.status(500).json({ error: "Payment verified but Order creation failed." });
    }
  } else {
    res.status(400).json({ error: "Invalid Signature (Potential Fraud Attempt)" });
  }
});

// 3. Mark Payout as COMPLETED (Admin Action)
app.post('/api/admin/approve-payout', async (req, res) => {
  const { transactionId } = req.body;
  
  // Real app mein yahan check hona chahiye ki requester Admin hai ya nahi
  try {
    // Transaction ko update karo (Optional: Status field add kar sakte ho schema mein, 
    // par abhi ke liye hum bas transaction details update kar denge "PAID" likh kar)
    
    await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: { details: "Payout Completed via Admin (GPay/Cash)" }
    });

    res.json({ message: "Marked as Paid!" });
  } catch (error) {
    res.status(500).json({ error: "Action failed" });
  }
});



// ==========================================
// 👮‍♂️ ADMIN ROUTES (Paste at the bottom)
// ==========================================

// 1. Get All Withdrawal Requests (Jo Vendor ne bheji hain)
// backend/index.js inside ADMIN ROUTES

// 1. Get All Withdrawal Requests (FILTERED ✅)
app.get('/api/admin/withdrawals', async (req, res) => {
  try {
    const withdrawals = await prisma.walletTransaction.findMany({
      where: { 
          type: 'DEBIT',
          // 👇 YEH HAI FIX: Sirf wo transactions dikhao jo 'Payout Request' hain
          details: {
              contains: 'Payout Request' 
          }
      }, 
      include: {
        user: { 
          select: { name: true, phone: true, shop: { select: { name: true } } } 
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(withdrawals);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// 2. Approve Payout (Jab tum GPay kar do)
app.post('/api/admin/approve-payout', async (req, res) => {
  const { transactionId } = req.body;
  
  try {
    // Transaction details update kar do taaki pata chale payment ho gayi
    await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: { details: "Payout Completed via Admin (GPay/Cash) ✅" }
    });

    res.json({ message: "Marked as Paid!" });
  } catch (error) {
    console.error("Admin Approve Error:", error);
    res.status(500).json({ error: "Action failed" });
  }
});

// ==========================================