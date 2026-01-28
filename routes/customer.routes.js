const express = require("express");
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  getCustomersByStatus
} = require("../controllers/customers/customer.controller");
const AuthMiddleware = require("../middlewares/Authmiddleware");
const router = express.Router();

router.post("/",   AuthMiddleware(["admin", "managing-director"]), createCustomer);
router.get("/", getAllCustomers);
router.get("/status/:status", getCustomersByStatus);
router.get("/:id", getCustomerById);
router.patch("/:id", updateCustomer);

module.exports = router;
