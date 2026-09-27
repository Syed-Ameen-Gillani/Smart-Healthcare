import React from "react";
import { Link } from "react-router-dom";
import { FaFileMedical, FaShoppingCart, FaUserMd, FaClipboardList } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const actions = [
  { title: "Upload Medical Report", detail: "Upload a PDF or image and review its AI-assisted findings.", to: "/profile?section=reports", icon: FaFileMedical },
  { title: "Find a Doctor", detail: "Browse fictional doctors by specialty and city.", to: "/doctors", icon: FaUserMd },
  { title: "Demo Medicine Store", detail: "Submit and review academic demonstration orders.", to: "/medicine-store", icon: FaShoppingCart },
  { title: "Health Report", detail: "Download a summary of analyzed reports and demonstration orders.", to: "/report", icon: FaClipboardList },
];

export default function HealthDashboard() {
  const { user, loggedIn } = useAuth();
  const firstName = user?.first_name || user?.name?.split(" ")[0];

  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner max-w-5xl">
        <header className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Smart Health FYP</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {loggedIn && firstName ? `Welcome, ${firstName}` : "Healthcare decision support"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
            Upload a medical report, understand abnormal findings, find a relevant specialist, and place a demo medicine order.
          </p>
        </header>

        <section className="grid sm:grid-cols-2 gap-4" aria-label="Main actions">
          {actions.map(({ title, detail, to, icon: Icon }) => (
            <Link key={title} to={to} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 flex gap-4 shadow-sm hover:border-blue-600 hover:shadow-md transition-all">
              <span className="w-11 h-11 shrink-0 rounded-lg bg-blue-100 dark:bg-blue-950 grid place-items-center text-blue-800 dark:text-blue-300 group-hover:bg-gradient-to-r from-btn2 to-btn1 group-hover:text-white transition-colors"><Icon /></span>
              <span><strong className="block text-gray-900 dark:text-white">{title}</strong><span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">{detail}</span></span>
            </Link>
          ))}
        </section>

        <p className="mt-7 text-sm text-gray-500 dark:text-gray-400">
          AI output is educational decision support and is not a diagnosis. Medicine orders are fictional and have no payment or pharmacy fulfillment.
        </p>
      </div>
    </main>
  );
}
