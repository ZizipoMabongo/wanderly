import { useEffect, useState } from "react";

type Trip = {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchTrips = async () => {
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
        throw new Error(data.message || "Failed to load trips");
      }

      setTrips(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load trips"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(tripId);

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
          data.message || "Failed to delete trip"
        );
      }

      setTrips((currentTrips) =>
        currentTrips.filter((trip) => trip._id !== tripId)
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

  if (loading) {
    return (
      <main>
        <p>Loading your trips...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>My Trips</h1>

      {error && (
        <div>
          {error}
        </div>
      )}

      {trips.length === 0 ? (
        <p>You don't have any trips yet.</p>
      ) : (
        <div>
          {trips.map((trip) => (
            <div key={trip._id}>
              <h2>{trip.destination}</h2>

              <p>
                {new Date(trip.startDate).toLocaleDateString()}{" "}
                -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </p>

              {trip.notes && <p>{trip.notes}</p>}

              <button
                onClick={() => handleDelete(trip._id)}
                disabled={deleting === trip._id}
              >
                {deleting === trip._id
                  ? "Deleting..."
                  : "Delete Trip"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Trips;