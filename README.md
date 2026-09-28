# Smart Health

Smart Health is an academic FYP prototype for a focused healthcare demo flow:

1. Create an account and sign in.
2. Upload a PDF or image medical report.
3. Review Gemini-assisted report analysis, abnormalities, risk level, and specialty recommendation.
4. Filter a fictional doctor directory by specialty or city.
5. Submit a fictional medicine order from a demo catalog.
6. Export summary data or generate a PDF summary report.

This project is for demonstration and decision support only. It is not a diagnosis tool, emergency service, prescription service, pharmacy, payment system, or fulfillment platform.

## Project Scope

Included:

- JWT-based signup, login, logout, and auth status checks.
- User profile retrieval and update.
- Medical report upload for PDF/image files with Gemini-assisted analysis.
- Report normalization and specialty recommendation logic.
- Health metrics history from analyzed reports.
- Fictional doctor directory with admin-only seeding.
- Fictional medicine catalog and medicine orders.
- Prescription-required demo items that require a user-owned uploaded report.
- PDF summary generation with recent reports and demo medicine orders.
- CSV export summaries/downloads for supported demo data.
- React/Vite frontend with protected routes and mobile app shell support.
- Capacitor Android project for packaging the frontend as an APK.

Not included:

- Clinical validation.
- Real appointments.
- Real prescriptions.
- Real medicine inventory, payments, delivery, or pharmacy fulfillment.
- Two-factor authentication.
- LiveKit voice doctor.
- Family profiles, medication adherence tracking, gamification, notification websockets, or appointment calendars.

## Tech Stack

Backend:

- Python, FastAPI, Uvicorn
- MongoDB with Motor/PyMongo
- Google Gemini through `google-genai`
- JWT auth with `python-jose` and bcrypt
- ReportLab PDF generation
- Pillow, PyPDF2, aiofiles for file/report handling
- slowapi rate limiting

Frontend:

- React 18
- Vite 5
- Tailwind CSS 3
- React Router
- Framer Motion
- React Toastify
- React Markdown
- i18next
- Capacitor Android

## Repository Structure

```text
Smart Healthcare/
|-- backend/
|   |-- main.py                    # FastAPI app, CORS, security headers, routers
|   |-- config/
|   |   `-- settings.py            # Environment and application settings
|   |-- database/
|   |   |-- connection.py          # MongoDB connection and indexes
|   |   `-- models.py              # Pydantic request/data models
|   |-- routes/
|   |   |-- auth.py                # Signup, login, logout, status
|   |   |-- contact.py             # Contact form
|   |   |-- doctors.py             # Fictional doctor directory and seed endpoint
|   |   |-- export.py              # CSV export and summary
|   |   |-- files.py               # Uploads, downloads, report analysis
|   |   |-- gemini.py              # Health chat and Gemini status
|   |   |-- medicine_orders.py     # Demo medicine catalog and orders
|   |   |-- profile.py             # Profile read/update
|   |   `-- reports.py             # PDF summary generation
|   |-- services/
|   |   |-- auth_service.py
|   |   |-- email_service.py
|   |   |-- gemini_service.py
|   |   `-- specialty_service.py
|   |-- tests/
|   |   |-- test_report_normalization.py
|   |   `-- test_specialty_service.py
|   `-- requirements.txt
|-- frontend/
|   |-- android/                   # Capacitor Android project
|   |-- src/
|   |   |-- components/            # Home, contact, chat, app shell, report modal
|   |   |-- context/               # Auth and theme providers
|   |   |-- pages/                 # App pages/routes
|   |   |-- utils/                 # API and runtime helpers
|   |   `-- App.jsx                # Route definitions
|   |-- package.json
|   `-- vite.config.js
|-- livekit-agent/                 # Legacy/experimental agent folder, not wired into current app
|-- output/                        # Local APK/sample report outputs
|-- scripts/                       # Demo data/report utility scripts
`-- README.md
```

## Backend Setup

From the repository root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API starts on `http://localhost:8000` by default.

API docs are available at:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

### Backend Environment

The backend loads configuration from local environment variables or a local `.env` file. Keep real database URLs, Gemini keys, JWT secrets, and deployment settings out of Git. The required settings are defined in `backend/config/settings.py`.

Example local `.env` template:

```env
# Local database or your own private Atlas URI. Do not commit the real value.
MONGO_URI=replace_with_your_local_or_private_mongodb_uri
MONGO_DBNAME=replace_with_your_database_name

# Use a long random value in real deployments.
SECRET_KEY=replace_with_a_long_random_secret

# Use your own Gemini key locally. Do not commit the real value.
GEMINI_API_KEY=replace_with_your_gemini_api_key

# Optional admin account for seed/create-only demo endpoints.
ADMIN_EMAIL=admin@example.com

# Add only trusted frontend/mobile origins for your environment.
ALLOWED_ORIGINS=replace_with_comma_separated_allowed_origins

ENV=development
LOG_LEVEL=INFO
PORT=8000
```

Uploads are written to `uploads/`. The configured maximum upload size is 10 MB. Allowed extensions are `pdf`, `png`, `jpg`, `jpeg`, `gif`, `doc`, `docx`, and `txt`; Gemini analysis is run for PDF and image uploads.

## Frontend Setup

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`.

Production build:

```bash
cd frontend
npm run build
```

The frontend API base URL is resolved by `frontend/src/utils/runtime.js`. For local browser development, run the backend on `http://localhost:8000`.

## Android Build

The Android project lives in `frontend/android` and is managed through Capacitor.

Use a frontend mobile environment file such as `frontend/.env.mobile` when building for a device or APK. Do not put MongoDB, Gemini, or JWT secrets in frontend environment files.

Example:

```env
VITE_API_URL=https://your-fastapi-deployment.example.com
```

Build and sync:

```bash
cd frontend
npm ci
npm run android:sync
cd android
gradlew.bat assembleDebug
```

The debug APK is produced under:

```text
frontend/android/app/build/outputs/apk/debug/
```

Backend CORS must include the Capacitor origins used by the Android WebView, including `capacitor://localhost` and `https://localhost`.

## Main Frontend Routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home page | Public |
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/privacy` | Privacy policy | Public |
| `/terms` | User agreement | Public |
| `/dashboard` | Health dashboard | Protected |
| `/profile` | Profile and uploaded reports | Protected |
| `/report` | PDF health summary | Protected |
| `/doctors` | Doctor directory | Protected |
| `/export` | Data export | Protected |
| `/medicine-store` | Demo medicine catalog/orders | Protected |
| `/more` | Additional mobile/app options | Protected |

Authenticated users also see the floating Gemini chat component.

## API Surface

General:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | API welcome/status metadata |
| GET | `/health` | Database/Gemini health check |

Authentication:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/auth/status` | Check current session |
| POST | `/auth/signup` | Register user |
| POST | `/auth/login` | Log in |
| POST | `/auth/logout` | Log out |

Gemini:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/gemini/chat` | Health chat response |
| POST | `/gemini/chat/stream` | Streaming chat response |
| GET | `/gemini/status` | Gemini availability |

Profile:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/profile` | Get profile |
| PATCH | `/profile/update` | Update profile |

Files and report analysis:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/files/upload` | Upload report/file |
| GET | `/files` | List current user's files |
| GET | `/files/metrics/history` | Timeline of analyzed report metrics |
| GET | `/files/{file_id}` | Download/view a file |
| GET | `/files/{file_id}/analysis` | Get or run report analysis |
| DELETE | `/files/{file_id}` | Delete a file |

Reports:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/reports/summary?days=90` | Summary counts for reports/orders |
| GET | `/reports/generate?days=90` | Download PDF summary |

Doctors:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/doctors` | List doctors with filters |
| GET | `/doctors/specializations` | Distinct specializations |
| GET | `/doctors/cities` | Distinct cities |
| GET | `/doctors/{doctor_id}` | Doctor detail |
| POST | `/doctors` | Add doctor, admin only |
| POST | `/doctors/seed` | Seed fictional doctors, admin only |

Demo medicine orders:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/medicine-catalog` | List fictional catalog items |
| POST | `/medicine-catalog/seed` | Seed catalog, admin only |
| POST | `/medicine-orders` | Create demo order |
| GET | `/medicine-orders` | List user's demo orders |
| GET | `/medicine-orders/{order_id}` | Order detail |

Export and contact:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/export/summary?days=90` | Exportable data summary |
| GET | `/export/csv/{data_type}?days=90` | CSV download |
| POST | `/contact` | Submit contact form |

## Demo Data Notes

The doctor seed endpoint creates fictional doctors in Muzaffarabad, Islamabad, and Rawalpindi across specialties such as General Medicine, Cardiology, Endocrinology, Hematology, Gastroenterology, Nephrology, Pulmonology, and Neurology.

The medicine catalog is fictional and includes demo items such as paracetamol, vitamin D, iron tablets, glucose support, heart care, ORS, antacid, and multivitamins. Some items require a selected uploaded report before an order can be submitted.

## Testing

Backend tests currently cover report analysis normalization and specialty mapping:

```bash
cd backend
python -m pytest tests
```

Useful manual checks before an FYP demo:

- Signup/login/logout.
- Upload PDF and image reports.
- Confirm report analysis output includes risk, findings, abnormal values, and specialty recommendation.
- Filter doctors by recommended specialty and city.
- Submit a demo medicine order with and without a prescription-required item.
- Generate the PDF summary report.
- Download CSV export.
- Build and install the Android debug APK if presenting on a device.

## Security and Safety

- `atlas-credentials.env`, `.env`, and other secret files must stay ignored and local.
- Secrets belong in backend environment variables only.
- Frontend and Android builds must never include MongoDB, Gemini, or JWT secret values.
- `SECRET_KEY` is mandatory in production.
- CORS should be restricted to deployed frontend/mobile origins in production.
- AI-generated report analysis must be presented as support information, not medical diagnosis.
- The demo medicine flow is intentionally fictional and should not be connected to real payment or fulfillment without a full product/security review.

## Credits

This project is based on work originally created by [**shubhamprasad318**](https://github.com/shubhamprasad318) in the [AI_health_care](https://github.com/shubhamprasad318/AI_health_care) repository. This version was adapted with feature additions, removals, and project-specific changes for the Smart Health FYP.
