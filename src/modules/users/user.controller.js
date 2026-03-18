const User = require("./user.model");

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Optional: Prevent deleting the last admin or yourself
    const count = await User.countDocuments();
    if (count <= 1) {
       return res.status(400).json({ success: false, message: "Cannot delete the only admin user" });
    }
    
    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
       return res.status(400).json({ success: false, message: "لا يمكنك حذف حسابك الخاص أثناء تسجيل الدخول" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
