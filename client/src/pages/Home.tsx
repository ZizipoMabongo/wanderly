import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

interface Destination {
  _id: string;
  name: string;
  location: string;
  country: string;
  description: string;
  image: string;
  category?: string;
  rating?: number;
  tags?: string[];
  priceLevel?: number;
}

interface Favorite {
  _id: string;
  destination: Destination;
}

function Home() {
  const { token } = useAuth();

  const [destinations, setDestinations] = useState<
    Destination[]
  >([]);

  const [favorites, setFavorites] = useState<string[]>(
    []
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [favoriteLoading, setFavoriteLoading] =
    useState<string | null>(null);

  /*
    Fetch all destinations
  */
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/destinations`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch destinations"
          );
        }

        const data: Destination[] =
          await response.json();

        setDestinations(data);
      } catch (error) {
        console.error(
          "Failed to fetch destinations:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  /*
    Fetch user's saved destinations
  */
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        setFavorites([]);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data: Favorite[] =
          await response.json();

        const savedIds = data
          .filter(
            (favorite) => favorite.destination
          )
          .map(
            (favorite) =>
              favorite.destination._id
          );

        setFavorites(savedIds);
      } catch (error) {
        console.error(
          "Failed to fetch favorites:",
          error
        );
      }
    };

    fetchFavorites();
  }, [token]);

  /*
    Add or remove a destination from favorites
  */
  const handleFavorite = async (
    event: MouseEvent,
    destinationId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      alert(
        "Please log in to save destinations."
      );
      return;
    }

    setFavoriteLoading(destinationId);

    const isFavorite =
      favorites.includes(destinationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/favorites/${destinationId}`,
        {
          method: isFavorite
            ? "DELETE"
            : "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Something went wrong."
        );
        return;
      }

      if (isFavorite) {
        setFavorites((current) =>
          current.filter(
            (id) =>
              id !== destinationId
          )
        );
      } else {
        setFavorites((current) => [
          ...current,
          destinationId,
        ]);
      }
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      alert(
        "Unable to update saved destination."
      );
    } finally {
      setFavoriteLoading(null);
    }
  };

  /*
    Search destinations

    Searches through:
    - destination name
    - city/location
    - country
    - description
    - category
    - tags
  */
  const searchTerm = search
    .trim()
    .toLowerCase();

  const filteredDestinations =
    destinations.filter(
      (destination) => {
        // Show everything when search is empty
        if (!searchTerm) {
          return true;
        }

        const searchableText = [
          destination.name,
          destination.location,
          destination.country,
          destination.description,
          destination.category,
          ...(destination.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          searchTerm
        );
      }
    );

  return (
    <main className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-badge">
            ✈️ Your journey starts here
          </span>

          <h1>
            Discover places
            <br />
            <span>
              worth wandering to.
            </span>
          </h1>

          <p>
            Explore beautiful destinations,
            discover new experiences, and plan
            your next unforgettable adventure
            with Wanderly.
          </p>

          {/* SEARCH */}
          <div className="hero-search">
            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Where do you want to go?"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(
                    "destinations"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore
            </button>
          </div>

          {/* HERO STATS */}
          <div className="hero-stats">
            <div>
              <strong>
                {destinations.length}+
              </strong>

              <span>
                Destinations
              </span>
            </div>

            <div>
              <strong>
                100+
              </strong>

              <span>
                Experiences
              </span>
            </div>

            <div>
              <strong>
                4.9
              </strong>

              <span>
                Average rating
              </span>
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <span>
            Scroll to explore
          </span>

          <span>↓</span>
        </div>
      </section>

      {/* DESTINATIONS SECTION */}
      <section
        id="destinations"
        className="destinations-section"
      >
        <div className="section-heading">
          <div>
            <span className="section-label">
              EXPLORE THE WORLD
            </span>

            <h2>
              Find your next
              <span>
                {" "}
                adventure.
              </span>
            </h2>
          </div>

          <p>
            From vibrant cities to peaceful
            escapes, discover destinations that
            inspire your next journey.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />

            <p>
              Discovering
              destinations...
            </p>
          </div>
        ) : /* NO SEARCH RESULTS */
        filteredDestinations.length ===
          0 ? (
          <div className="empty-state">
            <div>🌍</div>

            <h3>
              No destinations found
            </h3>

            <p>
              We couldn't find a destination
              matching "{search}".
            </p>

            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              Show all destinations
            </button>
          </div>
        ) : (
          /* DESTINATION GRID */
          <div className="destination-grid">
            {filteredDestinations.map(
              (destination) => {
                const isFavorite =
                  favorites.includes(
                    destination._id
                  );

                return (
                  <Link
                    key={
                      destination._id
                    }
                    to={`/destinations/${destination._id}`}
                    className="destination-card"
                  >
                    {/* IMAGE */}
                    <div className="destination-image-wrapper">
                      <img
                        src={
                          destination.image
                        }
                        alt={
                          destination.name
                        }
                        className="destination-image"
                      />

                      <div className="destination-image-overlay" />

                      {/* CATEGORY */}
                      {destination.category && (
                        <span className="destination-category">
                          {
                            destination.category
                          }
                        </span>
                      )}

                      {/* FAVORITE */}
                      <button
                        type="button"
                        className={`favorite-button ${
                          isFavorite
                            ? "saved"
                            : ""
                        }`}
                        onClick={(
                          event
                        ) =>
                          handleFavorite(
                            event,
                            destination._id
                          )
                        }
                        aria-label={
                          isFavorite
                            ? "Remove from saved destinations"
                            : "Save destination"
                        }
                      >
                        {favoriteLoading ===
                        destination._id
                          ? "..."
                          : isFavorite
                          ? "♥"
                          : "♡"}
                      </button>

                      <span className="destination-arrow">
                        ↗
                      </span>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="destination-card-content">
                      <div className="destination-location">
                        📍{" "}
                        {
                          destination.location
                        }
                        {destination.country &&
                          `, ${destination.country}`}
                      </div>

                      <h3>
                        {
                          destination.name
                        }
                      </h3>

                      <p>
                        {
                          destination.description
                        }
                      </p>

                      {/* TAGS */}
                      {destination.tags &&
                        destination.tags
                          .length >
                          0 && (
                          <div className="destination-tags">
                            {destination.tags
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  tag
                                ) => (
                                  <span
                                    key={
                                      tag
                                    }
                                  >
                                    #
                                    {
                                      tag
                                    }
                                  </span>
                                )
                              )}
                          </div>
                        )}

                      <div className="destination-card-footer">
                        <span>
                          ⭐{" "}
                          {destination.rating ||
                            "4.8"}
                        </span>

                        <span className="discover-link">
                          Discover →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* EXPERIENCE SECTION */}
      <section className="experience-section">
        <div className="experience-content">
          <span className="section-label">
            MORE THAN A DESTINATION
          </span>

          <h2>
            Travel is about
            <span>
              {" "}
              the stories.
            </span>
          </h2>

          <p>
            Wanderly helps you discover places
            that become memories. Find
            destinations, explore experiences,
            and create journeys worth
            remembering.
          </p>

          <Link
            to="/register"
            className="experience-button"
          >
            Start exploring
            <span>→</span>
          </Link>
        </div>

        <div className="experience-decoration">
          <div className="floating-card card-one">
            <span>🌴</span>

            <div>
              <strong>
                Beach escape
              </strong>

              <small>
                Paradise awaits
              </small>
            </div>
          </div>

          <div className="floating-card card-two">
            <span>🏔️</span>

            <div>
              <strong>
                Mountain adventure
              </strong>

              <small>
                Find your wild
              </small>
            </div>
          </div>

          <div className="floating-card card-three">
            <span>🌆</span>

            <div>
              <strong>
                City discovery
              </strong>

              <small>
                Explore something
                new
              </small>
            </div>
          </div>

          <div className="experience-circle">
            ✈️
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;