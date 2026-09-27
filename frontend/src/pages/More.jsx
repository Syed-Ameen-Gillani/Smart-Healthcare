import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFileExport, FaSignOutAlt, FaUser, FaBookMedical, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const groups = [
  { title: "Health", items: [
    ["Health Report", "/report", FaBookMedical],
  ]},
  { title: "Account", items: [
    ["My Profile", "/profile?section=about", FaUser], ["Export Data", "/export", FaFileExport],
  ]},
  { title: "Project", items: [
    ["Privacy Policy", "/privacy", FaShieldAlt], ["User Agreement", "/terms", FaShieldAlt],
  ]},
];

export default function More() {
  const { loggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Log out of Smart Health?")) return;
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner max-w-3xl">
        <div className="grid gap-5">
          {groups.map((group) => (
            <section key={group.title} aria-labelledby={`more-${group.title}`}>
              <h2 id={`more-${group.title}`} className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 px-1">{group.title}</h2>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {group.items.map(([label, to, Icon]) => (
                  <Link key={label} to={to} className="app-list-row">
                    <Icon className="text-blue-700 dark:text-blue-300" aria-hidden="true" />
                    <span>{label}</span><span className="ml-auto text-gray-400" aria-hidden="true">›</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
          {loggedIn ? <button type="button" onClick={handleLogout} className="app-list-row justify-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 font-bold"><FaSignOutAlt /> Log out</button> : <Link to="/login" className="app-list-row justify-center bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-blue-800 dark:text-blue-200 font-bold"><FaSignOutAlt className="rotate-180" /> Sign in</Link>}
        </div>
      </div>
    </main>
  );
}
