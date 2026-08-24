# Smart Monitor

Real-time industrial equipment monitoring, anomaly detection, and inspection — from a live sensor feed to a signed-off PDF report, in one control-center UI.

## 🚀 Overview

Unplanned equipment failure is one of the most expensive problems in industrial operations — by the time a fault is visible to a human, it's often already causing downtime. Most small teams can't justify a full SCADA/IoT platform just to catch a motor overheating or a transformer drifting out of spec.

**Smart Monitor** is a working prototype of that missing middle layer: a live monitoring console that watches equipment sensors, flags abnormal behavior with a transparent rule-based engine (not a black box), turns that into actionable alerts, walks an inspector through a guided inspection, and produces a professional report — end to end.

What makes it different: every stage of the pipeline (thresholds → anomaly scoring → alerts → inspection → report) is a separate, inspectable module, so the "why" behind every alert is always visible, and the simulated sensor feed can be swapped for real hardware without touching the rest of the app.

## ✨ Key Features

- **Live dashboard** — KPI cards for total/online/warning/critical equipment, active alerts, and overall system health
- **4 seeded equipment units** — Industrial Motor, Water Pump, Transformer, Electrical Control Panel
- **Live Monitoring** — real-time charts and big-number readouts for temperature, current, voltage, vibration, and pressure
- **Smart Inspection workflow** — animated, auto-scored checklist (PASS / WARNING / FAIL) with inspector sign-off
- **Alerts** — search, filter by severity/status, sort, and resolve
- **Analytics** — system health gauge, equipment performance chart, alert distribution, inspection results, risk ranking
- **Inspection History** — full table with detail drill-down
- **Reports** — on-screen preview plus one-click PDF export
- **Architecture page** — interactive 6-layer system diagram, built into the app
- **Demo Control Center** — Start/Pause Monitoring, Simulate Warning, Simulate Critical Fault, Reset to Normal
- **One-click full demo** — runs the entire monitor → analyze → alert → inspect → report sequence end-to-end in ~60 seconds

## 🏗️ Architecture

```
Equipment  →  Sensors  →  Simulator  →  Rules/Thresholds
   →  Anomaly & Health Engines  →  Alert Engine
   →  React UI (Dashboard / Live / Inspection / Alerts / Analytics)
   →  PDF Report
```

Full breakdown, including how real IoT hardware (ESP32 / PLC / RTU over MQTT or REST) would plug in later: see [`docs/architecture.md`](docs/architecture.md).

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** lucide-react
- **Routing:** React Router
- **Reports:** jsPDF + html2canvas
- **State:** React Context (no backend — fully client-side simulation)
- **Deployment:** any static host (Vercel, Netlify, GitHub Pages)

## 📁 Project Structure

```
smart-monitor/
├── src/
│   ├── components/     Reusable UI: MetricCard, EquipmentCard, SensorCard, LiveChart,
│   │                   HealthGauge, AlertCard, AnomalyCard, InspectionStepper,
│   │                   StatusBadge, ActivityTimeline, ReportPreview, ArchitectureDiagram,
│   │                   Sidebar, Topbar, ToastStack
│   ├── pages/          Dashboard, LiveMonitoring, EquipmentPage, SmartInspection,
│   │                   Alerts, Analytics, InspectionHistory, Reports, Architecture, Settings
│   ├── services/        healthEngine.ts, anomalyEngine.ts, alertEngine.ts
│   ├── rules/            thresholds.ts — centralized, configurable rule engine
│   ├── simulation/       sensorSimulator.ts — realistic gradual sensor value generator
│   ├── data/              equipment.ts — seed data for 4 equipment
│   ├── context/           MonitoringContext.tsx — global real-time state + demo controller
│   ├── reports/           pdfGenerator.ts — jsPDF-based report export
│   ├── types/              shared TypeScript types
│   └── utils/               formatting helpers
├── docs/
│   └── architecture.md
├── public/
├── index.html
└── package.json
```

## ⚙️ Installation

Requires **Node.js 18+**.

```bash
git clone <repository-url>
cd smart-monitor
npm install
```

## 🔐 Environment Setup

None required — this prototype is fully client-side and uses a simulated sensor feed, so there are no API keys, credentials, or `.env` variables to configure.

## ▶️ Running the Project

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

No login is required — it's a single-tenant monitoring console.

## 🧪 Testing

No automated test suite is included in this prototype. The build was manually validated with `npm run build` (TypeScript + Vite production build, passing).

## 📸 Screenshots / Demo

_Add screenshots or a short GIF of the Dashboard, Live Monitoring, and Smart Inspection screens here before submitting._

## 🌐 Live Demo

_Add your deployed URL here (e.g. Vercel/Netlify) once deployed._

## 👥 Team

_Add team member names/roles here._

## 🏆 Hackathon Highlights

- **Innovation:** an inspectable, rule-based anomaly engine with a health score computed independently from the same sensor data — transparent by design, and architected so a real ML model could be swapped in later without touching the UI.
- **Technical implementation:** clean separation of concerns (simulation → rules → engines → state → UI → reports); realistic, organically-drifting simulated sensor data rather than random noise.
- **User experience:** a single "Start Full Hackathon Demo" button walks judges through the entire monitor → alert → inspect → report flow automatically in ~60 seconds.
- **Real-world impact:** the full pipeline — thresholds, anomaly scoring, alerting, guided inspection, and PDF reporting — mirrors what small industrial teams actually need, without the cost of a full SCADA platform.
- **Scalability:** `src/simulation/sensorSimulator.ts` is the only module that invents data; replacing it with a real MQTT/REST feed from ESP32/PLC/RTU hardware wouldn't require changes anywhere else in the app (see `docs/architecture.md`).

---

## How the Sensor Simulator Works

`src/simulation/sensorSimulator.ts` updates every equipment's 5 sensors (temperature, current, voltage, vibration, pressure) every 1.5 seconds. Instead of pure randomness, each tick nudges the value a small step toward a slowly-drifting target, producing organic curves (e.g. `64 → 65 → 65.4 → 66 → 65.7`) instead of noisy jumps.

When a demo scenario (Warning / Critical) is active for an equipment, the target is instead pulled toward realistic fault values (e.g. Critical: 105°C, 28A, 270V, 8.2 mm/s), so the transition looks like a developing fault rather than an instant jump.

## How the Anomaly Engine Works

`src/services/anomalyEngine.ts` is a **rule-based / statistical** engine (no trained ML model is used or claimed):

- Flags any sensor outside its configured threshold band (`src/rules/thresholds.ts` — thresholds are never hard-coded inside UI components)
- Checks rate-of-change over recent readings to catch sudden spikes
- Adds extra weight when multiple parameters are abnormal simultaneously
- Produces a 0–100 anomaly score and human-readable messages (e.g. "Potential overheating detected.")

Equipment health score (`src/services/healthEngine.ts`) is computed independently from the same sensor severities, weighted by how far past threshold each reading is.

## Running the Hackathon Demo

1. Open the app, land on the **Dashboard**.
2. In the **Demo Control Center** panel, click **🎬 Start Full Hackathon Demo**.
3. Over ~60 seconds the system will automatically:
   - Show normal monitoring
   - Gradually raise M-001's sensor values and trigger a **Warning**
   - Escalate to a **Critical Fault**, generating alerts, an anomaly score spike, and activity log entries
   - Navigate to **Smart Inspection** and run an automated inspection that **FAILs**
   - Record the inspection with a recommended corrective action
   - Navigate to **Reports** and prepare the inspection report for PDF export

You can also trigger each stage manually with the individual **Simulate Warning**, **Simulate Critical Fault**, and **Reset to Normal** buttons at any time.

## License

MIT — see [LICENSE](LICENSE).
