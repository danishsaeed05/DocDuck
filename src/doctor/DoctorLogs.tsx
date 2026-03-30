import React, { useEffect, useRef } from 'react';
import { useData } from '../data/dataStore';
import { useSearchParams } from 'react-router-dom';

interface DoctorLogsProps {
  searchQuery?: string;
}

const DoctorLogs: React.FC<DoctorLogsProps> = ({ searchQuery = '' }) => {
  const { patientData } = useData();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = patientData.logs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      (log.journal?.toLowerCase() || log.journalNote?.toLowerCase() || '').includes(query) ||
      (log.mood?.toLowerCase() || '').includes(query) ||
      (log.symptoms?.some(s => s.toLowerCase().includes(query)) || false) ||
      (log.flaggedBodyParts?.some(p => p.toLowerCase().includes(query)) || false) ||
      (log.date?.toLowerCase() || '').includes(query)
    );
  });

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`log-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightId, filteredLogs]);

  return (
    <div className="p-8 bg-surface space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight uppercase">Qualitative Timeline</h3>
          <p className="font-body text-sm text-on-surface-variant">Daily wellness data from 'How I Feel' patient application.</p>
        </div>
        <div className="flex gap-2">
          {searchQuery && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">search</span>
              Results for: "{searchQuery}"
            </span>
          )}
          <button className="p-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
        </div>
      </div>

      {filteredLogs.length > 0 ? (
        filteredLogs.map((log) => (
          <article 
            key={log.id} 
            id={`log-${log.id}`}
            className={`bg-surface-container-lowest rounded-xl p-6 shadow-sm relative border-l-4 overflow-hidden transition-all hover:shadow-md ${
              highlightId === log.id ? 'ring-4 ring-primary ring-opacity-50 scale-[1.02] z-10' : ''
            } ${
              log.riskLevel === 'High' ? 'border-error' : 
              log.riskLevel === 'Moderate' ? 'border-tertiary-fixed-dim' : 'border-secondary/30'
            }`}
          >
            {log.riskLevel === 'High' && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-black font-label uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[12px]">priority_high</span> Severe Entry
                </span>
              </div>
            )}
            <div className="flex gap-6">
              <div className="flex flex-col items-center w-20 pt-1">
                <span className="font-headline text-lg font-extrabold text-on-surface">{log.date}</span>
                <span className="font-label text-xs text-on-surface-variant font-medium">{log.time}</span>
                <div className={`mt-4 w-12 h-12 rounded-full flex items-center justify-center ${
                  log.mood === 'Exhausted' ? 'bg-error-container/30 text-error' : 
                  log.mood === 'Energized' ? 'bg-secondary-container/30 text-secondary' : 'bg-tertiary-container/10 text-on-tertiary-container'
                }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {log.mood === 'Exhausted' ? 'heart_broken' : log.mood === 'Energized' ? 'bolt' : 'sentiment_neutral'}
                  </span>
                </div>
                <span className={`mt-2 font-label text-[10px] font-bold uppercase ${
                  log.mood === 'Exhausted' ? 'text-error' : log.mood === 'Energized' ? 'text-secondary' : 'text-on-tertiary-container'
                }`}>{log.mood}</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Reported Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {log.symptoms.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-medium">{s}</span>
                      ))}
                      {log.symptoms.length === 0 && <span className="text-xs text-on-surface-variant italic">None reported</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Body Map Flags</h4>
                    <div className="flex items-center gap-2 text-on-surface font-semibold text-sm">
                      {(log.flaggedBodyParts?.length || 0) > 0 ? (
                        <>
                          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
                          {log.flaggedBodyParts?.join(', ')}
                        </>
                      ) : (
                        <span className="italic text-on-surface-variant">No regions flagged</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Sleep Duration</h4>
                    <div className="flex items-center gap-2 text-on-surface font-semibold text-sm">
                      <span className="material-symbols-outlined text-secondary">bedtime</span>
                      {log.sleepDuration}
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${log.riskLevel === 'High' ? 'bg-error-container/10 border border-error/20' : 'bg-surface-container-low'}`}>
                  <h4 className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Journal Note</h4>
                  <p className="font-body text-sm text-on-surface leading-relaxed">
                    "{log.journal || log.journalNote || 'No note provided'}"
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
          <p className="text-slate-500 font-medium">No logs found matching your search.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-primary font-bold text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorLogs;
