import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
          onClick={() => setMenuOpen(false)}
        >
          wander<span>ly</span>
        </Link>

        <nav
          className={`navbar-links ${
            menuOpen ? "open" : ""
          }`}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            Explore
          </Link>

          <a
            href="/#destinations"
            onClick={() => setMenuOpen(false)}
          >
            Destinations
          </a>

          <a
            href="/#about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </a>

          {user && (
            <>
              <Link
                to="/favorites"
                onClick={() => setMenuOpen(false)}
              >
                ♥ Saved
              </Link>

              <Link
                to="/trips"
                onClick={() => setMenuOpen(false)}
              >
                My Trips
              </Link>
            </>
          )}

          <div className="mobile-auth">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mobile-logout"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="mobile-register"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link
                to="/favorites"
                className="saved-button"
              >
                ♥ Saved
              </Link>

              <div className="user-menu">
                <div className="user-avatar">
                  {user.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>

                <span className="user-name">
                  {user.name || "Traveler"}
                </span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="signin-button"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="register-button"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="menu-button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Navbar;