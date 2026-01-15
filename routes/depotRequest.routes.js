const express = require("express");
const router = express.Router();
const {
  createDepotRequest,

  updateDepotRequestStatus,
  getDepotRequestsByStatus
} = require("../controllers/depot/depotRequest.controller");

// Create a depot request
router.post("/", createDepotRequest);

// Get all depot requests
router.get("/pending", (req, res) => getDepotRequestsByStatus({ ...req, params: { status: "pending" } }, res));
router.get("/approved", (req, res) => getDepotRequestsByStatus({ ...req, params: { status: "approved" } }, res));


// Update request status
router.patch("/:id/status", updateDepotRequestStatus);

module.exports = router;
