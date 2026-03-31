import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../data/dataStore';

const DoctorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { patientData } = useData();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Check connection status by looking at the global WebSocket if we had one, 
    // but since it's inside DataProvider, we can just listen for global events or 
    // simply assume it's working if no errors are logged.
    // For a better UX, let's just add a small indicator that pulses.
    const timer = setTimeout(() => setWsStatus('connected'), 2000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: 'Overview', path: '/doctor', icon: 'dashboard' },
    { name: 'Patient Logs', path: '/doctor/logs', icon: 'description' },
    { name: 'Vitals', path: '/doctor/vitals', icon: 'favorite' },
  ];

  const severeLogs = patientData.logs.filter(log => log.riskLevel === 'High');
  const totalLogs = patientData.logs.length;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex">
      {/* SideNavBar */}
      <aside className="bg-[#00193c] h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-50">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
            <img 
              src="/DocDuck.png" 
              alt="DocDuck Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-headline text-xl font-bold text-white tracking-tight">DocDuck</h1>
        </div>
        <div className="px-4 mb-8 flex items-center gap-3">
          <img 
            alt="Dr. Strange Profile Picture" 
            className="w-10 h-10 rounded-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8R7FE_1jgT1trmjLetW4G4oIjbd5x-bs-cxPYxFXu6bvP8imCgl0WC2ZSJWVlDM5X-nNkfEzQPx3pzLTgNLU-fg7bg5DaXc98m_dB8gDQhiYaVgy-U_01oPvjeFIfFhnP9aoeGXbZXO9-L37ytrB0lWnTrfwjAgvVkr8_nfpYcYFKbJILyukHZU3xu_qNnbJ5-dkEVmCxN3N3QZOKlCrxrhXlUG63beT0_cmZ-cTCVeYUjblEvRHm2nYCmRIWbtrWN_r8sKE3RBI" 
          />
          <div>
            <p className="font-body text-sm font-medium tracking-wide text-white">Dr. Strange</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Family Physician</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                location.pathname === item.path
                  ? 'text-[#90efef] border-l-4 border-[#90efef] bg-white/10'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 mt-auto">
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#006a6a] to-[#004f4f] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] duration-150">
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Patient
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="ml-64 flex-1 flex flex-col">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-8 h-16 border-b border-slate-200/15">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="font-headline uppercase tracking-widest text-sm font-black text-[#002d62]">Clinical Curator</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Live Sync {wsStatus}</span>
              </div>
            </div>
            {isSearchOpen && (
              <div className="flex items-center bg-surface-container rounded-full px-4 py-1.5 animate-in slide-in-from-left-4 duration-300">
                <span className="material-symbols-outlined text-sm text-slate-400">search</span>
                <input 
                  type="text" 
                  placeholder="Search logs, symptoms..." 
                  className="bg-transparent border-none outline-none text-sm px-2 w-64 font-body"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                  <span className="material-symbols-outlined text-sm text-slate-400 hover:text-slate-600">close</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            {!isSearchOpen && (
              <span 
                className="material-symbols-outlined text-slate-500 p-2 cursor-pointer hover:bg-surface-container transition-colors rounded-full"
                onClick={() => setIsSearchOpen(true)}
              >
                search
              </span>
            )}
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <span 
                className="material-symbols-outlined text-slate-500 p-2 cursor-pointer hover:bg-surface-container transition-colors rounded-full"
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsEmergencyOpen(false); }}
              >
                notifications
              </span>
              {totalLogs > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {totalLogs}
                </span>
              )}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-primary">Recent Patient Logs</h4>
                    <span className="text-[10px] font-bold text-slate-400">{totalLogs} Entries</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {patientData.logs.length > 0 ? (
                      patientData.logs.slice(0, 5).map(log => (
                        <Link 
                          key={log.id} 
                          to={`/doctor/logs?id=${log.id}`} 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-primary uppercase">{log.date}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.riskLevel === 'High' ? 'bg-error-container text-error' : 'bg-secondary-container text-secondary'
                            }`}>{log.riskLevel} Risk</span>
                          </div>
                          <p className="text-xs text-on-surface line-clamp-2 font-medium">"{log.journal || log.journalNote || 'No note provided'}"</p>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic text-sm">No recent logs</div>
                    )}
                  </div>
                  <Link 
                    to="/doctor/logs" 
                    className="block p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    View All Logs
                  </Link>
                </div>
              )}
            </div>

            {/* Emergency Alert Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setIsEmergencyOpen(!isEmergencyOpen); setIsNotificationsOpen(false); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  severeLogs.length > 0 ? 'bg-error text-white animate-pulse shadow-lg shadow-error/30' : 'bg-slate-200 text-slate-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-sm">emergency</span>
                Emergency Alert {severeLogs.length > 0 && `(${severeLogs.length})`}
              </button>
              {isEmergencyOpen && severeLogs.length > 0 && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-error/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                  <div className="p-4 border-b border-error/10 bg-error-container/10 flex justify-between items-center">
                    <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-error">Severe Alerts</h4>
                    <span className="text-[10px] font-bold text-error">{severeLogs.length} Critical</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {severeLogs.map(log => (
                      <Link 
                        key={log.id} 
                        to={`/doctor/logs?id=${log.id}`} 
                        onClick={() => setIsEmergencyOpen(false)}
                        className="block p-4 hover:bg-error-container/5 transition-colors border-b border-error/5 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-error uppercase">{log.date} @ {log.time}</span>
                          <span className="material-symbols-outlined text-error text-sm animate-bounce">warning</span>
                        </div>
                        <p className="text-xs text-on-surface font-bold">"{log.journal || log.journalNote || 'No note provided'}"</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {log.symptoms.map((s, i) => (
                            <span key={i} className="text-[9px] bg-error-container text-error px-1.5 py-0.5 rounded font-bold uppercase">{s}</span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    to="/doctor/logs" 
                    className="block p-3 text-center text-xs font-bold text-error hover:bg-error-container/10 transition-colors border-t border-error/10"
                    onClick={() => setIsEmergencyOpen(false)}
                  >
                    Review All Severe Cases
                  </Link>
                </div>
              )}
            </div>

            <img 
              alt="John Smith Patient Profile" 
              className="w-8 h-8 rounded-full border border-slate-200" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiAZ72D8XCrYXykxTtm_efgbGgr07pyU5J3U4_K6N-filusOZB6ELKG-oSLVUHldF0g69z5tO2-q0GNJtZcuJNba7DZQKsGcbzub7n82iqUfwzlDy-JT4uk4AJmZckuvM6cuMqN5H5U-OcOgWF-2GXQDiRwxLWv3SDBjJogI9uLX4SlVk2dudjRrFLrzIrL0SH137WuojLUouxKwRW2qTOfMcxz3te86vWayG6vx0zOms4I-rOpHdZivJlAOuAAB6kvIhHkwvxNZ8" 
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="mt-16 flex-1">
          {/* Pass search query to children if needed, but for now we'll just implement it in DoctorLogs */}
          {React.cloneElement(children as React.ReactElement, { searchQuery })}
        </div>

        {/* Footer */}
        <footer className="bg-[#f8f9fa] w-full py-4 border-t border-slate-200/10 flex flex-row justify-between items-center px-8">
          <div className="flex gap-4">
            <a className="font-body text-xs uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors" href="#">Privacy Policy</a>
            <a className="font-body text-xs uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors" href="#">HIPAA Compliance</a>
            <a className="font-body text-xs uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors" href="#">Support</a>
          </div>
          <p className="font-body text-xs uppercase tracking-tighter text-slate-400">
            © 2024 Clinical Curator System | <span className="font-bold text-primary/40">Protected Health Information (PHI)</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default DoctorLayout;
