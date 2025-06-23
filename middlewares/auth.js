const jwt = require("jsonwebtoken");
const userModel = require("../models/usersSchema");


const getTokenFromRequest = (req) => {
  return req.cookies?.token || null;
};

const requireAuthUser = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decodedToken.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    console.error("Token is not valid", err.message);
    return res.status(400).json({ message: 'Token is not valid' });
  }
};

// Role-specific middleware
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = {
  requireAuthUser,
  hasRole
};
