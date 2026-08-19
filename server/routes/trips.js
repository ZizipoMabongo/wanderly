const express = require("express");
const jwt = require("jsonwebtoken");
const Trip = require("../models/Trip");
const { upload } = require("../config/cloudinary");

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

router.get("/:id", authenticateToken, async (req, res) => {
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
});

/*
  =========================================
  CREATE TRIP
  POST /api/trips

  Now accepts either:
    - destinationId  (legacy Mongo Destination _id), OR
    - placeId + placeName + placeImage + placeLocation
      (from a SerpAPI search result)
  =========================================
*/

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      destinationId,
      placeId,
      placeName,
      placeImage,
      placeLocation,
      name,
      startDate,
      endDate,
      notes,
    } = req.body;

    const hasLegacyDestination = Boolean(destinationId);
    const hasSerpPlace = Boolean(placeId && placeName);

    if (!hasLegacyDestination && !hasSerpPlace) {
      return res.status(400).json({
        message: "A destination is required",
      });
    }

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        message: "Trip name, start date and end date are required",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    const trip = await Trip.create({
      user: req.user.userId,
      destination: destinationId || null,
      placeId: placeId || "",
      placeName: placeName || "",
      placeImage: placeImage || "",
      placeLocation: placeLocation || "",
      name,
      startDate,
      endDate,
      notes: notes || "",
    });

    const populatedTrip = await trip.populate("destination");

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

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      destinationId,
      placeId,
      placeName,
      placeImage,
      placeLocation,
      name,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        message: "Trip name, start date and end date are required",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
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

    trip.destination = destinationId || trip.destination;
    trip.placeId = placeId ?? trip.placeId;
    trip.placeName = placeName ?? trip.placeName;
    trip.placeImage = placeImage ?? trip.placeImage;
    trip.placeLocation = placeLocation ?? trip.placeLocation;
    trip.name = name;
    trip.startDate = startDate;
    trip.endDate = endDate;
    trip.notes = notes || "";

    await trip.save();

    const updatedTrip = await trip.populate("destination");

    res.json(updatedTrip);
  } catch (error) {
    console.error("Update trip error:", error);

    res.status(500).json({
      message: "Failed to update trip",
    });
  }
});

/*
  =========================================
  ADD / UPDATE POST-TRIP REVIEW
  PATCH /api/trips/:id/review

  multipart/form-data:
    rating   (required, 1-5)
    text     (optional — "how the trip went")
    images   (up to 6 image files)
  =========================================
*/

router.patch(
  "/:id/review",
  authenticateToken,
  upload.array("images", 6),
  async (req, res) => {
    try {
      const { rating, text } = req.body;

      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          message: "A rating between 1 and 5 is required",
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

      const newImages = (req.files || []).map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));

      trip.review = {
        rating: Number(rating),
        text: text || "",
        images: [...(trip.review?.images || []), ...newImages],
        reviewedAt: new Date(),
      };

      await trip.save();

      const updatedTrip = await trip.populate("destination");

      res.json(updatedTrip);
    } catch (error) {
      console.error("Add trip review error:", error);

      res.status(500).json({
        message: "Failed to save trip review",
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

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
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
    console.error("Delete trip error:", error);

    res.status(500).json({
      message: "Failed to delete trip",
    });
  }
});

module.exports = router;
