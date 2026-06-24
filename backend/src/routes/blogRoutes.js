const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/userAuth');

// Public routes
router.get('/', blogController.getBlogs);
router.get('/categories', blogController.getBlogCategories);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Admin routes
router.get('/admin/all', authenticate, blogController.getAllBlogsAdmin);
router.post('/', authenticate, blogController.createBlog);
router.put('/:id', authenticate, blogController.updateBlog);
router.delete('/:id', authenticate, blogController.deleteBlog);

module.exports = router;