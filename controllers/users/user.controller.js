const User = require('../../models/User.model');

// GET all users with optional limit & pagination
exports.getAllUsers = async (req, res) => {
  try {
    // Default limit = 2 if not provided
    const limit = parseInt(req.query.limit) || 2; 
    const page = parseInt(req.query.page) || 1; 
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      total: totalUsers,
      page,
      limit,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE user (test purpose)
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
