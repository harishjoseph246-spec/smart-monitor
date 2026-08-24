import React, { useEffect, useState } from 'react';
import { FileDown, AlertCircle } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import { ReportPreview } from '../components/ReportPreview';
import { generateInspectionReportPdf } from '../reports/pdfGenerator';

export function ReportsPage() {
  const { equipment, inspections, reportEquipmentId, clearReportEquipment } = useMonitoring();
  const [selected, setSelected] = useState(reportEquipmentId ?? equipment[0]?.id);

  useEffect(() => {
    if (reportEquipmentId) {
      setSelected(reportEquipmentId);
      clearReportEquipment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportEquipmentId]);

  const eq = equipment.find((e) => e.id === selected) ?? equipment[0];
  const latestInspection = inspections.find((i) => i.equipmentId === eq?.id) ?? null;

  if (!eq) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Inspection Report</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Professional report combining live sensor data, anomaly detection, and inspection findings.
          </p>
        </div>
        <button
          onClick={() => generateInspectionReportPdf(eq, latestInspection)}
          className="btn-primary flex items-center gap-2"
        >
          <FileDown size={15} /> Generate PDF Report
        </button>
      </div>

      {/* Equipment selector */}
      <div className="flex flex-wrap gap-2">
        {equipment.map((e) => {
          const hasInspection = inspections.some((i) => i.equipmentId === e.id);
          return (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-ring ${
                e.id === selected
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  e.status === 'Critical' ? 'bg-red-500 animate-pulseDot' :
                  e.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {e.id}
              {hasInspection && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Has inspection" />
              )}
            </button>
          );
        })}
      </div>

      {/* Warning if no inspection */}
      {!latestInspection && (
        <div className="card border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            No completed inspection found for <strong>{eq.id}</strong> yet — this preview shows live sensor
            and anomaly data only. Run a Smart Inspection first for the full report.
          </p>
        </div>
      )}

      {/* Report preview */}
      <ReportPreview eq={eq} inspection={latestInspection} />
    </div>
  );
}
