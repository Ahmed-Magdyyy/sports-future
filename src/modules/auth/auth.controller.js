const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "secret123";

    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET || "sports_future_super_secret_key",
        { expiresIn: "1d" },
      );

      return res.status(200).json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        token,
      });
    }

    return res.status(401).json({
      success: false,
      message: "بيانات الدخول غير صحيحة",
    });
  } catch (error) {
    console.error("Login Default Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
