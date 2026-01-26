const express = require("express");
const { createMarketPoint, getMarketPoints, getMarketPointsByTerritory, deleteMarketPoint, getMarketPointById } = require("../controllers/marketPoint/marketPoint.controller");


const router = express.Router();

router.post("/", createMarketPoint);
router.get("/", getMarketPoints);
router.get("/territory/:territoryId", getMarketPointsByTerritory);
router.get("/:id", getMarketPointById);
router.delete("/:id", deleteMarketPoint);

module.exports = router;
