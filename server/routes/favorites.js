const express = require("express");
const jwt = require("jsonwebtoken");
const Favorite = require("../models/Favorite");

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

// GET /api/favorites
router.get("/", authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user.userId,
    })
      .populate("destination")
      .sort({ createdAt: -1 });

    res.json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);

    res.status(500).json({
      message: "Failed to fetch saved destinations",
    });
  }
});

// POST /api/favorites/:destinationId
router.post(
  "/:destinationId",
  authenticateToken,
  async (req, res) => {
    try {
      const favorite = await Favorite.create({
        user: req.user.userId,
        destination: req.params.destinationId,
      });

      const populatedFavorite =
        await favorite.populate("destination");

      res.status(201).json(populatedFavorite);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Destination already saved",
        });
      }

      console.error("Save favorite error:", error);

      res.status(500).json({
        message: "Failed to save destination",
      });
    }
  }
);

// DELETE /api/favorites/:destinationId
router.delete(
  "/:destinationId",
  authenticateToken,
  async (req, res) => {
    try {
      const favorite =
        await Favorite.findOneAndDelete({
          user: req.user.userId,
          destination: req.params.destinationId,
        });

      if (!favorite) {
        return res.status(404).json({
          message: "Destination is not saved",
        });
      }

      res.json({
        message: "Destination removed from saved places",
      });
    } catch (error) {
      console.error("Remove favorite error:", error);

      res.status(500).json({
        message: "Failed to remove destination",
      });
    }
  }
);

module.exports = router;