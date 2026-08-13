const express = require("express");
const jwt = require("jsonwebtoken");
const Trip = require("../models/Trip");

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

/*
  GET /api/trips

  Get the logged-in user's trips
*/
router.get("/", authenticateToken, async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.user.userId,
    })
      .populate("destination")
      .sort({ startDate: 1 });

    res.json(trips);
  } catch (error) {
    console.error("Get trips error:", error);

    res.status(500).json({
      message: "Failed to fetch trips",
    });
  }
});

/*
  POST /api/trips

  Create a new trip
*/
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      destinationId,
      name,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (
      !destinationId ||
      !name ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Destination, trip name, start date and end date are required",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message:
          "End date cannot be before start date",
      });
    }

    const trip = await Trip.create({
      user: req.user.userId,
      destination: destinationId,
      name,
      startDate,
      endDate,
      notes: notes || "",
    });

    const populatedTrip =
      await trip.populate("destination");

    res.status(201).json(populatedTrip);
  } catch (error) {
    console.error("Create trip error:", error);

    res.status(500).json({
      message: "Failed to create trip",
    });
  }
});

/*
  DELETE /api/trips/:id

  Delete one of the logged-in user's trips
*/
router.delete(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const trip =
        await Trip.findOneAndDelete({
          _id: req.params.id,
          user: req.user.userId,
        });

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found",
        });
      }

      res.json({
        message: "Trip deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete trip error:",
        error
      );

      res.status(500).json({
        message: "Failed to delete trip",
      });
    }
  }
);

module.exports = router;