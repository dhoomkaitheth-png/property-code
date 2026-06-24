const express = require('express');
const router = express.Router();
const webController = require('../controllers/webController');

// Home page
router.get('/', webController.homePage);

// Properties
router.get('/properties', webController.propertiesPage);
router.get('/properties/:id', webController.propertyDetailPage);

// Auth pages
router.get('/auth/login', webController.loginPage);
router.get('/auth/register', webController.registerPage);
router.get('/auth/forgot-password', webController.forgotPasswordPage);
router.get('/auth/reset-password/:token', webController.resetPasswordPage);

// Dashboard
router.get('/dashboard', webController.dashboardPage);
router.get('/dashboard/my-properties', webController.myPropertiesPage);
router.get('/dashboard/my-properties/add', webController.addPropertyPage);
router.get('/dashboard/my-properties/edit/:id', webController.editPropertyPage);
router.get('/dashboard/leads', webController.leadsPage);
router.get('/dashboard/favorites', webController.favoritesPage);
router.get('/dashboard/messages', webController.messagesPage);
router.get('/dashboard/profile', webController.profilePage);
router.get('/dashboard/subscriptions', webController.subscriptionsPage);

// Admin pages
router.get('/admin', webController.adminPage);
router.get('/admin/users', webController.adminUsersPage);
router.get('/admin/properties', webController.adminPropertiesPage);
router.get('/admin/locations', webController.adminLocationsPage);
router.get('/admin/blogs', webController.adminBlogsPage);
router.get('/admin/payments', webController.adminPaymentsPage);
router.get('/admin/reports', webController.adminReportsPage);
router.get('/admin/enquiries', webController.adminEnquiriesPage);

// Chat page
router.get('/chat', webController.chatPage);

// Blog pages
router.get('/blogs', webController.blogsPage);
router.get('/blogs/:slug', webController.blogDetailPage);

// Contact page
router.get('/contact', webController.contactPage);

module.exports = router;