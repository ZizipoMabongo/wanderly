const express = require("express");
const Review = require("../models/Review");
const optionalAuth = require("../middleware/optionalAuth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

/*
  =========================================
  GET /api/reviews/:placeId

  Public reviews for a place, plus the
  requesting user's own private reviews
  for that place if they're logged in.
  =========================================
*/

router.get("/:placeId", optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    const query = req.user
      ? {
          placeId,
          $or: [
            { visibility: "public" },
            { visibility: "private", user: req.user.userId },
          ],
        }
      : { placeId, visibility: "public" };

    const reviews = await Review.find(query)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      message: "Failed to fetch reviews",
    });
  }
});

/*
  =========================================
  POST /api/reviews/:placeId

  Create a review. Works for both guests and
  logged-in users:
    - Logged-in users may choose public or private
    - Guests are always public (no account to
      privately store the review against) and
      must supply a guestName

  multipart/form-data:
    rating       (required, 1-5)
    text         (optional)
    visibility   ("public" | "private", default "public")
    guestName    (required if not logged in)
    placeName    (required)
    images       (up to 6 image files)
  =========================================
*/

router.post(
  "/:placeId",
  optionalAuth,
  upload.array("images", 6),
  async (req, res) => {
    try {
      const { placeId } = req.params;
      const { rating, text, visibility, guestName, placeName } = req.body;

      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          message: "A rating between 1 and 5 is required",
        });
      }

      if (!placeName) {
        return res.status(400).json({
          message: "placeName is required",
        });
      }

      if (!req.user && !guestName) {
        return res.status(400).json({
          message: "Name is required for guest reviews",
        });
      }

      const images = (req.files || []).map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));

      const review = await Review.create({
        placeId,
        placeName,
        user: req.user ? req.user.userId : null,
        guestName: req.user ? "" : guestName,
        rating: Number(rating),
        text: text || "",
        images,
        // Guests can only ever post public reviews.
        visibility: req.user && visibility === "private" ? "private" : "public",
      });

      const populatedReview = await review.populate("user", "name");

      res.status(201).json(populatedReview);
    } catch (error) {
      console.error("Create review error:", error);

      res.status(500).json({
        message: "Failed to create review",
      });
    }
  }
);

/*
  =========================================
  DELETE /api/reviews/:id

  Only the review's own author may delete it.
  Guest reviews can't be deleted this way since
  there's no account to authenticate against —
  handle abuse reports separately if needed.
  =========================================
*/

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await review.deleteOne();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      message: "Failed to delete review",
    });
  }
});

module.exports = router;
