import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../data/dataStore';
import { motion, AnimatePresence } from 'motion/react';

const PatientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { messages, markMessagesAsRead, confirmAppointment } = useData();
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const isHowIFeel = location.pathname.startsWith('/how-i-feel');
  const isDashboard = location.pathname === '/dashboard';

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleToggleMessages = () => {
    if (!isMessagesOpen && unreadCount > 0) {
      markMessagesAsRead();
    }
    setIsMessagesOpen(!isMessagesOpen);
  };

  const handleConfirm = async (id: string) => {
    setConfirmingId(id);
    // 10 second delay as requested
    setTimeout(async () => {
      await confirmAppointment(id);
      setConfirmingId(null);
      setShowSuccess(id);
      // Show success for 3 seconds
      setTimeout(() => setShowSuccess(null), 3000);
    }, 3000);
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container min-h-screen flex flex-col font-plus-jakarta">
      {/* TopAppBar */}
      <header className="w-full top-0 px-6 py-4 flex justify-between items-center bg-[#fff8f4] sticky z-50 tonal-transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center overflow-hidden border border-secondary-container-highest">
            <img 
              src="/DocDuck.png" 
              alt="DocDuck Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-[#918EF4]">DocDuck</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={handleToggleMessages}
              className="p-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors relative"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isMessagesOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#918EF4]">Messages from Doctor</h4>
                  <span className="text-[10px] font-bold text-slate-400">{messages.length} Total</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {messages.length > 0 ? (
                    [...messages].reverse().map(msg => (
                      <div 
                        key={msg.id} 
                        className={`p-4 border-b border-slate-50 last:border-0 transition-colors ${!msg.isRead ? 'bg-[#918EF4]/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-[#918EF4] uppercase">
                            {new Date(msg.timestamp).toLocaleDateString()}
                          </span>
                          {msg.type === 'appointment' && (
                            <span className="bg-secondary-container text-secondary text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Appointment
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface font-medium leading-relaxed">
                          {msg.text}
                        </p>
                        
                        {(msg.type === 'appointment' || msg.text.toLowerCase().includes('schedule') || msg.text.toLowerCase().includes('consult')) && (
                          <div className="mt-3">
                            {msg.isConfirmed ? (
                              <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Appointment Confirmed
                              </div>
                            ) : confirmingId === msg.id ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase animate-pulse">
                                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                  We are with you every step of the way...
                                </div>
                              </div>
                            ) : showSuccess === msg.id ? (
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Appointment Confirmed!
                              </motion.div>
                            ) : (
                              <button 
                                onClick={() => handleConfirm(msg.id)}
                                className="flex items-center gap-2 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-primary-dark transition-all shadow-sm"
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                                Confirm Appointment
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic text-sm">No messages yet</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <span className="text-on-surface-variant font-medium text-sm hidden sm:inline">Oct 24, 10:45 AM</span>
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-white shadow-sm">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiAZ72D8XCrYXykxTtm_efgbGgr07pyU5J3U4_K6N-filusOZB6ELKG-oSLVUHldF0g69z5tO2-q0GNJtZcuJNba7DZQKsGcbzub7n82iqUfwzlDy-JT4uk4AJmZckuvM6cuMqN5H5U-OcOgWF-2GXQDiRwxLWv3SDBjJogI9uLX4SlVk2dudjRrFLrzIrL0SH137WuojLUouxKwRW2qTOfMcxz3te86vWayG6vx0zOms4I-rOpHdZivJlAOuAAB6kvIhHkwvxNZ8"
              referrerPolicy="no-referrer"
              alt="User profile"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-6 pb-32">
        {isHowIFeel && (
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <section className="mb-10">
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">How I Feel</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed">Checking in with yourself is the first step to feeling better.</p>
            </section>
            
            <div className="flex gap-2 p-1.5 bg-surface-container rounded-full max-w-md">
              <Link 
                to="/how-i-feel/body-map" 
                className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all text-center ${
                  location.pathname === '/how-i-feel/body-map' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Body Map
              </Link>
              <Link 
                to="/how-i-feel/symptoms-mood" 
                className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all text-center ${
                  location.pathname === '/how-i-feel/symptoms-mood' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Symptoms & Mood
              </Link>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 py-4 bg-white/70 backdrop-blur-xl shadow-[0_-8px_32px_rgba(145,142,244,0.06)] rounded-t-[3rem] pb-safe">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center px-6 py-2 rounded-full transition-all ${
            isDashboard 
              ? 'bg-[#918EF4] text-white' 
              : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isDashboard ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
          <span className="font-medium text-[10px] uppercase tracking-wider">My Data</span>
        </Link>
        <Link 
          to="/how-i-feel/body-map" 
          className={`flex flex-col items-center justify-center px-6 py-2 rounded-full transition-all ${
            isHowIFeel 
              ? 'bg-[#918EF4] text-white' 
              : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: isHowIFeel ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          <span className="font-medium text-[10px] uppercase tracking-wider">How I Feel</span>
        </Link>
      </nav>

      {/* Contextual FAB for Dashboard */}
      {isDashboard && (
        <div className="fixed right-6 bottom-24 z-40">
          <button className="cta-gradient text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-110 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientLayout;
