const express = require("express");
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  getCustomersByStatus
} = require("../controllers/customers/customer.controller");

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getAllCustomers);
router.get("/status/:status", getCustomersByStatus);
router.get("/:id", getCustomerById);
router.patch("/:id", updateCustomer);

module.exports = router;
