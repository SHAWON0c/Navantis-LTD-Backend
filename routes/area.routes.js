const express = require("express");
const router = express.Router();

// ✅ import controller functions
const {
  createArea,
  updateAreaManagers,
  getAreas
} = require("../controllers/area/area.controller");

// ---------------- ROUTES ----------------

// Create area (area name only)
router.post("/", createArea);

// Update area manager & zonal manager
router.patch("/:id", updateAreaManagers);

// Get all areas
router.get("/", getAreas);

// ----------------------------------------

module.exports = router;
