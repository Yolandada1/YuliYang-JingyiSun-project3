const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// 检查用户是否有权限修改特定资源
const checkResourceOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await req.model.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to perform this action' });
    }

    req.resource = resource;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking resource ownership' });
  }
};

module.exports = { auth, checkResourceOwnership };