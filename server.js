const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(
  "/api/championships",
  require("./src/modules/championships/championship.routes"),
);
app.use("/api/sports", require("./src/modules/sports/sport.routes"));
app.use("/api/coaches", require("./src/modules/coaches/coach.routes"));
app.use("/api/players", require("./src/modules/players/player.routes"));
app.use("/api/pages", require("./src/modules/pages/page.routes"));
app.use("/api/auth", require("./src/modules/auth/auth.routes"));
app.use(
  "/api/testimonials",
  require("./src/modules/testimonials/testimonial.routes"),
);
app.use("/api/gallery", require("./src/modules/gallery/gallery.routes"));
app.use("/api/upload", require("./src/modules/upload/upload.routes"));
app.use("/api/blogs", require("./src/modules/blogs/blog.routes"));

// Base Route
app.get("/", (req, res) => {
  res.send("🏆 Sports Future API is Running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
