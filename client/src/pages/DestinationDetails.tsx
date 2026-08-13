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
    Fetch destination details
  */
  useEffect(() => {
    const fetchDestination = async () => {
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
    Check whether this destination is already saved

    The Favorites API gives us all saved destinations,
    so we check whether the current destination exists
    in that list.
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
    Save or remove destination
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
      if (isSaved) {
        /*
          Remove saved destination
        */
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
      } else {
        /*
          Save destination

          IMPORTANT:
          The backend expects the destination ID
          in the URL.
        */
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/destinations/${id}`,
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
      }
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
    Loading state
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
    Destination not found
  */
  if (!destination) {
    return (
      <div className="state-message">
        <div className="empty-icon">
          🧭
        </div>

        <h3>Destination not found</h3>

        <Link to="/">
          Return to Wanderly
        </Link>
      </div>
    );
  }

  return (
    <main className="destination-details">
      <Link
        to="/"
        className="back-link"
      >
        ← Back to explore
      </Link>

      <div className="details-hero">
        <img
          src={destination.image}
          alt={destination.name}
        />

        <div className="details-overlay">
          <span className="category-badge">
            {destination.category}
          </span>

          <h1>{destination.name}</h1>

          <p>
            📍 {destination.location},{" "}
            {destination.country}
          </p>
        </div>
      </div>

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

        <aside className="details-sidebar">
          <div className="detail-stat">
            <span>Rating</span>

            <strong>
              ⭐ {destination.rating}
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

          <button
            type="button"
            className="save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isSaved
              ? "♥ Saved"
              : "♡ Save destination"}
          </button>

          {saveError && (
            <p className="auth-error">
              {saveError}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

export default DestinationDetails;