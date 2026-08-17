import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
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

interface Trip {
  _id: string;
  name: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  notes?: string;
}

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingDestinations, setLoadingDestinations] =
    useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [tripName, setTripName] = useState("");
  const [destinationId, setDestinationId] =
    useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  /*
    =========================================
    FETCH TRIP
    =========================================
  */

  useEffect(() => {
    const fetchTrip = async () => {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load trip"
          );
        }

        setTrip(data);

        setTripName(data.name);
        setDestinationId(
          data.destination?._id || ""
        );

        /*
          HTML date inputs require YYYY-MM-DD.
        */

        setStartDate(
          data.startDate
            ? new Date(data.startDate)
                .toISOString()
                .split("T")[0]
            : ""
        );

        setEndDate(
          data.endDate
            ? new Date(data.endDate)
                .toISOString()
                .split("T")[0]
            : ""
        );

        setNotes(data.notes || "");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load trip"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, token]);

  /*
    =========================================
    FETCH DESTINATIONS FOR EDITING
    =========================================
  */

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoadingDestinations(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/destinations`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load destinations"
          );
        }

        setDestinations(data);
      } catch (error) {
        console.error(
          "Failed to fetch destinations:",
          error
        );
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  /*
    =========================================
    SAVE UPDATED TRIP
    =========================================
  */

  const handleSave = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || !id) {
      return;
    }

    if (
      !tripName ||
      !destinationId ||
      !startDate ||
      !endDate
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError(
        "End date cannot be before the start date."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            destinationId,
            name: tripName,
            startDate,
            endDate,
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update trip"
        );
      }

      setTrip(data);
      setEditing(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update trip"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
    =========================================
    DELETE TRIP
    =========================================
  */

  const handleDelete = async () => {
    if (!token || !id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this trip? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
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
            "Failed to delete trip"
        );
      }

      navigate("/trips");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete trip"
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
    =========================================
    CANCEL EDITING
    =========================================
  */

  const handleCancelEdit = () => {
    if (!trip) {
      return;
    }

    setTripName(trip.name);

    setDestinationId(
      trip.destination?._id || ""
    );

    setStartDate(
      new Date(trip.startDate)
        .toISOString()
        .split("T")[0]
    );

    setEndDate(
      new Date(trip.endDate)
        .toISOString()
        .split("T")[0]
    );

    setNotes(trip.notes || "");

    setError("");
    setEditing(false);
  };

  /*
    =========================================
    NOT LOGGED IN
    =========================================
  */

  if (!user) {
    return (
      <main className="trip-details-page">
        <section className="trip-details-state">
          <h1>Sign in to view your trips</h1>

          <p>
            You need to be logged in to access
            your trip details.
          </p>

          <button
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </section>
      </main>
    );
  }

  /*
    =========================================
    LOADING
    =========================================
  */

  if (loading) {
    return (
      <main className="trip-details-page">
        <section className="trip-details-state">
          <div className="loading-spinner" />

          <p>Loading your trip...</p>
        </section>
      </main>
    );
  }

  /*
    =========================================
    TRIP NOT FOUND
    =========================================
  */

  if (!trip) {
    return (
      <main className="trip-details-page">
        <section className="trip-details-state">
          <h1>Trip not found</h1>

          <p>
            We couldn't find this trip.
          </p>

          <Link to="/trips">
            Back to My Trips
          </Link>
        </section>
      </main>
    );
  }

  /*
    =========================================
    EDIT MODE
    =========================================
  */

  if (editing) {
    return (
      <main className="trip-details-page">
        <section className="trip-edit-card">
          <Link
            to={`/trips/${trip._id}`}
            className="trip-back-link"
          >
            ← Back to Trip
          </Link>

          <div className="trip-edit-header">
            <p className="trips-eyebrow">
              MANAGE YOUR ADVENTURE
            </p>

            <h1>Edit Trip</h1>

            <p>
              Update your trip details below.
            </p>
          </div>

          {error && (
            <div className="trip-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="trip-edit-grid">
              <div className="trip-form-field">
                <label htmlFor="tripName">
                  Trip Name
                </label>

                <input
                  id="tripName"
                  type="text"
                  value={tripName}
                  onChange={(event) =>
                    setTripName(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="trip-form-field">
                <label htmlFor="destination">
                  Destination
                </label>

                <select
                  id="destination"
                  value={destinationId}
                  onChange={(event) =>
                    setDestinationId(
                      event.target.value
                    )
                  }
                  required
                  disabled={
                    loadingDestinations
                  }
                >
                  <option value="">
                    {loadingDestinations
                      ? "Loading..."
                      : "Choose a destination"}
                  </option>

                  {destinations.map(
                    (destination) => (
                      <option
                        key={destination._id}
                        value={destination._id}
                      >
                        {destination.name},{" "}
                        {destination.country}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="trip-form-field">
                <label htmlFor="startDate">
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="trip-form-field">
                <label htmlFor="endDate">
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="trip-form-field trip-form-full">
                <label htmlFor="notes">
                  Trip Notes
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Add notes about your trip..."
                />
              </div>
            </div>

            <div className="trip-edit-actions">
              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  /*
    =========================================
    TRIP DETAILS
    =========================================
  */

  return (
    <main className="trip-details-page">
      <section className="trip-details-container">
        <Link
          to="/trips"
          className="trip-back-link"
        >
          ← Back to My Trips
        </Link>

        {error && (
          <div className="trip-error">
            {error}
          </div>
        )}

        <article className="trip-details-card">
          {trip.destination?.image ? (
            <img
              src={trip.destination.image}
              alt={trip.destination.name}
              className="trip-details-image"
            />
          ) : (
            <div className="trip-details-image-placeholder">
              ✈️
            </div>
          )}

          <div className="trip-details-content">
            <p className="trips-eyebrow">
              YOUR ADVENTURE
            </p>

            <h1>{trip.name}</h1>

            <h2>
              {trip.destination?.name}
            </h2>

            <p className="trip-location">
              {trip.destination?.location},{" "}
              {trip.destination?.country}
            </p>

            <div className="trip-details-dates">
              <div>
                <span>START</span>

                <strong>
                  {new Date(
                    trip.startDate
                  ).toLocaleDateString(
                    "en-ZA",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>

              <div>
                <span>END</span>

                <strong>
                  {new Date(
                    trip.endDate
                  ).toLocaleDateString(
                    "en-ZA",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>
            </div>

            {trip.notes && (
              <div className="trip-details-notes">
                <h3>Trip Notes</h3>

                <p>{trip.notes}</p>
              </div>
            )}

            <div className="trip-details-actions">
              <button
                onClick={() =>
                  setEditing(true)
                }
              >
                Edit Trip
              </button>

              <button
                className="trip-danger-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Trip"}
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default TripDetails;