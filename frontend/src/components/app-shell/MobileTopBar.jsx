import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { FaSignInAlt } from "react-icons/fa";
import NotificationBell from "../NotificationBell";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const routeTitles = {
  "/dashboard": "Home",
  "/profile": "Reports & Profile",
  "/doctors": "Doctors",
  "/medicine-store": "Demo Store",
  "/more": "More",
  "/predict": "Disease Prediction",
  "/history": "Prediction History",
  "/book": "Appointments",
  "/calendar": "Calendar",
  "/tools": "Health Tools",
  "/article": "Health Articles",
  "/virtual-doctor": "Virtual Doctor",
  "/medications": "Medications",
  "/timeline": "Health Timeline",
  "/report": "Health Report",
  "/family": "Family Profiles",
  "/achievements": "Achievements",
  "/export": "Export Data",
  "/security": "Security",
  "/admin": "Admin",
};

const rootRoutes = new Set(["/dashboard", "/profile", "/doctors", "/medicine-store", "/more"]);

export default function MobileTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedIn } = useAuth();
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
      <div className="mobile-top-bar__side mobile-top-bar__side--end">{loggedIn ? <NotificationBell /> : <Link to="/login" className="app-icon-button" aria-label="Sign in"><FaSignInAlt /></Link>}</div>
    </header>
  );
}
