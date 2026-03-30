import React, { useState, useEffect } from 'react';
import { useData } from '../data/dataStore';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLoader from './AppLoader';

const ALL_SYMPTOMS = [
  'headache', 'nausea', 'cramps', 'blurred vision', 'racing heart', 'brain fog', 'low appetite'
];

export default function SymptomsMood() {
  const { addLog } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [moodValue, setMoodValue] = useState(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [journal, setJournal] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sleepDuration, setSleepDuration] = useState('7h 30m');

  // Initialize journal with pain description if coming from Body Map
  useEffect(() => {
    if (location.state?.painDescription) {
      setJournal(location.state.painDescription);
    }
  }, [location.state]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Artificial 2-second delay for the loader
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Map mood value to a label
    let moodLabel = 'Stable';
    if (moodValue <= 2) moodLabel = 'Exhausted';
    else if (moodValue <= 4) moodLabel = 'Stressed';
    else if (moodValue <= 7) moodLabel = 'Stable';
    else moodLabel = 'Energized';

    const now = new Date();
    
    // Merge data from Body Map if it exists
    const newLog = {
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      mood: moodLabel as any,
      symptoms: selectedSymptoms,
      flaggedBodyParts: location.state?.flaggedBodyParts || [], 
      bodyMarkers: location.state?.bodyMarkers || [],
      sleepDuration: sleepDuration,
      journal: journal
    };

    try {
      await addLog(newLog);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // After saving a multi-step log, maybe go back to dashboard?
        if (location.state) {
          navigate('/dashboard');
        }
      }, 2000);
      
      // Reset form
      setSelectedSymptoms([]);
      setJournal('');
      setMoodValue(4);
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save entry:', error);
    }
  };

  return (
    <div className="space-y-10 mx-auto max-w-2xl px-6 pb-32">
      {isSaving && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <AppLoader />
          <p className="mt-4 font-bold text-primary animate-pulse">Saving your entry...</p>
        </div>
      )}
      {location.state?.flaggedBodyParts?.length > 0 && (
        <div className="bg-tertiary-container/30 border border-tertiary-container rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="material-symbols-outlined text-tertiary">body_system</span>
          <p className="text-sm text-on-tertiary-container">
            Continuing log for: <span className="font-bold">{location.state.flaggedBodyParts.join(', ')}</span>
          </p>
        </div>
      )}

      {/* Mood Slider Section */}
      <section className="relative group">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold tracking-tight">Current Mood</h3>
          <span className="text-primary font-bold text-sm tracking-widest uppercase">Select One</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-tertiary-container/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between mb-8">
            <div className="text-center">
              <span className="block text-3xl mb-1">😴</span>
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Exhausted</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl mb-1">⚡️</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Energized</span>
            </div>
          </div>
          <input 
            className="w-full h-3 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary border-none" 
            max="10" 
            min="1" 
            type="range" 
            value={moodValue}
            onChange={(e) => setMoodValue(parseInt(e.target.value))}
          />
          <div className="text-center mt-4 font-bold text-primary">
            {moodValue <= 2 ? 'Exhausted' : moodValue <= 4 ? 'Stressed' : moodValue <= 7 ? 'Stable' : 'Energized'}
          </div>
        </div>
      </section>

      {/* Symptoms Chip Group */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold tracking-tight">Any Symptoms?</h3>
          <span className="text-primary font-bold text-sm tracking-widest uppercase">Multi-Select</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {ALL_SYMPTOMS.map(symptom => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button 
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-5 py-3 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container'
                }`}
              >
                {symptom}
                {isSelected && <span className="material-symbols-outlined text-sm">close</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Free Text Journal */}
      <section className="relative">
        <h3 className="text-2xl font-bold tracking-tight mb-6">Anything else on your mind?</h3>
        <div className="relative">
          <textarea 
            className="w-full min-h-[160px] bg-surface-container-high rounded-lg p-6 border-none focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-outline/60 resize-none" 
            placeholder="Write how you're feeling today..."
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
          ></textarea>
          {/* Mascot Badge Integration */}
          <div className="absolute -right-2 -bottom-2 w-16 h-16 pointer-events-none opacity-40">
            <div className="w-full h-full bg-secondary-fixed rounded-full flex items-center justify-center overflow-hidden border border-secondary-fixed">
              <img 
                src="/DocDuck.png" 
                alt="DocDuck Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Save Entry Button */}
      <div className="flex justify-center pt-8">
        <button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-5 rounded-full text-lg shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {showSuccess ? (
            <>
              <span className="material-symbols-outlined">check_circle</span>
              Entry Saved
            </>
          ) : (
            'Save Entry'
          )}
        </button>
      </div>
    </div>
  );
}
