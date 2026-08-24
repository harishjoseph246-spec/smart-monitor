import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MonitoringProvider } from './context/MonitoringContext';
import { Layout } from './Layout';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { EquipmentPage } from './pages/EquipmentPage';
import { SmartInspectionPage } from './pages/SmartInspection';
import { AlertsPage } from './pages/Alerts';
import { AnalyticsPage } from './pages/Analytics';
import { InspectionHistoryPage } from './pages/InspectionHistory';
import { ReportsPage } from './pages/Reports';
import { ArchitecturePage } from './pages/Architecture';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <MonitoringProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-monitoring" element={<LiveMonitoring />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/inspection" element={<SmartInspectionPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history" element={<InspectionHistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </MonitoringProvider>
  );
}
