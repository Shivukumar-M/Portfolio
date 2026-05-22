const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');

const slugify = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Public: get published posts for a user
router.get('/public/:username', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await BlogPost.find({ userId: user._id, published: true })
      .sort({ createdAt: -1 })
      .select('-content');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Public: get single post by slug
router.get('/public/:username/:slug', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const post = await BlogPost.findOne({ userId: user._id, slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.views += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: get all posts (including drafts)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await BlogPost.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: create post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags, published } = req.body;
    const slug = slugify(title);
    const post = new BlogPost({
      userId: req.user.id,
      title, content, excerpt, coverImage,
      tags: tags || [],
      published: published || false,
      slug,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: update post
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    req.body.updatedAt = Date.now();
    const post = await BlogPost.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Authenticated: delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    await BlogPost.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
