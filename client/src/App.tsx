import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DestinationDetails from "./pages/DestinationDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Trips from "./pages/Trips";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Destination details */}
          <Route
            path="/destinations/:id"
            element={<DestinationDetails />}
          />

          {/* Authentication */}
          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          {/* User trips */}
          <Route
            path="/trips"
            element={<Trips />}
          />
        </Routes>

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