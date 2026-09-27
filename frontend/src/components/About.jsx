import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="mx-5 -mt-8 md:mx-10">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-lg bg-btn1 p-6 shadow-lg md:p-8">
        <p className="text-sm leading-relaxed text-gray-900 md:text-base">
          Smart Health is a final-year-project prototype that connects medical report upload, Gemini-assisted interpretation, abnormal-finding summaries, specialty recommendations, a city-filtered doctor directory, and demonstration medicine ordering. Its AI output supports informed discussion with qualified healthcare professionals and must not be treated as a diagnosis.
        </p>
      </motion.div>
    </div>
  );
}
