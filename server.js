const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
require("dotenv").config();
const https = require("https");

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
app.use("/api/letters", require("./src/modules/letters/letter.routes"));
app.use("/api/products", require("./src/modules/products/product.routes"));
app.use("/api/users", require("./src/modules/users/user.routes"));

// Base Route
app.get("/", (req, res) => {
  res.send("🏆 Sports Future API is Running");
});

// Ping the server immediately after starting the server
pingServer();

// Ping the server every 14 minutes (14 * 60 * 1000 milliseconds)
const pingInterval = 14 * 60 * 1000;
if (!globalThis.__petyardPingIntervalId) {
  globalThis.__petyardPingIntervalId = setInterval(pingServer, pingInterval);
}

// Function to ping the server by hitting the specified API route
function pingServer() {
  const pingEndpoint = "https://sports-future.onrender.com";

  // Send a GET request to the ping endpoint
  const req = https
    .request(
      pingEndpoint,
      {
        method: "GET",
        headers: {
          "User-Agent": "sports-future-internal-ping",
          "X-Internal-Ping": "1",
        },
      },
      (res) => {
        console.log(`Ping sent to server: ${res.statusCode}`);
        res.resume();
      },
    )
    .on("error", (err) => {
      console.error("Error while sending ping:", err);
    });

  req.end();
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
