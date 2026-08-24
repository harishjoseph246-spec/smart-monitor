// =============================================================================
// REPORTS / pdfGenerator.ts
// =============================================================================
// Generates a downloadable A4 PDF inspection report using jsPDF.
// Called from the Reports page when the user clicks "Generate PDF Report".
//
// Report structure (top → bottom):
//   1. Header band      — dark navy bar with title, inspection ID, and date
//   2. Equipment info   — ID, name, type, location, manufacturer/model, health
//   3. Sensor readings  — current value for each of the 5 sensors
//   4. Anomaly section  — anomaly score + engine messages
//   5. Checklist        — one row per InspectionCheck (pass / warn / fail)
//   6. Final result     — PASS / WARNING / FAIL in colour
//   7. Findings         — auto-generated reasons + inspector's free text
//   8. Inspector + corrective action columns
//   9. Footer           — generated-by disclaimer
//
// If `inspection` is null (no inspection run yet), sections 5–8 are omitted
// and the report shows live sensor + anomaly data only.
// =============================================================================
import jsPDF from 'jspdf';
import { Equipment, Inspection, SensorKey } from '../types';
import { SENSOR_META } from '../rules/thresholds';

// Brand colour palette used throughout the PDF.
const NAVY: [number, number, number] = [8, 20, 32];
const ELECTRIC: [number, number, number] = [46, 107, 255];
const GOOD: [number, number, number] = [34, 197, 94];
const WARN: [number, number, number] = [245, 166, 35];
const CRIT: [number, number, number] = [239, 68, 68];

/** Pick the RGB colour for the final result text (PASS=green, WARNING=amber, FAIL=red). */
function resultColor(result: string): [number, number, number] {
  return result === 'FAIL' ? CRIT : result === 'WARNING' ? WARN : GOOD;
}

/**
 * Build and immediately trigger a browser download of the inspection PDF.
 * @param eq          The equipment being reported on (provides live sensor values).
 * @param inspection  The most recent completed inspection, or null for a live-data-only report.
 */
export function generateInspectionReportPdf(eq: Equipment, inspection: Inspection | null): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 0;

  // header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SMART MONITOR — Inspection Report', margin, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(180, 195, 210);
  doc.text(`${inspection?.id ?? 'DRAFT'}  ·  ${new Date(inspection?.date ?? Date.now()).toLocaleString()}`, margin, 62);

  y = 120;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${eq.id} — ${eq.name}`, margin, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`${eq.type} · ${eq.location} · ${eq.manufacturer} ${eq.model}`, margin, y);
  y += 14;
  doc.text(`Health Score: ${eq.health}%   Anomaly Score: ${eq.anomalyScore}%`, margin, y);

  y += 26;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('Sensor Readings', margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const keys = Object.keys(eq.sensors) as SensorKey[];
  const colWidth = (pageWidth - margin * 2) / keys.length;
  keys.forEach((k, i) => {
    const x = margin + i * colWidth;
    doc.setTextColor(120, 120, 120);
    doc.text(SENSOR_META[k].label, x, y);
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${eq.sensors[k].value}${eq.sensors[k].unit}`, x, y + 14);
    doc.setFont('helvetica', 'normal');
  });

  y += 40;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text('Anomaly Detection', margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  eq.anomalyMessages.forEach((m) => {
    doc.text(`• ${m}`, margin, y);
    y += 14;
  });

  if (inspection) {
    y += 12;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('Inspection Checklist', margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    inspection.checks.forEach((c) => {
      doc.setTextColor(60, 60, 60);
      doc.text(c.label, margin, y);
      const [r, g, b] = c.result === 'fail' ? CRIT : c.result === 'warning' ? WARN : GOOD;
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text(c.result.toUpperCase(), margin + 220, y);
      doc.setFont('helvetica', 'normal');
      y += 15;
    });

    y += 10;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const [r, g, b] = resultColor(inspection.result);
    doc.setTextColor(r, g, b);
    doc.text(`FINAL RESULT: ${inspection.result}`, margin, y);
    y += 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('Findings', margin, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    inspection.reasons.forEach((rline) => {
      const lines = doc.splitTextToSize(`• ${rline}`, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13;
    });
    if (inspection.findings) {
      const lines = doc.splitTextToSize(inspection.findings, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13;
    }

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Inspector', margin, y);
    doc.text('Corrective Action', margin + 200, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(inspection.inspector, margin, y);
    const caLines = doc.splitTextToSize(inspection.correctiveAction || inspection.recommendedAction, pageWidth - margin - (margin + 200));
    doc.text(caLines, margin + 200, y);
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Smart Real-Time Monitoring & Inspection System · Prototype uses simulated sensor data.', margin, doc.internal.pageSize.getHeight() - 28);

  doc.save(`${eq.id}-inspection-report.pdf`);
}
