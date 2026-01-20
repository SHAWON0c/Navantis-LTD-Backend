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



exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch user info (exclude password)
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Fetch organization profile linked to this user
    const organizationProfile = await OrganizationProfile.findOne({ userId: id });

    // 3️⃣ Return combined response
    res.status(200).json({
      success: true,
      data: {
        user,
        organizationProfile: organizationProfile || null, // if no org profile, return null
      },
    });
  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};






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


exports.getAreaAndZonalManagers = async (req, res) => {
  try {
    // 🔹 Fetch users by role
    const areaManagers = await User.find({ role: "AM" }).select("-password");
    const zonalManagers = await User.find({ role: "ZM" }).select("-password");

    // 🔹 Attach organization profiles
    const attachProfile = async (users) => {
      return Promise.all(
        users.map(async (user) => {
          const profile = await OrganizationProfile.findOne({
            userId: user._id,
          });

          return {
            user,
            organizationProfile: profile || null,
          };
        })
      );
    };

    const areaManagerData = await attachProfile(areaManagers);
    const zonalManagerData = await attachProfile(zonalManagers);

    res.status(200).json({
      success: true,
      data: {
        areaManagers: areaManagerData,
        zonalManagers: zonalManagerData,
      },
    });
  } catch (error) {
    console.error("GET MANAGERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch managers",
      error: error.message,
    });
  }
};



// exports.getAreaAndZonalManagers = async (req, res) => {
//   try {
//     // 🔹 Fetch users by role
//     const areaManagers = await User.find({ role: "AM" }).select("_id");
//     const zonalManagers = await User.find({ role: "ZM" }).select("_id");

//     // 🔹 Attach organization profiles
//     const attachProfile = async (users) => {
//       return Promise.all(
//         users.map(async (user) => {
//           const profile = await OrganizationProfile.findOne({ userId: user._id }).select("name");

//           return {
//             id: user._id,                        // MongoDB User _id
//             userId: user._id,                     // for frontend
//             name: profile?.name || null,         // name from OrganizationProfile
//           };
//         })
//       );
//     };

//     const areaManagerData = await attachProfile(areaManagers);
//     const zonalManagerData = await attachProfile(zonalManagers);

//     res.status(200).json({
//       success: true,
//       data: {
//         areaManagers: areaManagerData,
//         zonalManagers: zonalManagerData,
//       },
//     });
//   } catch (error) {
//     console.error("GET MANAGERS ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch managers",
//       error: error.message,
//     });
//   }
// };
