import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaFileMedical, FaHome, FaShoppingCart, FaUserMd, FaEllipsisH } from "react-icons/fa";

const tabs = [
  { label: "Home", to: "/dashboard", icon: FaHome, matches: ["/dashboard"] },
  { label: "Reports", to: "/profile?section=reports", icon: FaFileMedical, matches: ["/profile"] },
  { label: "Doctors", to: "/doctors", icon: FaUserMd, matches: ["/doctors"] },
  { label: "Store", to: "/medicine-store", icon: FaShoppingCart, matches: ["/medicine-store"] },
  { label: "More", to: "/more", icon: FaEllipsisH, matches: ["/more"] },
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav lg:hidden" aria-label="Primary navigation">
      {tabs.map(({ label, to, icon: Icon, matches }) => {
        const active = matches.includes(location.pathname);
        return (
          <NavLink
            key={label}
            to={to}
            aria-current={active ? "page" : undefined}
            className={`mobile-bottom-nav__item ${active ? "is-active" : ""}`}
          >
            <Icon aria-hidden="true" className="text-lg" />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
