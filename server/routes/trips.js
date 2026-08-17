const express = require("express");
const jwt = require("jsonwebtoken");
const Trip = require("../models/Trip");

const router = express.Router();

/*
  =========================================
  AUTHENTICATION MIDDLEWARE
  =========================================
*/

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
  =========================================
  GET ALL USER TRIPS
  GET /api/trips
  =========================================
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
  =========================================
  GET ONE USER TRIP
  GET /api/trips/:id
  =========================================
*/

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        user: req.user.userId,
      }).populate("destination");

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found",
        });
      }

      res.json(trip);
    } catch (error) {
      console.error("Get trip error:", error);

      res.status(500).json({
        message: "Failed to fetch trip",
      });
    }
  }
);

/*
  =========================================
  CREATE TRIP
  POST /api/trips
  =========================================
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
  =========================================
  UPDATE TRIP
  PUT /api/trips/:id
  =========================================
*/

router.put(
  "/:id",
  authenticateToken,
  async (req, res) => {
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

      const trip = await Trip.findOne({
        _id: req.params.id,
        user: req.user.userId,
      });

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found",
        });
      }

      trip.destination = destinationId;
      trip.name = name;
      trip.startDate = startDate;
      trip.endDate = endDate;
      trip.notes = notes || "";

      await trip.save();

      const updatedTrip =
        await trip.populate("destination");

      res.json(updatedTrip);
    } catch (error) {
      console.error("Update trip error:", error);

      res.status(500).json({
        message: "Failed to update trip",
      });
    }
  }
);

/*
  =========================================
  DELETE TRIP
  DELETE /api/trips/:id
  =========================================
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