const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');


// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body); // Debug log
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      description: '',
      joinDate: new Date()
    });

    const savedUser = await user.save();
    console.log('User saved:', savedUser); // Debug log

    // Create token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set cookie and return user data
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      username: savedUser.username,
      joinDate: savedUser.joinDate
    });
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      username: user.username,
      joinDate: user.joinDate
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error getting user profile' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Update user description
router.put('/description', auth, async (req, res) => {
  try {
    console.log('Updating description for user:', req.user);
    console.log('New description:', req.body.description);

    const { description } = req.body;
    if (description === undefined) {
      return res.status(400).json({ message: 'Description is required' });
    }

    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.description = description;
    await user.save();

    res.json({ 
      message: 'Description updated successfully',
      description: user.description
    });
  } catch (error) {
    console.error('Error updating description:', error);
    res.status(500).json({ message: 'Error updating description' });
  }
});

module.exports = router;