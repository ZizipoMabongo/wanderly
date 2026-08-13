import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  category?: string;
  rating?: number;
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

  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/destinations`
        );

        const data = await response.json();

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

        const data: Favorite[] = await response.json();

        const savedIds = data
          .filter((favorite) => favorite.destination)
          .map(
            (favorite) => favorite.destination._id
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

  const handleFavorite = async (
    event: MouseEvent,
    destinationId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      alert("Please log in to save destinations.");
      return;
    }

    setFavoriteLoading(destinationId);

    const isFavorite =
      favorites.includes(destinationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/favorites/${destinationId}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Something went wrong."
        );
        return;
      }

      if (isFavorite) {
        setFavorites((current) =>
          current.filter(
            (id) => id !== destinationId
          )
        );
      } else {
        setFavorites((current) => [
          ...current,
          destinationId,
        ]);
      }
    } catch (error) {
      console.error("Favorite error:", error);
      alert(
        "Unable to update saved destination."
      );
    } finally {
      setFavoriteLoading(null);
    }
  };

  const filteredDestinations =
    destinations.filter(
      (destination) =>
        destination.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        destination.country
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-badge">
            ✈️ Your journey starts here
          </span>

          <h1>
            Discover places
            <br />
            <span>worth wandering to.</span>
          </h1>

          <p>
            Explore beautiful destinations, discover
            new experiences, and plan your next
            unforgettable adventure with Wanderly.
          </p>

          <div className="hero-search">
            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Where do you want to go?"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("destinations")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>50+</strong>
              <span>Destinations</span>
            </div>

            <div>
              <strong>100+</strong>
              <span>Experiences</span>
            </div>

            <div>
              <strong>4.9</strong>
              <span>Average rating</span>
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <span>Scroll to explore</span>
          <span>↓</span>
        </div>
      </section>

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
              <span> adventure.</span>
            </h2>
          </div>

          <p>
            From vibrant cities to peaceful escapes,
            discover destinations that inspire your
            next journey.
          </p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>
              Discovering destinations...
            </p>
          </div>
        ) : filteredDestinations.length ===
          0 ? (
          <div className="empty-state">
            <div>🌍</div>

            <h3>No destinations found</h3>

            <p>
              Try searching for another city or
              country.
            </p>
          </div>
        ) : (
          <div className="destination-grid">
            {filteredDestinations.map(
              (destination) => {
                const isFavorite =
                  favorites.includes(
                    destination._id
                  );

                return (
                  <Link
                    key={destination._id}
                    to={`/destinations/${destination._id}`}
                    className="destination-card"
                  >
                    <div className="destination-image-wrapper">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="destination-image"
                      />

                      <div className="destination-image-overlay" />

                      {destination.category && (
                        <span className="destination-category">
                          {destination.category}
                        </span>
                      )}

                      <button
                        type="button"
                        className={`favorite-button ${
                          isFavorite
                            ? "saved"
                            : ""
                        }`}
                        onClick={(event) =>
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

                    <div className="destination-card-content">
                      <div className="destination-location">
                        📍 {destination.country}
                      </div>

                      <h3>{destination.name}</h3>

                      <p>
                        {destination.description}
                      </p>

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

      <section className="experience-section">
        <div className="experience-content">
          <span className="section-label">
            MORE THAN A DESTINATION
          </span>

          <h2>
            Travel is about
            <span> the stories.</span>
          </h2>

          <p>
            Wanderly helps you discover places that
            become memories. Find destinations,
            explore experiences, and create journeys
            worth remembering.
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
              <strong>Beach escape</strong>
              <small>Paradise awaits</small>
            </div>
          </div>

          <div className="floating-card card-two">
            <span>🏔️</span>

            <div>
              <strong>Mountain adventure</strong>
              <small>Find your wild</small>
            </div>
          </div>

          <div className="floating-card card-three">
            <span>🌆</span>

            <div>
              <strong>City discovery</strong>
              <small>Explore something new</small>
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