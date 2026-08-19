import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Trips.css";

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

interface TripReviewImage {
  url: string;
  publicId: string;
}

interface TripReview {
  rating: number | null;
  text: string;
  images: TripReviewImage[];
  reviewedAt: string | null;
}

interface Trip {
  _id: string;
  name: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  notes?: string;
  review?: TripReview;
}

function Trips() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] =
    useState<Destination[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingDestinations, setLoadingDestinations] =
    useState(false);

  const [deleting, setDeleting] =
    useState<string | null>(null);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [tripName, setTripName] = useState("");
  const [destinationId, setDestinationId] =
    useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  /*
    =========================================
    TRIP REVIEW FORM STATE
    (keyed by trip id, so each card manages
    its own open/closed + field state)
    =========================================
  */

  const [openReviewTripId, setOpenReviewTripId] =
    useState<string | null>(null);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  /*
    =========================================
    FETCH USER TRIPS
    =========================================
  */

  const fetchTrips = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
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
            "Failed to load your trips"
        );
      }

      setTrips(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your trips"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    =========================================
    FETCH DESTINATIONS
    =========================================
  */

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
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load destinations"
      );
    } finally {
      setLoadingDestinations(false);
    }
  };

  /*
    =========================================
    INITIAL LOAD
    =========================================
  */

  useEffect(() => {
    fetchTrips();
    fetchDestinations();
  }, [token]);

  /*
    =========================================
    RESET FORM
    =========================================
  */

  const resetForm = () => {
    setTripName("");
    setDestinationId("");
    setStartDate("");
    setEndDate("");
    setNotes("");
  };

  /*
    =========================================
    CREATE TRIP
    =========================================
  */

  const handleCreateTrip = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !tripName ||
      !destinationId ||
      !startDate ||
      !endDate
    ) {
      setError(
        "Please complete all required trip details."
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
      setCreating(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
        {
          method: "POST",

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
            "Failed to create trip"
        );
      }

      /*
        Add the new trip to the existing list.
      */

      setTrips((currentTrips) => [
        ...currentTrips,
        data,
      ]);

      resetForm();
      setShowForm(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create trip"
      );
    } finally {
      setCreating(false);
    }
  };

  /*
    =========================================
    DELETE TRIP
    =========================================
  */

  const handleDelete = async (
    tripId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed || !token) {
      return;
    }

    setDeleting(tripId);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}`,
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

      setTrips((currentTrips) =>
        currentTrips.filter(
          (trip) => trip._id !== tripId
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete trip"
      );
    } finally {
      setDeleting(null);
    }
  };

  /*
    =========================================
    TRIP REVIEW: OPEN / CLOSE FORM
    =========================================
  */

  const toggleReviewForm = (trip: Trip) => {
    if (openReviewTripId === trip._id) {
      setOpenReviewTripId(null);
      return;
    }

    setOpenReviewTripId(trip._id);
    setReviewRating(trip.review?.rating || 0);
    setReviewText(trip.review?.text || "");
    setReviewImages([]);
    setReviewError("");
  };

  const handleReviewImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
      ? Array.from(event.target.files)
      : [];

    setReviewImages(files.slice(0, 6));
  };

  /*
    =========================================
    TRIP REVIEW: SUBMIT
    =========================================
  */

  const handleSubmitTripReview = async (
    event: FormEvent<HTMLFormElement>,
    tripId: string
  ) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (reviewRating < 1) {
      setReviewError("Please select a rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      const formData = new FormData();
      formData.append("rating", String(reviewRating));
      formData.append("text", reviewText);

      reviewImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/review`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save trip review"
        );
      }

      setTrips((currentTrips) =>
        currentTrips.map((trip) =>
          trip._id === tripId ? data : trip
        )
      );

      setOpenReviewTripId(null);
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to save trip review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /*
    =========================================
    NOT AUTHENTICATED
    =========================================
  */

  if (!user) {
    return (
      <main className="trips-page">
        <section className="trips-empty">
          <div className="empty-trip-icon">
            ✈️
          </div>

          <h1>Plan Your Next Adventure</h1>

          <p>
            Sign in to create and manage your
            trips.
          </p>

          <button
            className="trip-primary-button"
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
      <main className="trips-page">
        <section className="trips-state">
          <div className="loading-spinner" />

          <p>
            Loading your trips...
          </p>
        </section>
      </main>
    );
  }

  /*
    =========================================
    MAIN PAGE
    =========================================
  */

  return (
    <main className="trips-page">
      <section className="trips-header">
        <div>
          <p className="trips-eyebrow">
            YOUR ADVENTURES
          </p>

          <h1>My Trips</h1>

          <p>
            Welcome back, {user.name}. Plan,
            organise and manage your adventures
            in one place.
          </p>
        </div>

        <button
          className="trip-primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm
            ? "Cancel"
            : "+ Plan New Trip"}
        </button>
      </section>

      {error && (
        <div className="trip-error">
          {error}
        </div>
      )}

      {showForm && (
        <section className="trip-form-card">
          <div className="trip-form-header">
            <p className="trips-eyebrow">
              START PLANNING
            </p>

            <h2>Plan a New Trip</h2>

            <p>
              Choose a destination and organise
              your next adventure.
            </p>
          </div>

          <form onSubmit={handleCreateTrip}>
            <div className="trip-form-grid">
              {/* Trip name */}

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
                  placeholder="e.g. Cape Town Getaway"
                  required
                />
              </div>

              {/* Destination */}

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
                      ? "Loading destinations..."
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

              {/* Start date */}

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

              {/* End date */}

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

              {/* Notes */}

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
                  placeholder="Add notes about your trip..."
                  rows={4}
                />
              </div>
            </div>

            <div className="trip-form-actions">
              <button
                type="button"
                className="trip-secondary-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="trip-primary-button"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Trip"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* No trips */}

      {trips.length === 0 ? (
        <section className="trips-empty">
          <div className="empty-trip-icon">
            ✈️
          </div>

          <h2>No trips yet</h2>

          <p>
            Start planning your next adventure
            and your saved trips will appear
            here.
          </p>

          {!showForm && (
            <button
              className="trip-primary-button"
              onClick={() =>
                setShowForm(true)
              }
            >
              Plan My First Trip
            </button>
          )}
        </section>
      ) : (
        /*
          =====================================
          TRIP CARDS
          =====================================
        */

        <section className="trips-grid">
          {trips.map((trip) => (
            <article
              className="trip-card"
              key={trip._id}
            >
              {trip.destination?.image ? (
                <img
                  src={trip.destination.image}
                  alt={
                    trip.destination.name
                  }
                  className="trip-card-image"
                />
              ) : (
                <div className="trip-card-image-placeholder">
                  ✈️
                </div>
              )}

              <div className="trip-card-content">
                <p className="trip-card-label">
                  {trip.destination?.location},{" "}
                  {trip.destination?.country}
                </p>

                <h2>{trip.name}</h2>

                <p className="trip-destination-name">
                  {trip.destination?.name}
                </p>

                <div className="trip-dates">
                  <span>
                    {new Date(
                      trip.startDate
                    ).toLocaleDateString(
                      "en-ZA",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span>→</span>

                  <span>
                    {new Date(
                      trip.endDate
                    ).toLocaleDateString(
                      "en-ZA",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                {trip.notes && (
                  <p className="trip-notes">
                    {trip.notes}
                  </p>
                )}

                {/* EXISTING TRIP REVIEW */}

                {trip.review?.rating && (
                  <div className="trip-review-summary">
                    <div className="trip-review-summary-header">
                      <span className="trip-review-stars">
                        {"★".repeat(trip.review.rating)}
                        {"☆".repeat(5 - trip.review.rating)}
                      </span>

                      <span className="trip-review-date">
                        Reviewed{" "}
                        {trip.review.reviewedAt &&
                          new Date(
                            trip.review.reviewedAt
                          ).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                      </span>
                    </div>

                    {trip.review.text && (
                      <p className="trip-review-text">
                        {trip.review.text}
                      </p>
                    )}

                    {trip.review.images.length > 0 && (
                      <div className="trip-review-images">
                        {trip.review.images.map((image) => (
                          <img
                            key={image.publicId}
                            src={image.url}
                            alt={`${trip.name} photo`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TRIP REVIEW FORM */}

                {openReviewTripId === trip._id && (
                  <form
                    className="trip-review-form"
                    onSubmit={(event) =>
                      handleSubmitTripReview(event, trip._id)
                    }
                  >
                    <div className="review-star-picker">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`review-star ${
                            star <=
                            (reviewHoverRating || reviewRating)
                              ? "filled"
                              : ""
                          }`}
                          onMouseEnter={() =>
                            setReviewHoverRating(star)
                          }
                          onMouseLeave={() =>
                            setReviewHoverRating(0)
                          }
                          onClick={() => setReviewRating(star)}
                          aria-label={`${star} star`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewText}
                      onChange={(event) =>
                        setReviewText(event.target.value)
                      }
                      placeholder="How did your trip go?"
                      rows={3}
                    />

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReviewImageChange}
                    />

                    {reviewImages.length > 0 && (
                      <p className="review-image-count">
                        {reviewImages.length} photo
                        {reviewImages.length > 1 ? "s" : ""} selected
                      </p>
                    )}

                    {reviewError && (
                      <p className="review-form-error">
                        {reviewError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="trip-primary-button"
                      disabled={submittingReview}
                    >
                      {submittingReview
                        ? "Saving..."
                        : "Save Trip Review"}
                    </button>
                  </form>
                )}

                <div className="trip-card-actions">
                  <button
                    className="trip-secondary-button"
                    onClick={() => toggleReviewForm(trip)}
                  >
                    {openReviewTripId === trip._id
                      ? "Cancel Review"
                      : trip.review?.rating
                      ? "Edit Review"
                      : "Add Review"}
                  </button>

                  <button
                    className="trip-delete-button"
                    onClick={() =>
                      handleDelete(
                        trip._id
                      )
                    }
                    disabled={
                      deleting ===
                      trip._id
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
