// routes/designationPermission.routes.js
const express = require("express");
const router = express.Router();
const {
  createOrUpdateDesignationPermission,
  getAllDesignationPermissions
} = require("../controllers/permissions/designationPermission.controller");

// POST /api/permissions/designation
router.post("/designation", createOrUpdateDesignationPermission);

// GET /api/permissions/designation
router.get("/designation", getAllDesignationPermissions);

module.exports = router;
