const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const destinationRoutes = require("./routes/destinations");
const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const tripsRoutes = require("./routes/trips");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================
   MIDDLEWARE
   ========================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://wanderly-client.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/* =========================================
   ROUTES
   ========================================= */

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Wanderly API 🌍",
    status: "running",
  });
});

app.use("/api/destinations", destinationRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/favorites", favoritesRoutes);
app.use("/api/trips", tripsRoutes);

/* =========================================
   404 HANDLER
   ========================================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* =========================================
   ERROR HANDLER
   ========================================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    message: "Internal server error",
  });
});

/* =========================================
   MONGODB CONNECTION
   ========================================= */

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ MONGO_URI is missing from .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log(
      `MongoDB connected: ${mongoose.connection.host}`
    );
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });

/* =========================================
   START SERVER
   ========================================= */

app.listen(PORT, () => {
  console.log(
    `Wanderly API running on http://localhost:${PORT}`
  );
});