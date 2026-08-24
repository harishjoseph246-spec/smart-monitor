// =============================================================================
// DATA / equipment.ts
// =============================================================================
// Static seed data for the four monitored assets.
// `createSeedEquipment()` is called once by MonitoringContext to initialise
// the equipment array.  Each asset gets:
//   - Its own deep-cloned threshold set (so per-asset limits can diverge).
//   - One initial history point per sensor so LiveChart renders immediately.
//   - A slightly-below-perfect health score (97) and a low anomaly score (4)
//     to look realistic from the first render.
//
// To add more equipment: append a new SeedSpec to SEEDS.
// =============================================================================
import { Equipment, SensorKey } from '../types';
import { cloneDefaultThresholds, SENSOR_META } from '../rules/thresholds';

// Internal shape used only within this file to define seed assets concisely.
interface SeedSpec {
  id: string;
  name: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  installationDate: string;
  // "Healthy normal" sensor values — the simulator drifts around these.
  baseline: Record<SensorKey, number>;
}

// The four physical assets registered in the system.
// Baseline values are realistic operating points for each equipment type.
const SEEDS: SeedSpec[] = [
  {
    id: 'M-001',
    name: 'Industrial Motor',
    type: 'Motor',
    location: 'Bay 1 — Production Floor',
    manufacturer: 'Siemens',
    model: 'SIMOTICS SD-4000',
    installationDate: '2022-03-14',
    baseline: { temperature: 64, current: 11.8, voltage: 231, vibration: 2.0, pressure: 3.2 },
  },
  {
    id: 'P-002',
    name: 'Water Pump',
    type: 'Pump',
    location: 'Utility Room B',
    manufacturer: 'Grundfos',
    model: 'CR-15 Vertical',
    installationDate: '2021-11-02',
    baseline: { temperature: 52, current: 9.4, voltage: 228, vibration: 1.6, pressure: 5.1 },
  },
  {
    id: 'T-003',
    name: 'Transformer',
    type: 'Transformer',
    location: 'Substation 2',
    manufacturer: 'ABB',
    model: 'DTC-630kVA',
    installationDate: '2019-06-20',
    baseline: { temperature: 58, current: 13.2, voltage: 238, vibration: 0.8, pressure: 2.4 },
  },
  {
    id: 'E-004',
    name: 'Electrical Control Panel',
    type: 'Control Panel',
    location: 'Panel Room 1',
    manufacturer: 'Schneider Electric',
    model: 'Prisma iPM',
    installationDate: '2023-01-09',
    baseline: { temperature: 41, current: 7.1, voltage: 233, vibration: 0.4, pressure: 1.1 },
  },
];

/**
 * Build the initial Equipment[] array from the seed specs.
 * Called once during MonitoringContext initialisation.
 * Each sensor starts at its baseline value with one history point.
 */
export function createSeedEquipment(): Equipment[] {
  return SEEDS.map((s) => {
    const sensors = {} as Equipment['sensors'];
    (Object.keys(s.baseline) as SensorKey[]).forEach((key) => {
      const meta = SENSOR_META[key];
      sensors[key] = {
        key,
        label: meta.label,
        unit: meta.unit,
        value: s.baseline[key],
        history: [{ t: Date.now(), v: s.baseline[key] }],
        severity: 'normal',
      };
    });

    return {
      id: s.id,
      name: s.name,
      type: s.type,
      location: s.location,
      manufacturer: s.manufacturer,
      model: s.model,
      installationDate: s.installationDate,
      status: 'Running',
      health: 97,
      lastInspection: null,
      alertCount: 0,
      sensors,
      thresholds: cloneDefaultThresholds(),
      anomalyScore: 4,
      anomalyMessages: [],
      baseline: s.baseline,
    } satisfies Equipment;
  });
}
