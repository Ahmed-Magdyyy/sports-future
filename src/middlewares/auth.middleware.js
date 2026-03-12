const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "sports_future_super_secret_key",
      );

      // In a real app we'd fetch the user from DB, but here we just check role
      if (decoded.role !== "admin") {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized as admin" });
      }

      req.user = decoded; // { role: 'admin', iat, exp }
      next();
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

module.exports = protect;
