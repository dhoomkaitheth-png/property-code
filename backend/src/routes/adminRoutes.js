const express = require('express');
const router = express.Router();
const {
  importDistricts,
  importTehsils,
  importVillages,
  createVillage,
  updateVillage,
  deleteVillage,
  login,
  getImportLogs,
  getDashboardStats,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImport } = require('../middleware/upload');

// POST /api/admin/login - Admin login
router.post('/login', login);

// All routes below require authentication
router.use(authenticate);

// GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', getDashboardStats);

// GET /api/admin/imports - Import logs
router.get('/imports', getImportLogs);

// POST /api/admin/import/districts - Import districts from CSV/Excel
router.post('/import/districts', authorize('super_admin', 'admin'), uploadImport.single('file'), importDistricts);

// POST /api/admin/import/tehsils - Import tehsils from CSV/Excel
router.post('/import/tehsils', authorize('super_admin', 'admin'), uploadImport.single('file'), importTehsils);

// POST /api/admin/import/villages - Import villages from CSV/Excel
router.post('/import/villages', authorize('super_admin', 'admin'), uploadImport.single('file'), importVillages);

// POST /api/admin/villages - Create new village
router.post('/villages', authorize('super_admin', 'admin', 'moderator'), createVillage);

// PUT /api/admin/villages/:id - Update village
router.put('/villages/:id', authorize('super_admin', 'admin', 'moderator'), updateVillage);

// DELETE /api/admin/villages/:id - Delete village
router.delete('/villages/:id', authorize('super_admin', 'admin'), deleteVillage);

module.exports = router;