/* Idempotent Smart Health FYP demo-data seed. Run with the temporary mongodb package described in README. */
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function loadEnv(filePath) {
  const values = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

const doctors = [
  ["Dr. Ayesha Noor", "General Medicine", "Islamabad", "Smart Health Demo Clinic, Islamabad", 8, "MBBS, FCPS Medicine", 1200],
  ["Dr. Hamza Ali", "Endocrinology", "Lahore", "Smart Health Demo Hospital, Lahore", 11, "MBBS, FCPS Endocrinology", 1800],
  ["Dr. Sara Khan", "Cardiology", "Karachi", "Smart Health Demo Heart Centre, Karachi", 13, "MBBS, FCPS Cardiology", 2000],
  ["Dr. Bilal Ahmed", "Hematology", "Rawalpindi", "Smart Health Demo Medical Centre, Rawalpindi", 10, "MBBS, FCPS Hematology", 1700],
  ["Dr. Zainab Tariq", "Gastroenterology", "Islamabad", "Smart Health Demo Digestive Centre, Islamabad", 9, "MBBS, FCPS Gastroenterology", 1650],
  ["Dr. Usman Raza", "Nephrology", "Lahore", "Smart Health Demo Kidney Centre, Lahore", 12, "MBBS, FCPS Nephrology", 1900],
  ["Dr. Maryam Iqbal", "Pulmonology", "Karachi", "Smart Health Demo Chest Clinic, Karachi", 9, "MBBS, FCPS Pulmonology", 1600],
  ["Dr. Farhan Shah", "Neurology", "Peshawar", "Smart Health Demo Neuro Centre, Peshawar", 14, "MBBS, FCPS Neurology", 2100],
  ["Dr. Hira Saeed", "Dermatology", "Faisalabad", "Smart Health Demo Skin Clinic, Faisalabad", 7, "MBBS, FCPS Dermatology", 1400],
  ["Dr. Omar Javed", "Pediatrics", "Muzaffarabad", "Smart Health Demo Children Clinic, Muzaffarabad", 8, "MBBS, FCPS Pediatrics", 1300],
].map(([name, specialization, city, location, experience_years, qualification, consultation_fee], index) => ({
  name, specialization, city, location, experience_years, qualification, consultation_fee,
  phone: `+92-300-555-${String(index + 1).padStart(4, "0")}`,
  available_days: index % 2 ? ["Tuesday", "Thursday", "Saturday"] : ["Monday", "Wednesday", "Friday"],
  bio: `Fictional ${specialization.toLowerCase()} doctor created only for the Smart Health FYP demonstration.`,
  added_by: "smart-health-fyp-seed", avg_rating: 4.5, review_count: 0, active: true, is_demo: true,
}));

const medicines = [
  ["Demo Paracetamol", "Paracetamol", "Pain relief", 120, false],
  ["Demo Vitamin D", "Cholecalciferol", "Supplements", 220, false],
  ["Demo Iron Tablets", "Ferrous sulfate", "Supplements", 180, true],
  ["Demo Glucose Support", "Educational item", "Endocrine care", 250, true],
  ["Demo Heart Care", "Educational item", "Cardiac care", 300, true],
  ["Demo ORS", "Oral rehydration salts", "Hydration", 80, false],
  ["Demo Antacid", "Calcium carbonate", "Digestive care", 110, false],
  ["Demo Multivitamin", "Multivitamin", "Supplements", 200, false],
].map(([name, generic_name, category, price, requires_prescription]) => ({
  name, generic_name, category, price, requires_prescription, active: true, is_demo: true,
  description: "Fictional item for the Smart Health FYP demonstration.",
}));

async function run() {
  const env = loadEnv(path.resolve(__dirname, "..", ".env"));
  const configuredUri = env.MONGO_URI || "";
  let uri = configuredUri && !configuredUri.includes("<db_password>")
    ? configuredUri
    : env.MONGODB_URI;
  if (uri && env.MONGODB_USERNAME && env.MONGODB_PASSWORD) {
    const schemeEnd = uri.indexOf("://") + 3;
    const at = uri.indexOf("@", schemeEnd);
    if (schemeEnd > 2 && at > schemeEnd) {
      const credentials = `${encodeURIComponent(env.MONGODB_USERNAME)}:${encodeURIComponent(env.MONGODB_PASSWORD)}`;
      uri = `${uri.slice(0, schemeEnd)}${credentials}${uri.slice(at)}`;
    }
  }
  const dbName = env.MONGO_DBNAME;
  if (!uri || !dbName) throw new Error("MONGO_URI/MONGODB_URI and MONGO_DBNAME are required");
  const client = new MongoClient(uri, { family: 4, serverSelectionTimeoutMS: 30000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    for (const doctor of doctors) {
      await db.collection("doctors").updateOne(
        { name: doctor.name, is_demo: true },
        { $set: doctor, $setOnInsert: { created_at: new Date().toISOString() } },
        { upsert: true },
      );
    }
    for (const medicine of medicines) {
      await db.collection("medicine_catalog").updateOne(
        { name: medicine.name, is_demo: true },
        { $set: medicine },
        { upsert: true },
      );
    }
    const [doctorCount, medicineCount] = await Promise.all([
      db.collection("doctors").countDocuments({ is_demo: true }),
      db.collection("medicine_catalog").countDocuments({ is_demo: true }),
    ]);
    console.log(JSON.stringify({ success: true, doctors: doctorCount, medicines: medicineCount }));
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }));
  process.exitCode = 1;
});
