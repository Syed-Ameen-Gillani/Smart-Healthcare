import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaFileAlt, FaHeartbeat, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ReportAnalysisModal({ analysis, fileId, city, onClose }) {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleBack = (event) => { event.preventDefault(); onClose(); };
    document.addEventListener("smarthealth:back", handleBack);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("smarthealth:back", handleBack);
    };
  }, [onClose]);
  if (!analysis) return null;
  const recommendation = analysis.specialty_recommendation;
  const risk = (analysis.risk_level || "Unable to assess").toLowerCase();
  const riskClass = risk === "low" ? "bg-green-100 text-green-800 border-green-300" : risk === "moderate" || risk === "medium" ? "bg-amber-100 text-amber-800 border-amber-300" : risk === "high" || risk === "critical" ? "bg-red-100 text-red-800 border-red-300" : "bg-gray-100 text-gray-800 border-gray-300";

  const findDoctors = () => {
    const params = new URLSearchParams();
    if (recommendation?.specialty) params.set("specialization", recommendation.specialty);
    if (city) params.set("city", city);
    if (fileId) params.set("sourceReport", fileId);
    if (recommendation?.reason) params.set("reason", recommendation.reason);
    onClose();
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="app-fullscreen-overlay bg-black/50 flex items-center justify-center z-[60] lg:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="report-analysis-title" className="bg-white dark:bg-gray-800 lg:rounded-lg max-w-4xl w-full h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="bg-blue-800 text-white p-4 lg:p-5 relative sticky top-0 z-10 shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20" aria-label="Close analysis"><FaTimes /></button>
          <div className="flex items-center gap-3 pr-12"><FaFileAlt size={24} /><div><h2 id="report-analysis-title" className="text-xl lg:text-2xl font-bold">Report Analysis</h2><p className="text-sm text-blue-100">AI-assisted medical report insights</p></div></div>
        </div>
        <div className="p-4 lg:p-5 space-y-5 flex-1">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-800 rounded-lg"><p className="text-sm text-gray-600 dark:text-gray-400">Report type</p><p className="font-bold text-lg dark:text-white">{analysis.report_type}</p></div>
            <div className={`p-4 border rounded-lg ${riskClass}`}><p className="text-sm">Risk level</p><p className="font-bold text-lg">{analysis.risk_level}</p></div>
          </div>
          <section className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg"><h3 className="font-bold flex items-center gap-2 mb-2"><FaFileAlt /> Summary</h3><p className="dark:text-gray-200">{analysis.summary}</p></section>
          {analysis.key_findings?.length > 0 && <section><h3 className="font-bold flex items-center gap-2 mb-2"><FaCheckCircle className="text-green-600" /> Key findings</h3><ul className="space-y-2">{analysis.key_findings.map((item, index) => <li key={index} className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg dark:text-gray-200">{item}</li>)}</ul></section>}
          <section><h3 className="font-bold flex items-center gap-2 mb-2"><FaExclamationTriangle className="text-amber-600" /> Abnormal values</h3>{analysis.abnormal_values?.length > 0 ? <ul className="space-y-2">{analysis.abnormal_values.map((item, index) => <li key={index} className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg dark:text-gray-200">{typeof item === "string" ? item : `${item.parameter || "Result"}: ${item.value || ""} ${item.normal_range ? `(normal: ${item.normal_range})` : ""}`}</li>)}</ul> : <p className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">No abnormal values were identified in this report.</p>}</section>
          {Object.keys(analysis.health_metrics || {}).length > 0 && <section><h3 className="font-bold flex items-center gap-2 mb-2"><FaHeartbeat className="text-red-600" /> Health metrics</h3><div className="grid sm:grid-cols-2 gap-2">{(Array.isArray(analysis.health_metrics) ? analysis.health_metrics.map((metric, index) => [metric.name || `Metric ${index + 1}`, [metric.value, metric.unit, metric.status].filter(Boolean).join(" · ")]) : Object.entries(analysis.health_metrics)).map(([name, value]) => <div key={name} className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg"><p className="text-sm text-gray-600 dark:text-gray-400">{name}</p><p className="font-semibold dark:text-gray-100">{String(value)}</p></div>)}</div></section>}
          {analysis.recommendations?.length > 0 && <section><h3 className="font-bold mb-2">Recommendations</h3><ul className="space-y-2">{analysis.recommendations.map((item, index) => <li key={index} className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg dark:text-gray-200">{item}</li>)}</ul></section>}
          {recommendation && <section className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg"><p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Recommended specialty</p><h3 className="text-xl font-bold dark:text-white">{recommendation.specialty}</h3><p className="mt-2 dark:text-gray-200">{recommendation.reason}</p><button onClick={findDoctors} className="hidden lg:block mt-4 bg-gradient-to-r from-btn2 to-btn1 text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-95">Find Relevant Doctors</button></section>}
          {analysis.limitations && analysis.limitations !== "None reported." && <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg dark:text-gray-200"><strong>Limitations:</strong> {analysis.limitations}</div>}
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm dark:text-gray-200"><strong>Disclaimer:</strong> This AI analysis is for educational decision support and is not a medical diagnosis. Always consult a qualified healthcare professional.</div>
        </div>
        <div className="sticky bottom-0 p-3 pb-[calc(12px+var(--safe-bottom))] border-t dark:border-gray-700 bg-white dark:bg-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-2 shrink-0">
          {recommendation && <button onClick={findDoctors} className="lg:hidden w-full bg-gradient-to-r from-btn2 to-btn1 text-white px-5 py-3 rounded-lg font-semibold">Find Relevant Doctors</button>}
          <button onClick={onClose} className="w-full bg-gray-800 dark:bg-gray-600 text-white px-5 py-3 rounded-lg font-semibold lg:col-start-2">Close</button>
        </div>
      </div>
    </div>
  );
}
