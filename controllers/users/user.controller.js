const User = require('../../models/User.model');
const OrganizationProfile = require("../../models/OrganizationProfile.model");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, message: "User created successfully", data: user });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to create user", error: error.message });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password'); // exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user profile", error: error.message });
  }
};

// Update user profile by ID
// exports.updateUserProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Only allow certain fields to be updated
//     const allowedFields = ["name", "email", "phone", "role"];
//     const updatedFields = {};
//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) updatedFields[field] = updateData[field];
//     });

//     const user = await User.findByIdAndUpdate(id, updatedFields, { new: true }).select('-password');
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, message: "Profile updated successfully", data: user });
//   } catch (error) {
//     console.error("UPDATE USER PROFILE ERROR:", error);
//     res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
//   }
// };



exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1️⃣ Update User fields (email, role)
    const allowedUserFields = ["email", "role", "isVerified"];
    const userFieldsToUpdate = {};
    allowedUserFields.forEach(field => {
      if (updateData[field] !== undefined) userFieldsToUpdate[field] = updateData[field];
    });

    const user = await User.findByIdAndUpdate(id, userFieldsToUpdate, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Update / Create OrganizationProfile
    const allowedProfileFields = [
      "name",
      "phone",
      "designation",
      "workplace",
      "territory",
      "area",
      "areaManager",
      "zonalManager",
      "profilePic"
    ];

    const profileFieldsToUpdate = {};
    allowedProfileFields.forEach(field => {
      if (updateData[field] !== undefined) profileFieldsToUpdate[field] = updateData[field];
    });

    let orgProfile = await OrganizationProfile.findOne({ userId: user._id });

    if (orgProfile) {
      // ✅ Update existing profile
      orgProfile.set(profileFieldsToUpdate);
      // Add to history
      orgProfile.history.push({ action: "Profile Updated", details: JSON.stringify(profileFieldsToUpdate) });
      await orgProfile.save();
    } else {
      // ✅ Create new profile
      orgProfile = await OrganizationProfile.create({
        userId: user._id,
        ...profileFieldsToUpdate,
        history: [{ action: "Profile Created", details: JSON.stringify(profileFieldsToUpdate) }]
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile and organization profile updated successfully",
      data: { user, organizationProfile: orgProfile }
    });
  } catch (error) {
    console.error("UPDATE USER PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};




// 1️⃣ Get organization profile for a single user
exports.getOrganizationProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user first (optional)
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch organization profile
    const orgProfile = await OrganizationProfile.findOne({ userId });
    if (!orgProfile) {
      return res.status(404).json({ success: false, message: "Organization profile not found" });
    }

    res.status(200).json({
      success: true,
      data: { user, organizationProfile: orgProfile }
    });

  } catch (error) {
    console.error("GET ORGANIZATION PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization profile",
      error: error.message
    });
  }
};



exports.getAllOrganizationProfiles = async (req, res) => {
  try {
    // Fetch all organization profiles and populate full user info
    const orgProfiles = await OrganizationProfile.find().populate('userId');

    res.status(200).json({
      success: true,
      count: orgProfiles.length,
      data: orgProfiles // will include all fields from org profile + full user object
    });
  } catch (error) {
    console.error("GET ALL ORGANIZATION PROFILES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organization profiles",
      error: error.message
    });
  }
};

