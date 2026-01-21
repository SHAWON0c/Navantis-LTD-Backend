const Customer = require("../../models/customer.model");
const User = require("../../models/User.model");
const OrganizationProfile = require("../../models/OrganizationProfile.model");

const createCustomer = async (req, res) => {
  try {
    if (!req.body.addedBy) {
      return res.status(400).json({ success: false, message: "addedBy is required" });
    }

    const customer = await Customer.create({
      customerName: req.body.customerName,
      territoryId: req.body.territoryId,
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
      addedBy: req.body.addedBy,
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
      return res.status(400).json({ success: false, message: `${fieldMap[field]} already exists` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};



// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("territoryId", "name")
      .populate("addedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET CUSTOMER BY ID
// const getCustomerById = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id)
//       .populate({
//         path: "territoryId",
//         populate: {
//           path: "areaId",
//           populate: [
//             // OrganizationProfile → name
//             { path: "areaManagerId", model: "OrganizationProfiles", select: "name" },
//             { path: "zonalManagerId", model: "OrganizationProfiles", select: "name" },
//             // User → email
//             { path: "areaManagerId", model: "User", select: "email" },
//             { path: "zonalManagerId", model: "User", select: "email" }
//           ]
//         }
//       });

//     if (!customer) {
//       return res.status(404).json({ success: false, message: "Customer not found" });
//     }

//     res.status(200).json({ success: true, data: customer });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


const getCustomerById = async (req, res) => {
  try {
    // Step 1: populate User emails
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: "territoryId",
        populate: {
          path: "areaId",
          populate: [
            { path: "areaManagerId", model: "User", select: "email" },
            { path: "zonalManagerId", model: "User", select: "email" },
          ],
        },
        populate: {
          path: "areaId",
          populate: [
            { path: "areaManagerId", model: "organizatonProfile", select: "name" },
    
          ],
        },
      })
      .populate("addedBy", "name email");

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const area = customer.territoryId?.areaId;
    if (!area) {
      return res.status(200).json({ success: true, data: customer });
    }

    // Step 2: fetch OrganizationProfiles for both managers in a single query
    const managerIds = [
      area.areaManagerId?._id,
      area.zonalManagerId?._id
    ].filter(Boolean);

    const profiles = await OrganizationProfile.find({ userId: { $in: managerIds } })
      .select("userId name phone profilePic areaManager zonalManager");

    // Step 3: attach OrganizationProfile info
    profiles.forEach(profile => {
      if (area.areaManagerId?._id.equals(profile.userId)) {
        area.areaManagerId.name = profile.name;
        area.areaManagerId.phone = profile.phone;
        area.areaManagerId.profilePic = profile.profilePic;
        area.areaManagerId.areaManager = profile.areaManager;
        area.areaManagerId.zonalManager = profile.zonalManager;
      }
      if (area.zonalManagerId?._id.equals(profile.userId)) {
        area.zonalManagerId.name = profile.name;
        area.zonalManagerId.phone = profile.phone;
        area.zonalManagerId.profilePic = profile.profilePic;
        area.zonalManagerId.areaManager = profile.areaManager;
        area.zonalManagerId.zonalManager = profile.zonalManager;
      }
    });

    res.status(200).json({ success: true, data: customer });

  } catch (error) {
    console.error(error);
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

    // validate status
    if (!["pending", "approved", "active"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending' or 'approved'",
      });
    }

    const customers = await Customer.find({ status })
      .populate("territoryId", "territoryName")
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
