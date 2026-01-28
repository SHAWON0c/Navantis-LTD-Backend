const Customer = require("../../models/customer.model");
const User = require("../../models/User.model");
const OrganizationProfile = require("../../models/OrganizationProfile.model");

const createCustomer = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const customer = await Customer.create({
      customerName: req.body.customerName,
      marketPointId: req.body.marketPointId,
      tradeLicense: req.body.tradeLicense,
      drugLicense: req.body.drugLicense,
      address: req.body.address,
      mobile: req.body.mobile,
      email: req.body.email,
      contactPerson: req.body.contactPerson,
      discount: req.body.discount,
      payMode: req.body.payMode,
      creditLimit: req.body.creditLimit,
      dayLimit: req.body.dayLimit,
      addedBy: req.user._id, // ✅ correct
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const fieldMap = {
        tradeLicenseLower: "Trade License",
        drugLicenseLower: "Drug License",
        mobileNormalized: "Mobile",
        emailNormalized: "Email",
      };

      return res.status(400).json({
        success: false,
        message: `${fieldMap[field]} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("marketPointId", "name")
      .populate("addedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: "marketPointId",
        populate: {
          path: "areaId",
          populate: [
            { path: "areaManagerId", model: "OrganizationProfile", select: "name" },
            { path: "zonalManagerId", model: "OrganizationProfile", select: "name" },
            { path: "areaManagerId", model: "User", select: "email" },
            { path: "zonalManagerId", model: "User", select: "email" }
          ]
        }
      })
      .populate("addedBy", "name email");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },        // allows partial update
      {
        new: true,               // return updated document
        runValidators: true      // enforce schema validation
      }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/customers/status/:status
const getCustomersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["pending", "approved", "active"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', or 'active'",
      });
    }

    const customers = await Customer.find({ status })
      .populate("marketPointId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// EXPORT ALL FUNCTIONS
module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  getCustomersByStatus
};
