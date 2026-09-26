import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-10 text-gray-700 dark:text-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Smart Health academic prototype</p>
        <h2 className="text-xl font-bold mt-7">Data used by the prototype</h2>
        <p className="mt-2">The application may process account details, health profile information, uploaded medical reports, report analysis, appointments, and demonstration medicine orders to provide its features.</p>
        <h2 className="text-xl font-bold mt-7">Storage and services</h2>
        <p className="mt-2">Application data is stored by the configured FastAPI and MongoDB backend. Uploaded report content may be sent to the configured Gemini API for analysis. Secrets and database credentials remain on the backend and are not included in the Android application.</p>
        <h2 className="text-xl font-bold mt-7">Important limitation</h2>
        <p className="mt-2">This is a final-year-project demonstration, not a production healthcare service. Use fictional or non-sensitive demonstration data. Report analysis is decision support and is not a diagnosis or a substitute for a qualified medical professional.</p>
        <h2 className="text-xl font-bold mt-7">User control</h2>
        <p className="mt-2">Users can review their uploaded files and use the existing data export and account controls. Contact the project administrator for removal of demonstration data.</p>
        <Link to="/terms" className="inline-block mt-8 text-cyan-700 dark:text-cyan-300 font-semibold">Read the User Agreement</Link>
      </article>
    </main>
  );
}
