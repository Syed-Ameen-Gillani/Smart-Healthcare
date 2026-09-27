import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaLocationDot, FaMagnifyingGlass, FaUserDoctor, FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { doctorAPI } from "../utils/api";

export default function DoctorDirectory() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: "",
    specialization: searchParams.get("specialization") || "",
    city: searchParams.get("city") || "",
  });
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const reason = searchParams.get("reason");

  useEffect(() => {
    Promise.all([doctorAPI.getSpecializations(), doctorAPI.getCities()])
      .then(([specialtyResult, cityResult]) => {
        setSpecializations(specialtyResult.data?.specializations || []);
        setCities(cityResult.data?.cities || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await doctorAPI.list({ ...filters, sort_by: "name" });
        setDoctors(response.data?.doctors || []);
      } catch (error) {
        toast.error(error.message || "Could not load doctors");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const update = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));

  return (
    <main className="app-page bg-gray-50 dark:bg-gray-950">
      <div className="app-page__inner max-w-6xl">
        <header className="mb-5">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Directory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Browse fictional demonstration doctors by specialty and city.</p>
        </header>

        {(reason || searchParams.get("specialization")) && (
          <div className="mb-5 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
            <strong>Report recommendation:</strong> {reason || `Showing ${searchParams.get("specialization")} specialists.`}
          </div>
        )}

        <section className="grid md:grid-cols-3 gap-3 mb-6" aria-label="Doctor filters">
          <label className="relative"><span className="sr-only">Search doctors</span><FaMagnifyingGlass className="absolute left-3 top-4 text-gray-400" /><input value={filters.search} onChange={update("search")} placeholder="Search by name" className="w-full border rounded-lg py-3 pl-10 pr-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white" /></label>
          <select value={filters.specialization} onChange={update("specialization")} className="border rounded-lg p-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white" aria-label="Specialization"><option value="">All specialties</option>{specializations.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={filters.city} onChange={update("city")} className="border rounded-lg p-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white" aria-label="City"><option value="">All cities</option>{cities.map((item) => <option key={item}>{item}</option>)}</select>
        </section>

        {loading ? <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" /> : (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <article key={doctor._id} className="group overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:border-blue-600 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-btn2 to-btn1 p-5">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-white/40 bg-white/15 text-3xl text-white"><FaUserDoctor /></span>
                  <span className="text-right text-xs font-semibold text-white/90">Fictional doctor<br /><span className="text-sm text-white">{doctor.city}</span></span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white">{doctor.name}</h2>
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-semibold">{doctor.specialization}</p>
                  {doctor.qualification && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{doctor.qualification}</p>}
                  <dl className="my-4 grid grid-cols-2 gap-4 border-y border-gray-100 py-3 dark:border-gray-700">
                    <div><dt className="text-xs text-gray-500 dark:text-gray-400">Experience</dt><dd className="mt-1 font-bold text-gray-900 dark:text-white">{doctor.experience_years != null ? `${doctor.experience_years} years` : "Not listed"}</dd></div>
                    <div className="text-right"><dt className="text-xs text-gray-500 dark:text-gray-400">Consultation fee</dt><dd className="mt-1 font-bold text-gray-900 dark:text-white">{doctor.consultation_fee != null ? `Rs ${doctor.consultation_fee}` : "Not listed"}</dd></div>
                  </dl>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex gap-2"><FaLocationDot className="mt-1 shrink-0" />{doctor.city} - {doctor.location}</p>
                  <button type="button" onClick={() => setSelectedDoctor(doctor)} className="mt-5 w-full bg-gradient-to-r from-btn2 to-btn1 text-white rounded-lg py-3 font-semibold hover:brightness-110 transition">View doctor profile</button>
                </div>
              </article>
            ))}
            {!doctors.length && <p className="sm:col-span-2 lg:col-span-3 text-center text-gray-500 py-12">No doctors match these filters.</p>}
          </section>
        )}
      </div>

      {selectedDoctor && <div className="app-fullscreen-overlay z-[70] bg-black/50 grid place-items-end sm:place-items-center sm:p-4" onClick={() => setSelectedDoctor(null)}>
        <section role="dialog" aria-modal="true" className="max-h-[85dvh] overflow-y-auto bg-white dark:bg-gray-900 rounded-t-lg sm:rounded-lg max-w-lg w-full p-6 pb-[calc(24px+var(--safe-bottom))] relative" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => setSelectedDoctor(null)} className="app-icon-button absolute right-3 top-3" aria-label="Close"><FaXmark /></button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-10">{selectedDoctor.name}</h2>
          <p className="text-blue-700 dark:text-blue-300 font-semibold">{selectedDoctor.specialization}</p>
          <dl className="mt-5 grid gap-3 text-sm dark:text-gray-200">
            <div><dt className="font-bold">Location</dt><dd>{selectedDoctor.location}, {selectedDoctor.city}</dd></div>
            <div><dt className="font-bold">Qualification</dt><dd>{selectedDoctor.qualification}</dd></div>
            <div><dt className="font-bold">Experience</dt><dd>{selectedDoctor.experience_years} years</dd></div>
            {selectedDoctor.consultation_fee != null && <div><dt className="font-bold">Consultation fee</dt><dd>Rs {selectedDoctor.consultation_fee}</dd></div>}
            {selectedDoctor.phone && <div><dt className="font-bold">Phone</dt><dd>{selectedDoctor.phone}</dd></div>}
          </dl>
          {selectedDoctor.bio && <p className="mt-5 text-sm text-gray-600 dark:text-gray-400">{selectedDoctor.bio}</p>}
        </section>
      </div>}
    </main>
  );
}
