const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUserProfile,
  updateUserProfile,
  getOrganizationProfile,
  getAllOrganizationProfiles
} = require('../controllers/users/user.controller');

// 1️⃣ Organization routes first (static/dynamic)
router.get('/organization/all-users', getAllOrganizationProfiles);   // Get all org profiles
router.get('/organization/:userId', getOrganizationProfile);        // Get single org profile

// 2️⃣ User routes
router.get('/', getAllUsers);           // Get all users
router.post('/', createUser);           // Create new user
router.get('/:id', getUserProfile);     // Get user by ID
router.put('/:id', updateUserProfile);  // Update user by ID

module.exports = router;
