import { useEffect, useState } from "react";
import { FiDownload, FiFileText, FiPackage, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { reportAPI } from "../utils/api";

const PERIODS = [7, 30, 90, 180, 365];

export default function HealthReport() {
  const [days, setDays] = useState(90);
  const [summary, setSummary] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    reportAPI.getSummary(days).then((response) => setSummary(response.data)).catch(() => toast.error("Could not load report summary"));
  }, [days]);

  const download = async () => {
    setDownloading(true);
    try {
      await reportAPI.downloadReport(days);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    { label: "Uploaded reports", value: summary?.counts?.reports ?? "-", icon: FiFileText },
    { label: "Analyzed reports", value: summary?.counts?.analyzed_reports ?? "-", icon: FiCheckCircle },
    { label: "Demo orders", value: summary?.counts?.medicine_orders ?? "-", icon: FiPackage },
  ];

  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner mx-auto max-w-4xl">
        <header className="rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health summary</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Generate an FYP demonstration summary of your uploaded reports, AI analysis status, and medicine orders.</p>
        </header>
        <div className="mt-6 flex flex-wrap gap-2">
          {PERIODS.map((period) => <button key={period} onClick={() => setDays(period)} className={`rounded-md px-4 py-2 text-sm font-semibold ${days === period ? "bg-gradient-to-r from-btn2 to-btn1 text-white" : "border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white"}`}>{period} days</button>)}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <section key={label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"><Icon className="text-xl" /></span>
              <p className="mt-3 text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </section>
          ))}
        </div>
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PDF contents</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Patient identity, report type and risk level, recommended specialty, and demonstration medicine order status. The document clearly states that AI output is decision support.</p>
          <button onClick={download} disabled={downloading} className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-btn2 to-btn1 px-5 py-3 font-semibold text-white disabled:opacity-50">
            <FiDownload /> {downloading ? "Generating..." : "Download PDF"}
          </button>
        </section>
      </div>
    </main>
  );
}
