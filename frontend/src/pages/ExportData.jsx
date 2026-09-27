import { useEffect, useState } from "react";
import { FiDownload, FiFileText, FiPackage } from "react-icons/fi";
import { toast } from "react-toastify";
import { exportAPI } from "../utils/api";

const TYPES = [
  { key: "reports", label: "Medical reports", icon: FiFileText },
  { key: "medicine_orders", label: "Demo medicine orders", icon: FiPackage },
];

const PERIODS = [7, 30, 90, 180, 365];

export default function ExportData() {
  const [days, setDays] = useState(90);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    exportAPI.getSummary(days).then((response) => setSummary(response.data)).catch(() => toast.error("Could not load export summary"));
  }, [days]);

  const download = async (type) => {
    setBusy(type);
    try {
      await exportAPI.downloadCSV(type, days);
      toast.success("CSV downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Export your data</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Download the core records created during the Smart Health demonstration.</p>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Export period">
          {PERIODS.map((period) => (
            <button key={period} onClick={() => setDays(period)} className={`rounded-md px-4 py-2 text-sm font-semibold ${days === period ? "bg-gradient-to-r from-btn2 to-btn1 text-white" : "border border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"}`}>
              {period} days
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TYPES.map(({ key, label, icon: Icon }) => (
            <section key={key} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <Icon className="text-2xl text-btn2" aria-hidden="true" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.counts?.[key] ?? "-"}</span>
              </div>
              <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">{label}</h2>
              <button onClick={() => download(key)} disabled={Boolean(busy)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-btn2 to-btn1 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
                <FiDownload aria-hidden="true" /> {busy === key ? "Preparing..." : "Download CSV"}
              </button>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
