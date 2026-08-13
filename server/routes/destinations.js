const express = require("express");
const Destination = require("../models/Destination");

const router = express.Router();

/*
  GET /api/destinations

  Get all destinations
*/
router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find().sort({
      createdAt: -1,
    });

    res.json(destinations);
  } catch (error) {
    console.error("Get destinations error:", error);

    res.status(500).json({
      message: "Failed to fetch destinations",
    });
  }
});

/*
  GET /api/destinations/:id

  Get one destination
*/
router.get("/:id", async (req, res) => {
  try {
    const destination =
      await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    res.json(destination);
  } catch (error) {
    console.error("Get destination error:", error);

    res.status(500).json({
      message: "Failed to fetch destination",
    });
  }
});

module.exports = router;