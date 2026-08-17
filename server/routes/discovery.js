const express = require("express");

const router = express.Router();

/*
  GET /api/discovery/search?q=Paris

  Live destination discovery using Wikipedia.
*/

router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchQueries = [
      `${query} tourist attractions`,
      `${query} landmarks`,
      `${query} places to visit`,
    ];

    /*
      Terms that normally indicate that a result
      is NOT a tourist destination.
    */
    const excludedTerms = [
      "disambiguation",
      "film",
      "album",
      "song",
      "actor",
      "actress",
      "singer",
      "football",
      "basketball",
      "cricket",
      "athlete",
      "politician",
      "university",
      "school",
      "college",
      "administrative",
      "district",
      "municipality",
      "event",
      "championship",
      "olympics",
      "revolution",
      "war",
      "battle",
      "siege",
      "commune",
      "mythology",
      "personality",
      "model",
      "television",
      "documentary",
      "syndrome",
      "company",
      "business",
      "airport",
      "station",
      "railway",
      "metro",
      "subway",
      "highway",
      "arena",
      "stadium",
      "sports",
      "architecture of",
      "history of",
      "tourism in",
      "list of",
      "outline of",
      "opening ceremony",
      "paris las vegas",
      "kiribati",
    ];

    /*
      Search Wikipedia.
    */
    const results = await Promise.all(
      searchQueries.map(async (searchQuery) => {
        const url =
          `https://en.wikipedia.org/w/rest.php/v1/search/page` +
          `?q=${encodeURIComponent(searchQuery)}` +
          `&limit=20`;

        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Wanderly Travel App/1.0",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Wikipedia API returned ${response.status}`
          );
        }

        return response.json();
      })
    );

    /*
      Combine all results.
    */
    const allPages = results.flatMap(
      (result) => result.pages || []
    );

    /*
      Remove duplicate pages.
    */
    const uniquePages = Array.from(
      new Map(
        allPages.map((page) => [
          page.id,
          page,
        ])
      ).values()
    );

    /*
      Filter results.
    */
    const destinations = uniquePages
      .filter((page) => {
        const title = String(
          page.title || ""
        ).toLowerCase();

        const description = String(
          page.description ||
            page.excerpt ||
            ""
        ).toLowerCase();

        const text = `${title} ${description}`;

        /*
          Remove obviously unrelated content.
        */
        if (
          excludedTerms.some((term) =>
            text.includes(term)
          )
        ) {
          return false;
        }

        /*
          Make sure the search term is relevant.
        */
        const normalizedQuery =
          query.toLowerCase();

        if (
          !text.includes(normalizedQuery)
        ) {
          return false;
        }

        return true;
      })
      .map((page) => ({
        externalId: String(page.id),

        name: page.title,

        description:
          page.description ||
          page.excerpt ||
          "Discover this destination with Wanderly.",

        image: page.thumbnail?.url
          ? page.thumbnail.url.startsWith("//")
            ? `https:${page.thumbnail.url}`
            : page.thumbnail.url
          : "",

        source: "wikipedia",
      }));

    /*
      Remove duplicate destination names.
    */
    const uniqueDestinations =
      Array.from(
        new Map(
          destinations.map(
            (destination) => [
              destination.name.toLowerCase(),
              destination,
            ]
          )
        ).values()
      );

    /*
      Return up to 20 results.
    */
    res.json(
      uniqueDestinations.slice(0, 20)
    );
  } catch (error) {
    console.error(
      "Destination discovery error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to discover destinations",
    });
  }
});

module.exports = router;