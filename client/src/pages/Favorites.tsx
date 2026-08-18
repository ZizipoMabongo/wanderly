import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Favorites.css";

type Destination = {
  _id: string;
  name: string;
  location: string;
  country: string;
  description: string;
  category: string;
  rating: number;
  image: string;
  tags: string[];
  priceLevel: number;
};

type Favorite = {
  _id: string;
  destination: Destination;
};

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] =
    useState<Favorite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [removing, setRemoving] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  /*
   * =========================================
   * FETCH SAVED DESTINATIONS
   * =========================================
   */

  useEffect(() => {
    const fetchFavorites = async () => {
      const token =
        localStorage.getItem(
          "wanderly_token"
        );

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load saved destinations"
          );
        }

        setFavorites(data);
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load saved destinations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  /*
   * =========================================
   * REMOVE SAVED DESTINATION
   * =========================================
   */

  const handleRemove = async (
    destinationId: string
  ) => {
    const token =
      localStorage.getItem(
        "wanderly_token"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    setRemoving(destinationId);
    setError("");

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
        throw new Error(
          data.message ||
            "Failed to remove destination"
        );
      }

      /*
       * Remove it immediately from the page
       * without needing to reload.
       */

      setFavorites(
        (currentFavorites) =>
          currentFavorites.filter(
            (favorite) =>
              favorite.destination?._id !==
              destinationId
          )
      );
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove destination"
      );
    } finally {
      setRemoving(null);
    }
  };

  /*
   * =========================================
   * LOADING STATE
   * =========================================
   */

  if (loading) {
    return (
      <main className="favorites-page">
        <div className="favorites-state">

          <div className="loading-spinner" />

          <p>
            Loading your saved destinations...
          </p>

        </div>
      </main>
    );
  }

  /*
   * =========================================
   * PAGE
   * =========================================
   */

  return (
    <main className="favorites-page">

      <div className="favorites-header">

        <span className="section-label">
          YOUR WANDERLY COLLECTION
        </span>

        <h1>
          Saved{" "}
          <span>Destinations</span>
        </h1>

        <p>
          Keep track of the places you want
          to explore next.
        </p>

      </div>

      {error && (
        <div className="favorites-state">
          <p>{error}</p>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="favorites-empty">

          <div className="favorites-empty-icon">
            ♥
          </div>

          <h2>
            No saved destinations yet
          </h2>

          <p>
            When you find somewhere you love,
            save it here so you can easily
            come back to it later.
          </p>

          <Link
            to="/"
            className="favorites-explore-button"
          >
            Explore Destinations
          </Link>

        </div>
      ) : (
        <div className="favorites-grid">

          {favorites.map((favorite) => {

            const destination =
              favorite.destination;

            if (!destination) {
              return null;
            }

            return (
              <article
                key={favorite._id}
                className="favorite-card"
              >

                {/* IMAGE */}

                <Link
                  to={`/destinations/${destination._id}`}
                >
                  <div className="favorite-card-image">

                    <img
                      src={destination.image}
                      alt={destination.name}
                    />

                  </div>
                </Link>

                {/* CONTENT */}

                <div className="favorite-card-content">

                  <div className="favorite-card-top">

                    <div>
                      <span className="favorite-category">
                        {destination.category}
                      </span>

                      <h2>
                        {destination.name}
                      </h2>

                      <p>
                        {destination.location},{" "}
                        {destination.country}
                      </p>
                    </div>

                    <span className="favorite-rating">
                      ⭐ {destination.rating}
                    </span>

                  </div>

                  <p className="favorite-description">
                    {destination.description}
                  </p>

                  {/* TAGS */}

                  <div className="favorite-tags">
                    {destination.tags
                      .slice(0, 3)
                      .map((tag) => (
                        <span key={tag}>
                          #{tag}
                        </span>
                      ))}
                  </div>

                  {/* ACTIONS */}

                  <div className="favorite-actions">

                    <Link
                      to={`/destinations/${destination._id}`}
                      className="favorite-view-button"
                    >
                      View Destination
                    </Link>

                    <button
                      type="button"
                      className="favorite-remove-button"
                      onClick={() =>
                        handleRemove(
                          destination._id
                        )
                      }
                      disabled={
                        removing ===
                        destination._id
                      }
                    >
                      {removing ===
                      destination._id
                        ? "Removing..."
                        : "♥ Saved"}
                    </button>

                  </div>

                </div>

              </article>
            );
          })}

        </div>
      )}

    </main>
  );
}

export default Favorites;