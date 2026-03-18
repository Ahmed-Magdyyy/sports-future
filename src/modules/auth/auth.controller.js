const jwt = require("jsonwebtoken");
const User = require("../users/user.model");

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "sports_future_super_secret_key",
    { expiresIn: "1d" } // 1 day
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || "sports_future_refresh_super_secret_key",
    { expiresIn: "30d" } // 30 days
  );

  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if any user exists in the DB
    const userCount = await User.countDocuments();
    
    // Seed initial admin if DB is empty
    if (userCount === 0) {
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "secret123";
      
      if (username === adminUsername && password === adminPassword) {
        const adminUser = await User.create({
          username: adminUsername,
          email: "admin@sportsfuture.com",
          password: adminPassword,
        });

        const { accessToken, refreshToken } = generateTokens(adminUser._id);

        return res.status(200).json({
          success: true,
          message: "تم إنشاء حساب المسؤول الأول وتسجيل الدخول بنجاح",
          token: accessToken,
          refreshToken,
          user: {
            id: adminUser._id,
            username: adminUser.username,
            email: adminUser.email,
          }
        });
      }
    }

    // Normal login flow
    // Find user by either username or email
    const user = await User.findOne({ 
      $or: [{ email: username }, { username: username }] 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body; // Expect refresh token from body

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "sports_future_refresh_super_secret_key",
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ success: false, message: "User not found" });
        }

        const newAccessToken = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET || "sports_future_super_secret_key",
          { expiresIn: "1d" }
        );

        res.status(200).json({
          success: true,
          token: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
       return res.status(400).json({ success: false, message: "يرجى توفير اسم المستخدم، البريد الإلكتروني، وكلمة المرور" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: "هذا المستخدم موجود مسبقاً" });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "تم إنشاء المستخدم بنجاح",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "بيانات المستخدم غير صالحة" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
