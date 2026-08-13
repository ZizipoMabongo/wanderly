import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Trips.css";

interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  category?: string;
  rating?: number;
}

interface Trip {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
  destination: Destination;
}

function Trips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const token = localStorage.getItem("wanderly_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTrips = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/trips",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data: Trip[] = await response.json();

        setTrips(data);
      } catch (error) {
        console.error(
          "Failed to fetch trips:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [navigate, token]);

  const deleteTrip = async (tripId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(tripId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/trips/${tripId}`,
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
          data.message || "Failed to delete trip"
        );
      }

      setTrips((current) =>
        current.filter(
          (trip) => trip._id !== tripId
        )
      );
    } catch (error) {
      console.error(
        "Delete trip error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete trip"
      );
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-ZA",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <main className="trips-page">
        <div className="trips-state">
          <div className="loading-spinner" />
          <p>Loading your trips...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="trips-page">
      <section className="trips-header">
        <span className="section-label">
          YOUR ADVENTURES
        </span>

        <h1>
          My <span>trips.</span>
        </h1>

        <p>
          Plan your next adventure and keep all
          your travel plans in one place.
        </p>
      </section>

      {trips.length === 0 ? (
        <section className="trips-empty">
          <div className="trips-empty-icon">
            ✈️
          </div>

          <h2>No trips planned yet</h2>

          <p>
            Start exploring Wanderly and create
            your first adventure.
          </p>

          <Link
            to="/"
            className="trips-explore-button"
          >
            Explore destinations
            <span>→</span>
          </Link>
        </section>
      ) : (
        <section className="trips-grid">
          {trips.map((trip) => (
            <article
              key={trip._id}
              className="trip-card"
            >
              <Link
                to={`/destinations/${trip.destination._id}`}
                className="trip-image-wrapper"
              >
                <img
                  src={trip.destination.image}
                  alt={trip.destination.name}
                  className="trip-image"
                />

                <div className="trip-image-overlay" />

                {trip.destination.category && (
                  <span className="trip-category">
                    {trip.destination.category}
                  </span>
                )}
              </Link>

              <div className="trip-card-content">
                <span className="trip-label">
                  TRIP
                </span>

                <h2>{trip.name}</h2>

                <Link
                  to={`/destinations/${trip.destination._id}`}
                  className="trip-destination"
                >
                  📍 {trip.destination.name},{" "}
                  {trip.destination.country}
                </Link>

                <div className="trip-dates">
                  <div>
                    <span>START</span>
                    <strong>
                      {formatDate(trip.startDate)}
                    </strong>
                  </div>

                  <div>
                    <span>END</span>
                    <strong>
                      {formatDate(trip.endDate)}
                    </strong>
                  </div>
                </div>

                {trip.notes && (
                  <p className="trip-notes">
                    {trip.notes}
                  </p>
                )}

                <div className="trip-footer">
                  <Link
                    to={`/destinations/${trip.destination._id}`}
                    className="trip-view-button"
                  >
                    View destination →
                  </Link>

                  <button
                    type="button"
                    className="trip-delete-button"
                    onClick={() =>
                      deleteTrip(trip._id)
                    }
                    disabled={
                      deleting === trip._id
                    }
                  >
                    {deleting === trip._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Trips;