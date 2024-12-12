const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth, checkResourceOwnership } = require('../middleware/auth');

// Middleware to set model for checkResourceOwnership
router.use((req, res, next) => {
  req.model = Post;
  next();
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error getting posts' });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const post = new Post({
      content,
      user: req.user._id,
      username: req.user.username
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Update post
router.put('/:id', auth, checkResourceOwnership, async (req, res) => {
  try {
    const { content } = req.body;
    const post = req.resource;
    
    post.content = content;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete post
router.delete('/:id', auth, checkResourceOwnership, async (req, res) => {
  try {
    await req.resource.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Get user's posts
router.get('/user/:username', async (req, res) => {
  try {
    const posts = await Post.find({ username: req.params.username })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error getting user posts' });
  }
});

module.exports = router;