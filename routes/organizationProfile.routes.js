const express = require("express");
const router = express.Router();



const AuthMiddleware = require("../middlewares/Authmiddleware");
const { upsertOrganizationProfile, getOrganizationProfileByUser, getAllOrganizationProfiles, getProfileHistory } = require("../controllers/organizationProfile/organizationProfile.controller");

// 🔒 HR / Admin only
router.post(
  "/:userId",
  AuthMiddleware(["admin", "hr", "managing-director"]),
  upsertOrganizationProfile
);

// 👤 Get profile by user
router.get(
  "/user/:userId",
  AuthMiddleware(["admin", "hr"]),
  getOrganizationProfileByUser
);

// 📋 Get all profiles
router.get(
  "/",
  AuthMiddleware(["admin", "hr"]),
  getAllOrganizationProfiles
);

// 🕘 Profile history (audit)
router.get(
  "/history/:userId",
  AuthMiddleware(["admin", "hr"]),
  getProfileHistory
);

module.exports = router;
