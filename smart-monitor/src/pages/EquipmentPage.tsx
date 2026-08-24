import React, { useState } from 'react';
import { Plus, Settings2, X, ChevronDown, Save, AlertTriangle } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { StatusBadge } from '../components/StatusBadge';
import { HealthGauge } from '../components/HealthGauge';
import { LiveChart } from '../components/LiveChart';
import { Equipment, EquipmentThresholdSet, SensorKey } from '../types';
import { SENSOR_META, cloneDefaultThresholds } from '../rules/thresholds';
import { severityColor } from '../utils/format';

type FilterType = 'All Types' | 'Motors' | 'Pumps' | 'Transformers' | 'Panels';

const TYPE_MAP: Record<FilterType, string[]> = {
  'All Types': [],
  'Motors': ['Motor'],
  'Pumps': ['Pump'],
  'Transformers': ['Transformer'],
  'Panels': ['Control Panel'],
};

const EQUIPMENT_TYPES = ['Motor', 'Pump', 'Transformer', 'Control Panel', 'Compressor', 'Generator', 'Conveyor'];

// ─── Add Equipment form state ────────────────────────────────────────────────
interface NewEquipmentForm {
  id: string;
  name: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  installationDate: string;
  // baseline sensor values
  temperature: string;
  current: string;
  voltage: string;
  vibration: string;
  pressure: string;
}

const EMPTY_FORM: NewEquipmentForm = {
  id: '',
  name: '',
  type: 'Motor',
  location: '',
  manufacturer: '',
  model: '',
  installationDate: new Date().toISOString().slice(0, 10),
  temperature: '60',
  current: '10',
  voltage: '230',
  vibration: '1.5',
  pressure: '3',
};

export function EquipmentPage() {
  const { equipment, addEquipment, updateThresholds } = useMonitoring();
  const [detail, setDetail] = useState<Equipment | null>(null);
  const [filter, setFilter] = useState<FilterType>('All Types');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showThreshModal, setShowThreshModal] = useState(false);
  const [threshTarget, setThreshTarget] = useState<Equipment | null>(null);

  const totalAssets = equipment.length;
  const active = equipment.filter((e) => e.status === 'Running' || e.status === 'Idle').length;
  const critical = equipment.filter((e) => e.status === 'Critical').length;
  const maintenanceDue = equipment.filter((e) => e.status === 'Maintenance' || e.health < 60).length;

  const displayed = filter === 'All Types'
    ? equipment
    : equipment.filter((e) => TYPE_MAP[filter].includes(e.type));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Equipment Registry</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all active industrial assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setThreshTarget(equipment[0] ?? null); setShowThreshModal(true); }}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings2 size={14} /> Configure Thresholds
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={14} /> Add New Equipment
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={totalAssets} icon="📦" />
        <StatCard label="Active" value={active} icon="✅" color="text-emerald-600" />
        <StatCard label="Critical" value={critical} icon="⚠️" color="text-red-600" highlight={critical > 0} />
        <StatCard label="Maintenance Due" value={maintenanceDue} icon="🔧" color="text-amber-600" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['All Types', 'Motors', 'Pumps', 'Transformers', 'Panels'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus-ring ${
                filter === f ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button className="btn-secondary flex items-center gap-2 text-xs">
            Sort by: Status (Critical First) <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Equipment cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayed.map((eq) => (
          <EquipmentRegistryCard
            key={eq.id}
            eq={eq}
            onView={() => setDetail(eq)}
            onConfigure={() => { setThreshTarget(eq); setShowThreshModal(true); }}
          />
        ))}
        {displayed.length === 0 && (
          <div className="col-span-3 card p-12 text-center text-gray-400">
            No equipment of this type found.
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="card max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div>
                <div className="text-xs font-mono font-semibold text-blue-600">{detail.id}</div>
                <div className="font-display font-bold text-gray-900 text-lg">{detail.name}</div>
                <div className="text-sm text-gray-500">{detail.type} · {detail.location}</div>
              </div>
              <div className="ml-auto"><StatusBadge status={detail.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Field label="Manufacturer" value={detail.manufacturer} />
              <Field label="Model" value={detail.model} />
              <Field label="Installed" value={detail.installationDate} />
              <Field label="Last Inspection" value={detail.lastInspection ? new Date(detail.lastInspection).toLocaleDateString() : 'Never'} />
              <Field label="Alert Count" value={String(detail.alertCount)} />
              <Field label="Anomaly Score" value={`${detail.anomalyScore}%`} />
            </div>
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Threshold Configuration</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Sensor</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Warning</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">Critical</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(Object.keys(detail.thresholds) as SensorKey[]).map((k) => {
                      const t = detail.thresholds[k];
                      return (
                        <tr key={k}>
                          <td className="px-3 py-2.5 text-gray-700 font-medium">{SENSOR_META[k].label}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs text-amber-600">{t.warningHigh}{SENSOR_META[k].unit}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs text-red-600">{t.criticalHigh}{SENSOR_META[k].unit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-3">
              <HealthGauge score={detail.health} size={56} />
              <div className="flex-1">
                <LiveChart data={detail.sensors.temperature.history} color={severityColor(detail.sensors.temperature.severity)} height={56} />
              </div>
            </div>
            <button
              onClick={() => { setDetail(null); setThreshTarget(detail); setShowThreshModal(true); }}
              className="mt-4 w-full btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Settings2 size={14} /> Edit Thresholds
            </button>
          </div>
        </div>
      )}

      {/* ── Add Equipment modal ── */}
      {showAddModal && (
        <AddEquipmentModal
          existingIds={equipment.map((e) => e.id)}
          onClose={() => setShowAddModal(false)}
          onAdd={(eq) => { addEquipment(eq); setShowAddModal(false); }}
        />
      )}

      {/* ── Configure Thresholds modal ── */}
      {showThreshModal && threshTarget && (
        <ThresholdsModal
          equipment={equipment}
          initial={threshTarget}
          onClose={() => setShowThreshModal(false)}
          onSave={(eqId, t) => { updateThresholds(eqId, t); setShowThreshModal(false); }}
        />
      )}
    </div>
  );
}

// ─── Add Equipment Modal ─────────────────────────────────────────────────────

function AddEquipmentModal({
  existingIds,
  onClose,
  onAdd,
}: {
  existingIds: string[];
  onClose: () => void;
  onAdd: (eq: Equipment) => void;
}) {
  const [form, setForm] = useState<NewEquipmentForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof NewEquipmentForm, string>>>({});

  const set = (field: keyof NewEquipmentForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.id.trim()) errs.id = 'Required';
    else if (existingIds.includes(form.id.trim().toUpperCase())) errs.id = 'ID already exists';
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.location.trim()) errs.location = 'Required';
    if (!form.manufacturer.trim()) errs.manufacturer = 'Required';
    if (!form.model.trim()) errs.model = 'Required';
    const numFields = ['temperature', 'current', 'voltage', 'vibration', 'pressure'] as const;
    numFields.forEach((f) => {
      if (isNaN(Number(form[f])) || Number(form[f]) <= 0) errs[f] = 'Must be > 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const baseline: Record<SensorKey, number> = {
      temperature: Number(form.temperature),
      current: Number(form.current),
      voltage: Number(form.voltage),
      vibration: Number(form.vibration),
      pressure: Number(form.pressure),
    };
    const sensors = {} as Equipment['sensors'];
    (Object.keys(baseline) as SensorKey[]).forEach((key) => {
      sensors[key] = {
        key,
        label: SENSOR_META[key].label,
        unit: SENSOR_META[key].unit,
        value: baseline[key],
        history: [{ t: Date.now(), v: baseline[key] }],
        severity: 'normal',
      };
    });
    const eq: Equipment = {
      id: form.id.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      location: form.location.trim(),
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      installationDate: form.installationDate,
      status: 'Running',
      health: 97,
      lastInspection: null,
      alertCount: 0,
      sensors,
      thresholds: cloneDefaultThresholds(),
      anomalyScore: 2,
      anomalyMessages: [],
      baseline,
    };
    onAdd(eq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="card max-w-xl w-full p-6 relative max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Plus size={15} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base">Add New Equipment</h3>
            <p className="text-xs text-gray-500">Register a new industrial asset for live monitoring.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Equipment ID" error={errors.id} required>
              <input
                value={form.id}
                onChange={(e) => set('id', e.target.value)}
                placeholder="e.g. M-005"
                className={inputCls(!!errors.id)}
              />
            </FormField>
            <FormField label="Type" error={errors.type}>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls(false)}>
                {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          {/* Row 2 */}
          <FormField label="Equipment Name" error={errors.name} required>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Cooling Fan Motor" className={inputCls(!!errors.name)} />
          </FormField>

          {/* Row 3 */}
          <FormField label="Location" error={errors.location} required>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Bay 3 — Assembly Line" className={inputCls(!!errors.location)} />
          </FormField>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Manufacturer" error={errors.manufacturer} required>
              <input value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} placeholder="e.g. Siemens" className={inputCls(!!errors.manufacturer)} />
            </FormField>
            <FormField label="Model" error={errors.model} required>
              <input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. SD-2000" className={inputCls(!!errors.model)} />
            </FormField>
          </div>

          {/* Row 5 */}
          <FormField label="Installation Date" error={undefined}>
            <input type="date" value={form.installationDate} onChange={(e) => set('installationDate', e.target.value)} className={inputCls(false)} />
          </FormField>

          {/* Baseline sensor values */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">
              Baseline Sensor Values <span className="text-gray-400 normal-case font-normal">(healthy operating point)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                ['temperature', '°C'],
                ['current', 'A'],
                ['voltage', 'V'],
                ['vibration', 'mm/s'],
                ['pressure', 'bar'],
              ] as [keyof NewEquipmentForm, string][]).map(([key, unit]) => (
                <FormField key={key} label={`${SENSOR_META[key as SensorKey]?.label ?? key} (${unit})`} error={errors[key]}>
                  <input
                    type="number"
                    step="0.1"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputCls(!!errors[key])}
                  />
                </FormField>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Plus size={14} /> Add Equipment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Configure Thresholds Modal ──────────────────────────────────────────────

function ThresholdsModal({
  equipment,
  initial,
  onClose,
  onSave,
}: {
  equipment: Equipment[];
  initial: Equipment;
  onClose: () => void;
  onSave: (eqId: string, t: EquipmentThresholdSet) => void;
}) {
  const [selectedId, setSelectedId] = useState(initial.id);
  const eq = equipment.find((e) => e.id === selectedId) ?? initial;

  // Local editable copy of thresholds
  const [thresholds, setThresholds] = useState<EquipmentThresholdSet>(() =>
    JSON.parse(JSON.stringify(eq.thresholds))
  );

  // When user switches equipment, reload that equipment's thresholds
  const handleSelectEq = (id: string) => {
    setSelectedId(id);
    const found = equipment.find((e) => e.id === id);
    if (found) setThresholds(JSON.parse(JSON.stringify(found.thresholds)));
  };

  const setVal = (sensor: SensorKey, field: keyof EquipmentThresholdSet[SensorKey], value: string) => {
    setThresholds((prev) => ({
      ...prev,
      [sensor]: { ...prev[sensor], [field]: value === '' ? undefined : Number(value) },
    }));
  };

  const hasError = (val: number | undefined, compare?: number) => {
    if (val === undefined) return false;
    if (compare !== undefined && val >= compare) return true;
    return val <= 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="card max-w-2xl w-full p-6 relative max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Settings2 size={15} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base">Configure Thresholds</h3>
            <p className="text-xs text-gray-500">Edit per-sensor warning and critical limits for each asset.</p>
          </div>
        </div>

        {/* Equipment selector */}
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Select Equipment</div>
          <div className="flex flex-wrap gap-1.5">
            {equipment.map((e) => (
              <button
                key={e.id}
                onClick={() => handleSelectEq(e.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                  e.id === selectedId
                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  e.status === 'Critical' ? 'bg-red-400' :
                  e.status === 'Warning' ? 'bg-amber-400' :
                  e.id === selectedId ? 'bg-white' : 'bg-emerald-500'
                }`} />
                {e.id} — {e.name.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Threshold table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">Sensor</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-amber-600">⚠ Warning High</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-red-600">🔴 Critical High</th>
                {/* voltage also has low bounds */}
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-amber-600">⚠ Warning Low</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-red-600">🔴 Critical Low</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(Object.keys(thresholds) as SensorKey[]).map((k) => {
                const t = thresholds[k];
                const unit = SENSOR_META[k].unit;
                const warnErr = hasError(t.warningHigh, t.criticalHigh);
                const critErr = t.criticalHigh <= 0;
                return (
                  <tr key={k} className={warnErr || critErr ? 'bg-red-50/40' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {SENSOR_META[k].label}
                      <span className="ml-1 text-[10px] text-gray-400 font-normal">{unit}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="number"
                        step="0.5"
                        value={t.warningHigh}
                        onChange={(e) => setVal(k, 'warningHigh', e.target.value)}
                        className={`w-20 text-center rounded-lg border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors ${
                          warnErr ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="number"
                        step="0.5"
                        value={t.criticalHigh}
                        onChange={(e) => setVal(k, 'criticalHigh', e.target.value)}
                        className={`w-20 text-center rounded-lg border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-colors ${
                          critErr ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {k === 'voltage' ? (
                        <input
                          type="number"
                          step="0.5"
                          value={t.warningLow ?? ''}
                          onChange={(e) => setVal(k, 'warningLow', e.target.value)}
                          className="w-20 text-center rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {k === 'voltage' ? (
                        <input
                          type="number"
                          step="0.5"
                          value={t.criticalLow ?? ''}
                          onChange={(e) => setVal(k, 'criticalLow', e.target.value)}
                          className="w-20 text-center rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-colors"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Warning High must be less than Critical High. Changes take effect on the next simulation tick (~1.5s).
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button
            onClick={() => onSave(selectedId, thresholds)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Save size={14} /> Save Thresholds
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Equipment registry card ─────────────────────────────────────────────────

function EquipmentRegistryCard({
  eq,
  onView,
  onConfigure,
}: {
  eq: Equipment;
  onView: () => void;
  onConfigure: () => void;
}) {
  const isCrit = eq.status === 'Critical';
  const isWarn = eq.status === 'Warning';
  const isOnline = eq.status === 'Running' || eq.status === 'Idle';

  const primarySensor: SensorKey = (() => {
    if (eq.type === 'Motor' || eq.type === 'Transformer') return 'vibration';
    if (eq.type === 'Pump') return 'pressure';
    return 'temperature';
  })();

  const sensor = eq.sensors[primarySensor];

  return (
    <div className={`card p-5 ${isCrit ? 'border-red-200' : isWarn ? 'border-amber-200' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${
            isCrit ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {eq.type === 'Motor' ? '⚡ HEAVY MOTOR'
              : eq.type === 'Pump' ? '💧 CENTRIFUGAL PUMP'
              : eq.type === 'Transformer' ? '⚡ TRANSFORMER'
              : eq.type === 'Control Panel' ? '📋 CONTROL PANEL'
              : eq.type === 'Compressor' ? '🔩 COMPRESSOR'
              : eq.type === 'Generator' ? '⚡ GENERATOR'
              : `🔧 ${eq.type.toUpperCase()}`}
          </div>
          <div className="font-display font-bold text-gray-900 text-base">{eq.id}</div>
          <div className="text-xs text-gray-500 mt-0.5">{eq.name}</div>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
          isCrit ? 'bg-red-50 text-red-700 border-red-200'
            : isWarn ? 'bg-amber-50 text-amber-700 border-amber-200'
            : isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}>
          {isCrit ? '🔴 CRITICAL' : isWarn ? '🟡 WARNING' : isOnline ? '🟢 ONLINE' : eq.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
        <div>
          <div className="text-gray-400 font-medium">Manufacturer</div>
          <div className="text-gray-700 font-semibold">{eq.manufacturer}</div>
        </div>
        <div>
          <div className="text-gray-400 font-medium">Install Date</div>
          <div className="text-gray-700 font-semibold">{eq.installationDate}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Key Metrics</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs font-medium">{sensor?.label?.split(' ')[0] ?? 'Sensor'}</span>
            <span className={`ml-2 font-bold font-mono ${
              sensor?.severity === 'critical' ? 'text-red-600' : sensor?.severity === 'warning' ? 'text-amber-600' : 'text-gray-900'
            }`}>
              {sensor?.value} <span className="text-xs text-gray-400 font-normal">{sensor?.unit}</span>
            </span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (sensor?.value ?? 0) / (primarySensor === 'vibration' ? 10 : primarySensor === 'temperature' ? 120 : primarySensor === 'pressure' ? 15 : 100) * 100)}%`,
              background: sensor?.severity === 'critical' ? '#ef4444' : sensor?.severity === 'warning' ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onConfigure}
          className="text-xs font-semibold text-gray-500 hover:text-gray-700 py-1 transition-colors flex items-center gap-1"
        >
          <Settings2 size={12} /> Thresholds
        </button>
        <button
          onClick={onView}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color = 'text-gray-900', highlight = false }: {
  label: string; value: number; icon: string; color?: string; highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? 'border-red-200 bg-red-50/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow mb-1">{label}</div>
          <div className={`font-bold text-3xl font-mono ${color}`}>{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${highlight ? 'bg-red-100' : 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-sm text-gray-700 font-medium mt-0.5">{value}</div>
    </div>
  );
}

function FormField({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-300 bg-red-50 focus:ring-red-400/20 focus:border-red-400'
      : 'border-gray-200 bg-white focus:ring-blue-500/20 focus:border-blue-400'
  }`;
}
