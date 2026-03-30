import React from 'react';
import { useData } from '../data/dataStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { patientData } = useData();

  return (
    <div className="text-on-background min-h-screen pb-32">
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Hero Banner Section */}
        <section className="mb-10 relative overflow-hidden rounded-xl bg-primary-container/20 p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              Privacy Focused
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-primary-container leading-tight mb-4">
              Hi {patientData.name.split(' ')[0]}, your data is helping <br />your care team support you.
            </h2>
            <p className="text-on-surface-variant max-w-md text-sm leading-relaxed">
              Everything shared here is safe, private, and used only to give you the best care possible.
            </p>
          </div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Mascot Integration */}
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <span className="material-symbols-outlined text-[120px] text-primary">water_drop</span>
            </div>
            <img 
              alt="DocDuck Mascot" 
              className="relative z-10 drop-shadow-xl transform -rotate-6 w-32 h-32 object-contain" 
              src="/DocDuck.png"
              referrerPolicy="no-referrer"
            />
          </div>
        </section>

        {/* Stats Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Resting Heart Rate */}
          <div className="md:col-span-2 rounded-xl p-8 bg-surface-container-lowest flex flex-col justify-between shadow-[0_8px_32px_rgba(145,142,244,0.06)] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Heart Health</span>
                <h3 className="text-2xl font-headline font-bold text-on-surface">Resting Heart Rate</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
            </div>
            <div className="flex items-end gap-4 mb-6">
              <span className="text-5xl font-black text-on-surface">{patientData.biometrics.heartRate}</span>
              <span className="text-on-surface-variant pb-2 font-medium">BPM</span>
              <span className="text-secondary font-bold pb-2 flex items-center gap-1 text-sm">
                <span className="material-symbols-outlined text-sm">trending_down</span>
                Stable
              </span>
            </div>
            {/* Sparkline Mockup */}
            <div className="h-24 w-full flex items-end gap-1 px-1">
              {patientData.biometrics.heartRateSeries.slice(-12).map((point, i) => (
                <div 
                  key={i}
                  className="bg-primary/20 hover:bg-primary transition-all w-full rounded-full"
                  style={{ height: `${(point.bpm / 120) * 100}%` }}
                  title={`${point.time}: ${point.bpm} BPM`}
                ></div>
              ))}
            </div>
          </div>

          {/* Sleep Card */}
          <div className="md:col-span-2 rounded-xl p-8 bg-surface-container-lowest flex flex-col justify-between shadow-[0_8px_32px_rgba(145,142,244,0.06)] border-l-8 border-[#918EF4]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Rest & Recovery</span>
                <h3 className="text-2xl font-headline font-bold text-on-surface">Sleep Duration</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bedtime</span>
              </div>
            </div>
            <div className="my-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-on-surface">{patientData.biometrics.sleepDuration}<span className="text-2xl ml-1">h</span></span>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-tight">Quality: High</div>
                <div className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold uppercase tracking-tight">+1h today</div>
              </div>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[85%] rounded-full"></div>
            </div>
          </div>

          {/* Steps Card */}
          <div className="md:col-span-1 rounded-xl p-6 bg-[#e4fff4] flex flex-col items-center text-center shadow-[0_8px_32px_rgba(145,142,244,0.06)]">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-secondary mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl">steps</span>
            </div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-secondary-dim/60 mb-1">Activity Index</h3>
            <div className="text-4xl font-black text-secondary-dim mb-2">{patientData.biometrics.activityIndex}</div>
            <p className="text-xs font-bold text-secondary-dim/70">Keep it up!</p>
          </div>

          {/* Menstrual Cycle Card */}
          <div className="md:col-span-2 rounded-xl p-8 bg-[#fff7f5] shadow-[0_8px_32px_rgba(145,142,244,0.06)] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-tertiary/60 block mb-1">Cycle Tracking</span>
                <h3 className="text-2xl font-headline font-bold text-tertiary">Day 14 of cycle</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-tertiary shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-6 z-10 relative">
              <div className="flex-1">
                <p className="text-tertiary-dim font-medium mb-3">Your window of high energy. Great time for a workout!</p>
                <Link to="/how-i-feel/symptoms-mood" className="text-tertiary font-bold text-sm flex items-center gap-2 underline underline-offset-4 decoration-tertiary-fixed decoration-2">
                  Log Symptoms <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-tertiary-fixed/30" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-tertiary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="125.6" strokeWidth="8"></circle>
                </svg>
                <div className="absolute text-tertiary font-black text-xl">14</div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-tertiary-fixed/10 rounded-full blur-3xl"></div>
          </div>

          {/* Last Synced Footer */}
          <div className="md:col-span-1 rounded-xl p-6 bg-surface-container-high/40 flex flex-col justify-center items-center text-center opacity-70">
            <span className="material-symbols-outlined text-slate-400 mb-2">sync</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Status</span>
            <p className="text-sm font-medium text-on-surface">Last synced 2m ago</p>
          </div>
        </div>

        {/* Recent Logs Section */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-headline font-bold text-on-surface">Recent Check-ins</h3>
            <Link to="/how-i-feel/symptoms-mood" className="text-primary font-bold text-sm flex items-center gap-1">
              Add New <span className="material-symbols-outlined text-sm">add</span>
            </Link>
          </div>
          <div className="space-y-4">
            {patientData.logs.slice(0, 3).map((log) => (
              <div key={log.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4 border-l-4 border-primary/20">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
                    <span className="text-2xl">{log.mood === 'Exhausted' ? '😴' : log.mood === 'Stressed' ? '😰' : log.mood === 'Energized' ? '⚡️' : '😊'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-on-surface">{log.mood}</span>
                      <span className="text-xs text-on-surface-variant">• {log.date} at {log.time}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {log.symptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold uppercase text-on-surface-variant">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {log.journal && (
                  <div className="md:max-w-xs">
                    <p className="text-sm text-on-surface-variant italic line-clamp-2">"{log.journal}"</p>
                  </div>
                )}
              </div>
            ))}
            {patientData.logs.length === 0 && (
              <div className="text-center py-12 bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant">
                <p className="text-on-surface-variant font-medium">No check-ins yet. How are you feeling today?</p>
                <Link to="/how-i-feel/symptoms-mood" className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-full font-bold text-sm">
                  Start First Log
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Secondary CTA Grid */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-xl p-8 bg-surface-container flex items-center gap-8 group cursor-pointer hover:bg-surface-container-highest transition-colors">
            <div className="hidden sm:block">
              <img 
                alt="Learning" 
                className="w-24 h-24 transform group-hover:scale-110 transition-transform object-contain" 
                src="/DocDuck.png"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-xl font-headline font-bold mb-2">Understanding your trends</h4>
              <p className="text-on-surface-variant text-sm">Check out our guide on how your sleep affects your heart rate and mood during the week.</p>
            </div>
            <div className="ml-auto">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-8 bg-white flex flex-col justify-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Support</p>
            <p className="text-on-surface font-headline font-bold mb-4">Need help explaining this to a pro?</p>
            <Link 
              to="/data-explorer"
              className="bg-secondary text-white rounded-full py-3 px-6 font-bold text-sm shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all inline-block"
            >
              View Raw Data
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
