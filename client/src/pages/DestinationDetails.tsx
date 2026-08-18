import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Destination {
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
}

interface Favorite {
  _id: string;
  destination: Destination;
}

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [destination, setDestination] =
    useState<Destination | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  /*
   * =========================================
   * FETCH DESTINATION
   * =========================================
   */

  useEffect(() => {
    const fetchDestination = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/destinations/${id}`
        );

        if (!response.ok) {
          throw new Error("Destination not found");
        }

        const data = await response.json();

        setDestination(data);
      } catch (error) {
        console.error(
          "Failed to fetch destination:",
          error
        );

        setDestination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  /*
   * =========================================
   * CHECK IF DESTINATION IS ALREADY SAVED
   * =========================================
   */

  useEffect(() => {
    const checkFavorite = async () => {
      if (!token || !id) {
        setIsSaved(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favorites`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch saved destinations"
          );

          return;
        }

        const data: Favorite[] =
          await response.json();

        const alreadySaved = data.some(
          (favorite) =>
            favorite.destination &&
            favorite.destination._id === id
        );

        setIsSaved(alreadySaved);
      } catch (error) {
        console.error(
          "Failed to check favorite:",
          error
        );
      }
    };

    checkFavorite();
  }, [id, token]);

  /*
   * =========================================
   * SAVE / REMOVE DESTINATION
   * =========================================
   */

  const handleSave = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!id) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      /*
       * REMOVE FROM SAVED
       */

      if (isSaved) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/favorites/${id}`,
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

        setIsSaved(false);

        return;
      }

      /*
       * SAVE DESTINATION
       *
       * IMPORTANT:
       * The correct backend route is:
       *
       * POST /api/favorites/:destinationId
       */

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/favorites/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save destination"
        );
      }

      setIsSaved(true);
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================
   * LOADING STATE
   * =========================================
   */

  if (loading) {
    return (
      <div className="state-message">
        <div className="loader"></div>

        <p>Loading destination...</p>
      </div>
    );
  }

  /*
   * =========================================
   * DESTINATION NOT FOUND
   * =========================================
   */

  if (!destination) {
    return (
      <div className="state-message">
        <div className="empty-icon">
          ⚠️
        </div>

        <h3>Destination not found</h3>

        <Link to="/">
          Return to Wanderly
        </Link>
      </div>
    );
  }

  /*
   * =========================================
   * DESTINATION DETAILS
   * =========================================
   */

  return (
    <main className="destination-details">

      {/* HERO IMAGE */}

      <div className="details-hero">
        <img
          src={destination.image}
          alt={destination.name}
        />

        <div className="details-hero-overlay">
          <Link
            to="/"
            className="back-link"
          >
            ← Back to Explore
          </Link>

          <div className="details-location">
            <p>
              {destination.location},{" "}
              {destination.country}
            </p>

            <h1>{destination.name}</h1>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="details-content">

        <div className="details-main">

          <p className="eyebrow">
            ABOUT THIS DESTINATION
          </p>

          <h2>
            Experience {destination.name}
          </h2>

          <p className="details-description">
            {destination.description}
          </p>

          {/* TAGS */}

          <div className="tags">
            {destination.tags.map(
              (tag) => (
                <span key={tag}>
                  #{tag}
                </span>
              )
            )}
          </div>

        </div>

        {/* SIDEBAR */}

        <aside className="details-sidebar">

          <div className="detail-stat">
            <span>Rating</span>

            <strong>
              ⭐ {destination.rating}
            </strong>
          </div>

          <div className="detail-stat">
            <span>Category</span>

            <strong>
              {destination.category}
            </strong>
          </div>

          <div className="detail-stat">
            <span>Price level</span>

            <strong>
              {"$".repeat(
                destination.priceLevel
              )}
            </strong>
          </div>

          {/* SAVE BUTTON */}

          <button
            type="button"
            className={`save-destination-button ${
              isSaved ? "saved" : ""
            }`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isSaved
              ? "♥ Saved"
              : "♡ Save Destination"}
          </button>

          {saveError && (
            <p className="save-error">
              {saveError}
            </p>
          )}

        </aside>

      </div>

    </main>
  );
}

export default DestinationDetails;