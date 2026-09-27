import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const routeTitles = {
  "/dashboard": "Home",
  "/profile": "Reports & Profile",
  "/doctors": "Doctors",
  "/medicine-store": "Demo Store",
  "/more": "More",
  "/report": "Health Report",
  "/export": "Export Data",
  "/privacy": "Privacy Policy",
  "/terms": "User Agreement",
};

const rootRoutes = new Set(["/dashboard", "/profile", "/doctors", "/medicine-store", "/more"]);

export default function MobileTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const title = routeTitles[location.pathname] || "Smart Health";
  const showBack = !rootRoutes.has(location.pathname);

  return (
    <header className="mobile-top-bar lg:hidden">
      <div className="mobile-top-bar__side">
        {showBack ? (
          <button type="button" onClick={() => navigate(-1)} className="app-icon-button" aria-label="Go back">
            <FaArrowLeft aria-hidden="true" />
          </button>
        ) : <span className="mobile-top-bar__mark" aria-hidden="true">SH</span>}
      </div>
      <h1 className="mobile-top-bar__title">{title}</h1>
      <div className="mobile-top-bar__side mobile-top-bar__side--end">
        <button type="button" onClick={toggleTheme} className="app-icon-button" aria-label={isDark ? "Use light theme" : "Use dark theme"}>
          {isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
