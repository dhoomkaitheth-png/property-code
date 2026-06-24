const express = require('express');
const router = express.Router();
const {
  getDistricts,
  getTehsilsByDistrict,
  getVillagesByTehsil,
  getVillagesByDistrict,
  getDistrict,
  getTehsil,
  getVillage,
  searchLocations,
} = require('../controllers/locationController');

// GET /api/locations/districts - Get all districts
router.get('/districts', getDistricts);

// GET /api/locations/districts/:id - Get single district
router.get('/districts/:id', getDistrict);

// GET /api/locations/tehsils/:districtId - Get tehsils by district
router.get('/tehsils/:districtId', getTehsilsByDistrict);

// GET /api/locations/tehsils/single/:id - Get single tehsil
router.get('/tehsil/:id', getTehsil);

// GET /api/locations/villages/:tehsilId - Get villages by tehsil
router.get('/villages/:tehsilId', getVillagesByTehsil);

// GET /api/locations/villages/district/:districtId - Get all villages in a district
router.get('/villages/district/:districtId', getVillagesByDistrict);

// GET /api/locations/village/:id - Get single village
router.get('/village/:id', getVillage);

// GET /api/locations/search - Search all locations
router.get('/search', searchLocations);

module.exports = router;