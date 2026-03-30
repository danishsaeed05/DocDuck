import React, { useState } from 'react';
import { useData } from '../data/dataStore';
import { toast } from 'sonner';

const DoctorDashboard: React.FC = () => {
  const { patientData, addLog, sendMessage, isWsConnected } = useData();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const latestLog = patientData.logs[0];
  const hasSevereRecent = patientData.logs.slice(0, 5).some(log => log.riskLevel === 'High');

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      await sendMessage(messageText);
      toast.success('Message sent successfully');
      setMessageText('');
      setIsMessageModalOpen(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const triggerTestAlert = (isEmergency: boolean) => {
    const testLog = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      mood: 'Stable' as const,
      symptoms: [],
      flaggedBodyParts: [],
      sleepDuration: '8h',
      journal: isEmergency ? 'This is a test EMERGENCY alert' : 'This is a test regular log entry',
    };
    addLog(testLog);
  };

  return (
    <div className="p-8 bg-surface">
      {/* Patient Header Anchor */}
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              alt="Maya Wayne Profile" 
              className="w-24 h-24 rounded-2xl object-cover shadow-sm" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd7h0o3Sggo9WVG3zwjSpsVdcZCw_Ehobm5Sjj3xe3JeDcUtpKxCAhGclnZxbIHL3pVVke8Nq357fyrcaHPFbj_6lL-qdZy4B2Qcx4bJBLoa9JUJMwa3H7k7d9DZm479SeB7rsVtZwLMHHlKM3r3z0ucOy3iVNWIU_tFDCBXaVBXf6oJrc4t16_movQOQ_uE8JagX-Ahw_2Hu-Rai6QaWrU2m5-mnbPoCVjb8kFyHu_9Q4tJ_I-Gl_PW-EUugHZoJ0-wBld2vJsMY" 
            />
            {hasSevereRecent && (
              <div className="absolute -top-2 -right-2 bg-error text-white p-1.5 rounded-lg shadow-md flex items-center justify-center animate-bounce" title="Severe Risk Flag">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">{patientData.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="bg-surface-container-high px-3 py-1 rounded-full text-sm font-medium text-on-surface-variant">Age: {patientData.age}</span>
              <span className="bg-surface-container-high px-3 py-1 rounded-full text-sm font-medium text-on-surface-variant">DOB: {patientData.dob}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-tighter ${
                hasSevereRecent ? 'bg-error-container text-error' : 'bg-secondary-container text-on-secondary-container'
              }`}>{hasSevereRecent ? 'High Risk' : patientData.status} Patient</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => triggerTestAlert(false)}
            disabled={!isWsConnected}
            className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all ${
              isWsConnected 
                ? 'bg-surface-container-lowest text-secondary hover:bg-surface-container' 
                : 'bg-surface-container-low text-slate-400 cursor-not-allowed opacity-70'
            }`}
          >
            <span className={`material-symbols-outlined ${!isWsConnected ? 'animate-spin' : ''}`}>
              {isWsConnected ? 'notifications' : 'sync'}
            </span>
            {isWsConnected ? 'Test Chime' : 'Connecting...'}
          </button>
          <button 
            onClick={() => triggerTestAlert(true)}
            disabled={!isWsConnected}
            className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all ${
              isWsConnected 
                ? 'bg-surface-container-lowest text-error hover:bg-surface-container' 
                : 'bg-surface-container-low text-slate-400 cursor-not-allowed opacity-70'
            }`}
          >
            <span className={`material-symbols-outlined ${!isWsConnected ? 'animate-spin' : ''}`}>
              {isWsConnected ? 'emergency' : 'sync'}
            </span>
            {isWsConnected ? 'Test Siren' : 'Connecting...'}
          </button>
          <button className="bg-surface-container-lowest text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">file_download</span>
            Export Record
          </button>
          <button 
            onClick={() => setIsMessageModalOpen(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="material-symbols-outlined">send</span>
            Send Secure Message
          </button>
        </div>
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-headline font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">lock</span>
                Secure Message to {patientData.name}
              </h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all resize-none font-body text-sm"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setMessageText("Hi Maya, I've reviewed your recent logs. Let's schedule a quick video consult to discuss the heart rate spikes.")}
                  className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={isSending || !messageText.trim()}
                className="bg-primary text-white px-8 py-2 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bento Layout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Zone */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Clinical Summary Card */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-secondary">psychology</span>
              <h3 className="font-headline text-xl font-bold text-primary uppercase tracking-wide">AI Clinical Summary</h3>
            </div>
            <div className="space-y-6">
              <div className="p-5 bg-surface-container-low rounded-xl border-l-4 border-[#006a6a]">
                <p className="font-body text-base leading-relaxed text-on-surface">
                  Patient exhibits a consistent <span className="font-bold text-primary">sleep debt pattern</span> averaging {patientData.biometrics.sleepDuration} hours/night over the last 14 days. Notable <span className="font-bold text-primary">heart rate spikes</span> detected during sedentary periods, statistically correlated with the patient's self-reported luteal phase.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-tertiary-container">
                    <span className="material-symbols-outlined text-sm">event_busy</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Environmental Link</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium">Chronic headaches linked to sustained late-night screen use (&gt;3hrs post-sunset).</p>
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-error">
                    <span className="material-symbols-outlined text-sm">trending_down</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Psychometric Trend</span>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium">Downward mood trend observed via weekly PHQ-9 mobile check-ins.</p>
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Analysis Confidence: 94%</span>
                  <span>Last Sync: {patientData.biometrics.lastSync}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Quick View */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 block">Avg Heart Rate</span>
              <div className="text-3xl font-headline font-extrabold text-primary">{patientData.biometrics.heartRate} <span className="text-sm font-medium text-slate-400">BPM</span></div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 block">Sleep Duration</span>
              <div className="text-3xl font-headline font-extrabold text-error">{patientData.biometrics.sleepDuration} <span className="text-sm font-medium text-slate-400">HRS</span></div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 block">Activity Index</span>
              <div className="text-3xl font-headline font-extrabold text-secondary">{patientData.biometrics.activityIndex} <span className="text-sm font-medium text-slate-400">/100</span></div>
            </div>
          </div>
        </div>

        {/* Recommended Actions Panel */}
        <aside className="space-y-6">
          <section className="bg-surface-container-high p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
              <h3 className="font-headline text-sm font-bold text-primary uppercase tracking-widest">Recommended Actions</h3>
            </div>
            <div className="space-y-3">
              {hasSevereRecent && (
                <div 
                  onClick={() => {
                    setMessageText("Schedule video consult - Review luteal heart rate spikes with patient and guardian.");
                    setIsMessageModalOpen(true);
                  }}
                  className="group bg-surface-container-lowest p-4 rounded-xl border-2 border-error/20 hover:border-error/40 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-error uppercase tracking-tighter">Critical Action</span>
                    <span className="material-symbols-outlined text-error text-lg transition-colors">video_call</span>
                  </div>
                  <p className="text-sm font-bold text-primary">Schedule video consult</p>
                  <p className="text-xs text-on-surface-variant mt-1">Review luteal heart rate spikes with patient and guardian.</p>
                </div>
              )}
              <div className="group bg-surface-container-lowest p-4 rounded-xl border border-transparent hover:border-secondary/20 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-secondary uppercase tracking-tighter">Immediate</span>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-secondary text-lg transition-colors">chevron_right</span>
                </div>
                <p className="text-sm font-bold text-primary">Update medication log</p>
                <p className="text-xs text-on-surface-variant mt-1">Ensure patient is tracking dosage accurately.</p>
              </div>
              <div className="group bg-surface-container-lowest p-4 rounded-xl border border-transparent hover:border-secondary/20 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Referral</span>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-secondary text-lg transition-colors">chevron_right</span>
                </div>
                <p className="text-sm font-bold text-primary">Refer to adolescent counselor</p>
                <p className="text-xs text-on-surface-variant mt-1">Address emerging downward mood trend and PHQ-9 scores.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default DoctorDashboard;
