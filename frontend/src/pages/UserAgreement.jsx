import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function UserAgreement() {
  const navigate = useNavigate();
  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-10 text-gray-700 dark:text-gray-200">
        <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200"><FaArrowLeft /> Back</button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Agreement</h1>
        <p className="mt-2 text-sm text-gray-500">Terms for the Smart Health academic prototype</p>
        <h2 className="text-xl font-bold mt-7">Demonstration use</h2>
        <p className="mt-2">Smart Health is an educational prototype. It does not provide medical diagnosis, emergency assistance, pharmacy fulfillment, payment processing, or a guaranteed doctor booking service.</p>
        <h2 className="text-xl font-bold mt-7">Health information</h2>
        <p className="mt-2">AI-generated report summaries and specialty recommendations can be incomplete or incorrect. Users must consult a qualified healthcare professional before making medical decisions.</p>
        <h2 className="text-xl font-bold mt-7">Medicine orders</h2>
        <p className="mt-2">All catalog items, prices, and orders are clearly fictional demonstration data. Submitting an order creates only a project record and does not purchase or deliver medicine.</p>
        <h2 className="text-xl font-bold mt-7">Acceptable use</h2>
        <p className="mt-2">Do not upload unlawful content or rely on this prototype during an emergency. By using the app, you acknowledge its academic scope and limitations.</p>
        <Link to="/privacy" className="inline-block mt-8 text-blue-700 dark:text-blue-300 font-semibold">Read the Privacy Policy</Link>
      </article>
      </div>
    </main>
  );
}
