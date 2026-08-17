import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import DestinationDetails from "./pages/DestinationDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import Favorites from "./pages/Favorites";

import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* =========================================
              HOME
          ========================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* =========================================
              DESTINATION DETAILS
          ========================================= */}

          <Route
            path="/destinations/:id"
            element={<DestinationDetails />}
          />

          {/* =========================================
              AUTHENTICATION
          ========================================= */}

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          {/* =========================================
              SAVED DESTINATIONS
          ========================================= */}

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          {/* =========================================
              USER TRIPS
          ========================================= */}

          <Route
            path="/trips"
            element={<Trips />}
          />

          {/* =========================================
              TRIP DETAILS / EDIT
          ========================================= */}

          <Route
            path="/trips/:id"
            element={<TripDetails />}
          />
        </Routes>

        {/* =========================================
            FOOTER
        ========================================= */}

        <footer id="about">
          <div className="footer-logo">
            wander<span>ly</span>
          </div>

          <p>
            Discover more. Wander further. ✈️
          </p>

          <span>
            © 2026 Wanderly
          </span>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;