import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BodyMap from './components/BodyMap';
import SymptomsMood from './components/SymptomsMood';
import DataExplorer from './components/DataExplorer';
import PatientLayout from './components/PatientLayout';
import DoctorLayout from './doctor/DoctorLayout';
import DoctorDashboard from './doctor/DoctorDashboard';
import DoctorLogs from './doctor/DoctorLogs';
import DoctorVitals from './doctor/DoctorVitals';
import { DataProvider } from './data/dataStore';
import AppLoader from './components/AppLoader';
import { Toaster } from 'sonner';

function AppContent() {
  return (
    <Routes>
      {/* Patient Portal Routes */}
      <Route path="/dashboard" element={<PatientLayout><Dashboard /></PatientLayout>} />
      <Route path="/how-i-feel/body-map" element={<PatientLayout><BodyMap /></PatientLayout>} />
      <Route path="/how-i-feel/symptoms-mood" element={<PatientLayout><SymptomsMood /></PatientLayout>} />
      <Route path="/data-explorer" element={<PatientLayout><DataExplorer /></PatientLayout>} />
      
      {/* Doctor Portal Routes */}
      <Route path="/doctor" element={<DoctorLayout><DoctorDashboard /></DoctorLayout>} />
      <Route path="/doctor/logs" element={<DoctorLayout><DoctorLogs /></DoctorLayout>} />
      <Route path="/doctor/vitals" element={<DoctorLayout><DoctorVitals /></DoctorLayout>} />

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/doctor" replace />} />
      <Route path="*" element={<Navigate to="/doctor" replace />} />
    </Routes>
  );
}

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
        <AppLoader />
        <h2 className="mt-6 text-2xl font-bold text-primary animate-pulse">DocDuck</h2>
        <p className="mt-2 text-slate-400 text-sm">Loading your wellness dashboard...</p>
      </div>
    );
  }

  return (
    <DataProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
}
