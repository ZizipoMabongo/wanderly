import { Link } from "react-router-dom";

interface Destination {
  _id: string;
  name: string;
  location: string;
  country: string;
  description: string;
  category: "food" | "sightseeing" | "nightlife";
  rating: number;
  image: string;
  tags: string[];
  priceLevel: number;
}

interface DestinationCardProps {
  destination: Destination;
}

function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      to={`/destinations/${destination._id}`}
      className="destination-card"
    >
      <div className="image-wrapper">
        <img
          src={destination.image}
          alt={destination.name}
        />

        <button
          className="favorite"
          aria-label="Save destination"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          ♡
        </button>

        <span className="category-badge">
          {destination.category}
        </span>
      </div>

      <div className="card-content">
        <div className="location">
          📍 {destination.location}, {destination.country}
        </div>

        <h3>{destination.name}</h3>

        <p>{destination.description}</p>

        <div className="card-footer">
          <div className="rating">
            <span>
              {"★".repeat(Math.round(destination.rating))}
            </span>

            <strong>{destination.rating}</strong>
          </div>

          <span className="price">
            {"$".repeat(destination.priceLevel)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default DestinationCard;