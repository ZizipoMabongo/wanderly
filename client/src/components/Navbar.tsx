import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Wanderly Logo / Home */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          wander<span>ly</span>
        </Link>

        {/* Main Navigation */}
        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            Explore
          </Link>

          <a
            href="/#destinations"
            onClick={closeMenu}
          >
            Destinations
          </a>

          <a
            href="/#about"
            onClick={closeMenu}
          >
            About
          </a>

          {user && (
            <>
              <Link
  to="/favorites"
  onClick={closeMenu}
  className="mobile-saved-link"
>
  ♥ Saved
</Link>

              <Link
                to="/trips"
                onClick={closeMenu}
              >
                My Trips
              </Link>
            </>
          )}

          {/* Mobile Authentication */}
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
                  onClick={closeMenu}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="mobile-register"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Desktop Actions */}
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
                    ? user.name.charAt(0).toUpperCase()
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

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="menu-button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
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