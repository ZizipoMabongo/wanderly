import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "./ReviewSection.css";

interface ReviewImage {
  url: string;
  publicId: string;
}

interface Review {
  _id: string;
  placeId: string;
  placeName: string;
  user?: { _id: string; name: string } | null;
  guestName?: string;
  rating: number;
  text: string;
  images: ReviewImage[];
  visibility: "public" | "private";
  createdAt: string;
}

interface ReviewSectionProps {
  placeId: string;
  placeName: string;
}

function ReviewSection({ placeId, placeName }: ReviewSectionProps) {
  const { token, user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(
    "public"
  );
  const [images, setImages] = useState<File[]>([]);

  /*
    =========================================
    FETCH REVIEWS
    =========================================
  */

  const fetchReviews = async () => {
    if (!placeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviews/${placeId}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reviews");
      }

      setReviews(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reviews"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, token]);

  /*
    =========================================
    SUBMIT REVIEW
    =========================================
  */

  const resetForm = () => {
    setRating(0);
    setText("");
    setGuestName("");
    setVisibility("public");
    setImages([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating < 1) {
      setFormError("Please select a rating.");
      return;
    }

    if (!token && !guestName.trim()) {
      setFormError("Please enter your name.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const formData = new FormData();
      formData.append("rating", String(rating));
      formData.append("placeName", placeName);
      formData.append("text", text);

      if (!token) {
        formData.append("guestName", guestName);
      } else {
        formData.append("visibility", visibility);
      }

      images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviews/${placeId}`,
        {
          method: "POST",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setReviews((current) => [data, ...current]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setImages(files.slice(0, 6));
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  /*
    =========================================
    RENDER
    =========================================
  */

  return (
    <section className="review-section">
      <div className="review-section-header">
        <div>
          <p className="review-eyebrow">TRAVELER REVIEWS</p>
          <h2>
            What people are saying
            {averageRating && (
              <span className="review-average">
                ⭐ {averageRating} · {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </span>
            )}
          </h2>
        </div>

        <button
          type="button"
          className="review-primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setFormError("");
          }}
        >
          {showForm ? "Cancel" : "+ Write a Review"}
        </button>
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-field">
            <label>Your Rating</label>

            <div className="review-star-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-star ${
                    star <= (hoverRating || rating) ? "filled" : ""
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {!token && (
            <div className="review-form-field">
              <label htmlFor="guestName">Your Name</label>
              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="e.g. Thabo M."
                required
              />
            </div>
          )}

          <div className="review-form-field">
            <label htmlFor="reviewText">Your Review</label>
            <textarea
              id="reviewText"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <div className="review-form-field">
            <label htmlFor="reviewImages">Photos (optional, up to 6)</label>
            <input
              id="reviewImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {images.length > 0 && (
              <p className="review-image-count">
                {images.length} photo{images.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {token && (
            <div className="review-form-field">
              <label htmlFor="visibility">Visibility</label>
              <select
                id="visibility"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "public" | "private")
                }
              >
                <option value="public">Public — visible to everyone</option>
                <option value="private">Private — visible only to you</option>
              </select>
            </div>
          )}

          {formError && <p className="review-form-error">{formError}</p>}

          <div className="review-form-actions">
            <button
              type="submit"
              className="review-primary-button"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="review-state-message">Loading reviews...</p>
      ) : error ? (
        <p className="review-state-message review-error">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="review-state-message">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <article className="review-card" key={review._id}>
              <div className="review-card-header">
                <div>
                  <p className="review-author">
                    {review.user?.name || review.guestName || "Anonymous"}
                    {review.visibility === "private" && (
                      <span className="review-private-tag">Private</span>
                    )}
                  </p>
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="review-stars-display">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
              </div>

              {review.text && (
                <p className="review-text">{review.text}</p>
              )}

              {review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((image) => (
                    <img
                      key={image.publicId}
                      src={image.url}
                      alt={`${review.placeName} review photo`}
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReviewSection;
