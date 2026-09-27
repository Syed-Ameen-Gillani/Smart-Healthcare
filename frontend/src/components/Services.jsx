import { motion } from "framer-motion";
import { fadeIn } from "../variants";

const services = [
  { title: "Medical report analysis", details: "Upload a PDF or report image to extract findings, abnormal values, risk context, and a clear decision-support summary.", icon: "/health-report.gif" },
  { title: "Specialist recommendations", details: "Translate report findings into a relevant specialty recommendation with a plain-language reason.", icon: "/doctor.gif" },
  { title: "Doctor directory", details: "Browse clearly fictional demonstration doctors by specialty and city.", icon: "/doctor.gif" },
  { title: "Demo medicine orders", details: "Select medicines, reference an uploaded prescription report, and submit a clearly labeled demonstration order.", icon: "/server.gif" },
  { title: "Gemini health chat", details: "Ask general health questions through a safety-focused AI assistant that does not replace professional care.", icon: "/chat-bot.gif" },
];

export default function Services() {
  return (
    <section className="my-10 py-12 font-text">
      <div className="container mx-auto">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-extrabold text-lightText dark:text-blue-300">What Smart Health offers</h2>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-400">A focused academic prototype built around the report-to-care demonstration journey.</p>
        </div>
        <div className="flex flex-wrap">
          {services.map((service) => <ServiceCard key={service.title} {...service} />)}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon, title, details }) {
  return (
    <motion.div variants={fadeIn("up", 0)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} className="w-full px-5 md:w-1/2 md:px-10">
      <div className="mb-6 flex min-h-48 items-center gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <img src={icon} alt="" className="h-16 w-16 shrink-0 object-contain mix-blend-multiply" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{details}</p>
        </div>
      </div>
    </motion.div>
  );
}
