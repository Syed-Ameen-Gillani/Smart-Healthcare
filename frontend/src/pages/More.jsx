import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaFileExport, FaHeartbeat, FaLock, FaMoon, FaSignOutAlt, FaSun, FaUser, FaUsers, FaTrophy, FaBookMedical, FaTools, FaPills, FaHistory, FaRobot, FaShieldAlt } from "react-icons/fa";
import { MdLanguage } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const groups = [
  { title: "Health", items: [
    ["Disease Prediction", "/predict", FaHeartbeat], ["Prediction History", "/history", FaHistory], ["Health Tools", "/tools", FaTools],
    ["Medications", "/medications", FaPills], ["Health Timeline", "/timeline", FaHistory],
    ["Health Report", "/report", FaBookMedical],
  ]},
  { title: "Care", items: [
    ["Appointments", "/book", FaCalendarAlt], ["Calendar", "/calendar", FaCalendarAlt],
    ["Virtual Doctor", "/virtual-doctor", FaRobot], ["Family Profiles", "/family", FaUsers],
  ]},
  { title: "Account", items: [
    ["My Profile", "/profile?section=about", FaUser], ["Achievements", "/achievements", FaTrophy],
    ["Export Data", "/export", FaFileExport], ["Security", "/security", FaLock],
  ]},
  { title: "Project", items: [
    ["Health Articles", "/article", FaBookMedical], ["Privacy Policy", "/privacy", FaShieldAlt],
    ["User Agreement", "/terms", FaShieldAlt], ["Admin Dashboard", "/admin", FaTools],
  ]},
];

export default function More() {
  const { loggedIn, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
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
                    <Icon className="text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
                    <span>{label}</span><span className="ml-auto text-gray-400" aria-hidden="true">›</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
          <section aria-labelledby="more-preferences">
            <h2 id="more-preferences" className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-2 px-1">Preferences</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <button type="button" onClick={toggleTheme} className="app-list-row w-full">
                {isDark ? <FaSun className="text-amber-500" /> : <FaMoon className="text-cyan-700" />}<span>{isDark ? "Use light theme" : "Use dark theme"}</span>
              </button>
              <button type="button" onClick={() => i18n.changeLanguage(i18n.language === "en" ? "hi" : "en")} className="app-list-row w-full">
                <MdLanguage className="text-cyan-700 dark:text-cyan-300" /><span>Language: {i18n.language === "en" ? "English" : "Hindi"}</span>
              </button>
            </div>
          </section>
          {loggedIn ? <button type="button" onClick={handleLogout} className="app-list-row justify-center bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 font-bold"><FaSignOutAlt /> Log out</button> : <Link to="/login" className="app-list-row justify-center bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 rounded-lg text-cyan-800 dark:text-cyan-200 font-bold"><FaSignOutAlt className="rotate-180" /> Sign in</Link>}
        </div>
      </div>
    </main>
  );
}
