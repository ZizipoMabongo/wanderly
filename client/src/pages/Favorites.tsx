import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Favorites.css";

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

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const token = localStorage.getItem("wanderly_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFavorites = async () => {
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
          throw new Error("Failed to fetch saved destinations");
        }

        const data: Favorite[] = await response.json();

        setFavorites(data);
      } catch (error) {
        console.error(
          "Failed to fetch favorites:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate, token]);

  const removeFavorite = async (
    destinationId: string
  ) => {
    if (!token) {
      return;
    }

    setRemoving(destinationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/favorites/${destinationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to remove destination"
        );
        return;
      }

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            favorite.destination._id !== destinationId
        )
      );
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      alert(
        "Unable to remove saved destination."
      );
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <main className="favorites-page">
        <div className="favorites-state">
          <div className="loading-spinner" />

          <p>Loading your saved destinations...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      <section className="favorites-header">
        <span className="section-label">
          YOUR JOURNEY
        </span>

        <h1>
          Saved <span>destinations.</span>
        </h1>

        <p>
          Keep the places that inspire you close.
          Your next adventure might already be here.
        </p>
      </section>

      {favorites.length === 0 ? (
        <section className="favorites-empty">
          <div className="favorites-empty-icon">
            ♡
          </div>

          <h2>No saved destinations yet</h2>

          <p>
            Start exploring Wanderly and save the
            places you'd love to visit.
          </p>

          <Link
            to="/"
            className="favorites-explore-button"
          >
            Explore destinations
            <span>→</span>
          </Link>
        </section>
      ) : (
        <section className="favorites-grid">
          {favorites.map((favorite) => {
            const destination =
              favorite.destination;

            return (
              <article
                key={favorite._id}
                className="favorite-card"
              >
                <Link
                  to={`/destinations/${destination._id}`}
                  className="favorite-image-wrapper"
                >
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="favorite-image"
                  />

                  <div className="favorite-image-overlay" />

                  {destination.category && (
                    <span className="favorite-category">
                      {destination.category}
                    </span>
                  )}
                </Link>

                <div className="favorite-card-content">
                  <div className="favorite-location">
                    📍 {destination.country}
                  </div>

                  <Link
                    to={`/destinations/${destination._id}`}
                    className="favorite-title"
                  >
                    <h2>{destination.name}</h2>
                  </Link>

                  <p>
                    {destination.description}
                  </p>

                  <div className="favorite-footer">
                    <span className="favorite-rating">
                      ⭐{" "}
                      {destination.rating || "4.8"}
                    </span>

                    <button
                      type="button"
                      className="remove-favorite-button"
                      onClick={() =>
                        removeFavorite(
                          destination._id
                        )
                      }
                      disabled={
                        removing === destination._id
                      }
                    >
                      {removing === destination._id
                        ? "Removing..."
                        : "♥ Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Favorites;