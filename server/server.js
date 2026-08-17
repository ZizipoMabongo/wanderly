const dns = require("dns");

// Fix MongoDB Atlas DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const destinationRoutes = require("./routes/destinations");
const discoveryRoutes = require("./routes/discovery");
const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const tripsRoutes = require("./routes/trips");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================
   CORS
========================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://wanderly-client.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // such as curl/Postman/server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);

    return callback(
      new Error("Not allowed by CORS")
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/* =========================================
   GENERAL MIDDLEWARE
========================================= */

app.use(express.json());

/* =========================================
   HEALTH CHECK
========================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Wanderly API 🌍",
    status: "running",
  });
});

/* =========================================
   API ROUTES
========================================= */

app.use(
  "/api/destinations",
  destinationRoutes
);

app.use(
  "/api/discovery",
  discoveryRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/favorites",
  favoritesRoutes
);

app.use(
  "/api/trips",
  tripsRoutes
);

/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================================
   ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS origin not allowed",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

/* =========================================
   MONGODB CONNECTION
========================================= */

// We use MONGO_URI from server/.env
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ MONGO_URI is not defined");
  console.error(
    "Make sure server/.env contains MONGO_URI=..."
  );
  process.exit(1);
}

/* =========================================
   START SERVER
========================================= */

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("=================================");
    console.log("✅ MongoDB connected successfully");
    console.log(
      `📦 Database: ${mongoose.connection.name}`
    );
    console.log(
      `🌐 MongoDB host: ${mongoose.connection.host}`
    );
    console.log("=================================");

    app.listen(PORT, () => {
      console.log(
        `🚀 Wanderly API running on http://localhost:${PORT}`
      );

      console.log(
        `📍 Destinations: http://localhost:${PORT}/api/destinations`
      );

      console.log(
        `❤️ Favorites: http://localhost:${PORT}/api/favorites`
      );

      console.log(
        `🗺️ Trips: http://localhost:${PORT}/api/trips`
      );

      console.log(
        `🔐 Auth: http://localhost:${PORT}/api/auth`
      );
    });
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB connection failed:"
    );

    console.error(error.message);

    process.exit(1);
  });