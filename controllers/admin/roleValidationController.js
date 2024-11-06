// controllers/admin/roleValidationController.js
const User = require("../../models/User");
const mongoose = require("mongoose");

// Get user by ID (Admin or user can access their own data)
exports.checkAAdminRole = async (req, res) => {
  const userId = req.user.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID." });
  }
  try {
    const user = await User.findById(userId).select("role");
    if (!user) return res.status(404).json({ message: "User not found." });
    // console.log("AK_ROLE", process.env.AK_ROLE);
    const isValidRole = user.role === process.env.AK_ROLE;
    // console.log("isValidRole", isValidRole);
    res.status(200).json(isValidRole);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
