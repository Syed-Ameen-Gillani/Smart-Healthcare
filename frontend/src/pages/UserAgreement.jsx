import React from "react";
import { Link } from "react-router-dom";

export default function UserAgreement() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-10 text-gray-700 dark:text-gray-200">
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
        <Link to="/privacy" className="inline-block mt-8 text-cyan-700 dark:text-cyan-300 font-semibold">Read the Privacy Policy</Link>
      </article>
    </main>
  );
}
