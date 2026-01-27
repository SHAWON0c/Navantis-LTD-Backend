const express = require("express");
const { updateDepotRequestStatus, createDepotRequest } = require("../controllers/depot/depotRequest.controller");
const router = express.Router();
const AuthMiddleware = require("../middlewares/Authmiddleware");

// Create a depot request
router.post("/", createDepotRequest);

// Get all depot requests
// router.get("/pending", (req, res) => getDepotRequestsByStatus({ ...req, params: { status: "pending" } }, res));
// router.get("/approved", (req, res) => getDepotRequestsByStatus({ ...req, params: { status: "approved" } }, res));

// router.get("/requested", (req, res) => getDepotRequestsByStatus({ ...req, params: { status: "requested" } }, res));



// Update request status
router.patch("/:id/status", AuthMiddleware(["admin", "managing-director"]),   updateDepotRequestStatus);

module.exports = router;
