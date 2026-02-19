// middleware/auth.js

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied. Invalid token.' });
    }
    // Attach the user payload to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
}



// Middleware to check if the user is a VENDOR
function isVendor(req, res, next) {
  if (req.user.role !== 'VENDOR') {
    return res.status(403).json({ error: 'Access denied. Only vendors can perform this action.' });
  }
  next();
}





module.exports = {
  authenticateToken,
  isVendor,
};