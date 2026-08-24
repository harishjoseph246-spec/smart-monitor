# Architecture

## System Layers

```
Physical Equipment (Motor, Pump, Transformer, Control Panel)
        │  (sensor readings: temperature, current, voltage, vibration, pressure)
        ▼
Sensor Simulator  (src/simulation/sensorSimulator.ts)
  Generates organic, drifting sensor values every 1.5s instead of pure noise.
        ▼
Rules / Thresholds  (src/rules/thresholds.ts)
  Centralized per-sensor, per-equipment threshold configuration.
        ▼
Processing Services  (src/services/)
  ├─ anomalyEngine.ts   → rule-based anomaly scoring (0–100) + messages
  ├─ healthEngine.ts    → equipment health score from sensor severities
  └─ alertEngine.ts     → converts anomalies into actionable alerts
        ▼
Global State  (src/context/MonitoringContext.tsx)
  React Context holding live equipment/sensor/alert/inspection state
  and the demo scenario controller (Start/Pause, Simulate Warning/Critical, Reset).
        ▼
UI Layer  (src/pages/, src/components/)
  Dashboard, Live Monitoring, Equipment, Smart Inspection, Alerts,
  Analytics, Inspection History, Reports, Architecture, Settings.
        ▼
Reporting  (src/reports/pdfGenerator.ts)
  jsPDF-based export of inspection/equipment reports.
```

## Why this shape

- **Rules are decoupled from UI.** `src/rules/thresholds.ts` is the single source of truth
  for what counts as "warning" or "critical" per sensor/equipment — no thresholds are
  hard-coded inside components.
- **The anomaly engine is swappable.** `anomalyEngine.ts` is intentionally rule-based
  (statistical thresholding + rate-of-change), shaped so a trained model (e.g. isolation
  forest or LSTM over the same sensor history) could later be swapped in without touching
  any calling code.
- **Simulation is isolated.** `src/simulation/sensorSimulator.ts` is the only place that
  invents data. Swapping it for a real MQTT/REST feed from hardware (ESP32/PLC/RTU) would
  not require changes anywhere else in the app.

## Connecting Real IoT Hardware Later

In a production deployment, an **ESP32**, **PLC**, or **RTU** would read physical sensors
and publish readings over **MQTT** or a **REST API**. A small ingestion service would
replace `sensorSimulator.ts`'s tick function, feeding the same shape of data into
`MonitoringContext`, and the rest of the pipeline (rules → engines → UI → reports) would
work unchanged.
