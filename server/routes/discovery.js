const express = require("express");

const router = express.Router();

/*
  =========================================
  GET /api/discovery/search?q=Paris

  Live destination discovery using
  SerpAPI's Google Maps engine.

  Requires SERPAPI_KEY in server/.env
  =========================================
*/

router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    if (!process.env.SERPAPI_KEY) {
      console.error("SERPAPI_KEY is not defined");
      return res.status(500).json({
        message: "Search is not configured",
      });
    }

    const url =
      `https://serpapi.com/search.json` +
      `?engine=google_maps` +
      `&type=search` +
      `&q=${encodeURIComponent(query + " tourist attractions")}` +
      `&api_key=${process.env.SERPAPI_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI returned ${response.status}`);
    }

    const data = await response.json();

    const localResults = data.local_results || [];

    const destinations = localResults
      .filter((place) => place.title && place.place_id)
      .map((place) => ({
        externalId: place.place_id,
        // data_id is what SerpAPI's place-details lookup
        // actually wants — keep it alongside place_id.
        dataId: place.data_id || place.place_id,

        name: place.title,

        description:
          place.type ||
          (place.types && place.types[0]) ||
          "Discover this destination with Wanderly.",

        address: place.address || "",

        image: place.thumbnail || "",

        rating: place.rating || null,
        reviewsCount: place.reviews || null,

        location:
          place.gps_coordinates || null,

        source: "google_maps",
      }));

    // De-duplicate by place_id.
    const uniqueDestinations = Array.from(
      new Map(
        destinations.map((d) => [d.externalId, d])
      ).values()
    );

    res.json(uniqueDestinations.slice(0, 20));
  } catch (error) {
    console.error("Destination discovery error:", error);

    res.status(500).json({
      message: "Failed to discover destinations",
    });
  }
});

/*
  =========================================
  GET /api/discovery/place/:dataId

  Full place details (address, hours, photos,
  Google rating breakdown) for a single result,
  used on the destination detail page.
  =========================================
*/

router.get("/place/:dataId", async (req, res) => {
  try {
    const { dataId } = req.params;

    if (!dataId) {
      return res.status(400).json({
        message: "dataId is required",
      });
    }

    if (!process.env.SERPAPI_KEY) {
      console.error("SERPAPI_KEY is not defined");
      return res.status(500).json({
        message: "Search is not configured",
      });
    }

    const url =
      `https://serpapi.com/search.json` +
      `?engine=google_maps` +
      `&data_id=${encodeURIComponent(dataId)}` +
      `&api_key=${process.env.SERPAPI_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI returned ${response.status}`);
    }

    const data = await response.json();
    const place = data.place_results;

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.json({
      externalId: place.place_id,
      dataId: place.data_id,
      name: place.title,
      address: place.address || "",
      description: place.description || "",
      rating: place.rating || null,
      reviewsCount: place.reviews || null,
      images: (place.images || []).map((img) => img.thumbnail || img.image),
      hours: place.hours || null,
      location: place.gps_coordinates || null,
      website: place.website || "",
      phone: place.phone || "",
    });
  } catch (error) {
    console.error("Place details error:", error);

    res.status(500).json({
      message: "Failed to fetch place details",
    });
  }
});

module.exports = router;
