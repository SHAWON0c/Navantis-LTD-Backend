const express = require("express");
const router = express.Router();
const territoryController = require("../controllers/territory/territory.controller");

// CRUD routes
router.get("/managers", territoryController.getTerritoriesWithManagers);
router.get("/", territoryController.getAllTerritories);
router.get("/:id", territoryController.getTerritoryById);
router.post("/", territoryController.createTerritory);
router.put("/:id", territoryController.updateTerritory);
router.delete("/:id", territoryController.deleteTerritory);
router.get("/summary/targets", territoryController.getTerritoryTargetSummary);

module.exports = router;
