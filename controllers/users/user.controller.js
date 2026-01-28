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



// exports.getUserProfile = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1️⃣ Fetch user info (exclude password)
//     const user = await User.findById(id).select("-password");
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // 2️⃣ Fetch organization profile linked to this user
//     const organizationProfile = await OrganizationProfile.findOne({ userId: id });

//     // 3️⃣ Return combined response
//     res.status(200).json({
//       success: true,
//       data: {
//         user,
//         organizationProfile: organizationProfile || null, // if no org profile, return null
//       },
//     });
//   } catch (error) {
//     console.error("GET USER PROFILE ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch user profile",
//       error: error.message,
//     });
//   }
// };







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
