import React, { createContext, useContext, useState, useEffect } from 'react';
import { PatientData, PatientLog, Message } from '../types';
import { initialPatientData } from './mockData';
import { toast } from 'sonner';

interface DataContextType {
  patientData: PatientData;
  messages: Message[];
  addLog: (log: Omit<PatientLog, 'id'>) => Promise<void>;
  sendMessage: (text: string, type?: 'appointment' | 'general') => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
  confirmAppointment: (messageId: string) => Promise<void>;
  clearLogs: () => void;
  isWsConnected: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const processedIds = React.useRef<Set<string>>(new Set());
  const processedMessageIds = React.useRef<Set<string>>(new Set());
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [patientData, setPatientData] = useState<PatientData>(() => {
    const saved = localStorage.getItem('maya_wayne_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge or at least ensure biometrics exists
        return {
          ...initialPatientData,
          ...parsed,
          biometrics: {
            ...initialPatientData.biometrics,
            ...(parsed.biometrics || {})
          }
        };
      } catch (e) {
        console.error('Error parsing saved data:', e);
        return initialPatientData;
      }
    }
    return initialPatientData;
  });

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/get-logs');
      if (response.ok) {
        const serverLogs = await response.json();
        if (Array.isArray(serverLogs) && serverLogs.length > 0) {
          setPatientData(prev => ({
            ...prev,
            logs: serverLogs
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching logs from server:', error);
    }
  };

  const fetchHR = async () => {
    try {
      const response = await fetch('/api/get-heart-rate');
      if (response.ok) {
        const serverHR = await response.json();
        if (Array.isArray(serverHR) && serverHR.length > 0) {
          setPatientData(prev => ({
            ...prev,
            biometrics: {
              ...prev.biometrics,
              heartRateSeries: serverHR
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching HR from server:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/get-messages');
      if (response.ok) {
        const serverMessages = await response.json();
        setMessages(serverMessages);
      }
    } catch (error) {
      console.error('Error fetching messages from server:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchHR();
    fetchMessages();

    // WebSocket for real-time updates with reconnection logic
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws-api`;
      console.log('Connecting to WebSocket API:', wsUrl);
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsWsConnected(true);
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setIsWsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting in 3s...');
        setIsWsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          if (message.type === 'NEW_LOG') {
            const newLog = message.data;
            
            // Deduplication check using Ref to prevent double-toasting in same session
            if (processedIds.current.has(newLog.id)) return;
            processedIds.current.add(newLog.id);

            // Visual and Auditory Alerts - ONLY on Doctor Portal
            const isDoctorPortal = window.location.pathname.startsWith('/doctor');
            const isHighRisk = newLog.riskLevel === 'High';
            
            if (isDoctorPortal) {
              console.log(`Processing new log for Doctor Portal. Risk Level: ${newLog.riskLevel}, Is High Risk: ${isHighRisk}`);

              const toastOptions = {
                id: newLog.id,
                description: `Severe entry: "${newLog.journal || newLog.journalNote || 'No note'}"`,
                duration: 10000,
                action: {
                  label: 'View Log',
                  onClick: () => {
                    window.location.href = `/doctor/logs?id=${newLog.id}`;
                  }
                }
              };

              if (isHighRisk) {
                toast.error('EMERGENCY ALERT', toastOptions);
                
                console.log('Attempting to play EMERGENCY siren...');
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
                audio.volume = 0.8;
                audio.play().catch(e => console.warn('Emergency audio blocked:', e));
              } else {
                toast.info('New Patient Log', {
                  ...toastOptions,
                  description: 'A new log entry has been received.',
                  duration: 5000,
                });
                
                console.log('Attempting to play chime...');
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.4;
                audio.play().catch(e => console.warn('Chime audio blocked:', e));
              }
            } else {
              console.log('New log received but suppressed (not on Doctor Portal)');
            }

            setPatientData(prev => {
              if (prev.logs.some(log => log.id === newLog.id)) return prev;
              return {
                ...prev,
                logs: [newLog, ...prev.logs]
              };
            });
          } else if (message.type === 'LOGS_UPDATED') {
            const updatedLogs = message.data;
            console.log('Logs updated from server:', updatedLogs);
            setPatientData(prev => ({
              ...prev,
              logs: updatedLogs
            }));
          } else if (message.type === 'HR_UPDATED') {
            const updatedHR = message.data;
            console.log('Heart rate updated from server:', updatedHR);
            setPatientData(prev => ({
              ...prev,
              biometrics: {
                ...prev.biometrics,
                heartRateSeries: updatedHR
              }
            }));
          } else if (message.type === 'NEW_MESSAGE') {
            const newMessage = message.data;
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
            
            // Notification for patient portal
            const isPatientPortal = !window.location.pathname.startsWith('/doctor');
            if (isPatientPortal && newMessage.sender === 'Doctor') {
              if (!processedMessageIds.current.has(newMessage.id)) {
                processedMessageIds.current.add(newMessage.id);
                toast.info('New Message from Doctor', {
                  description: newMessage.text,
                  duration: 5000,
                });
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.4;
                audio.play().catch(e => console.warn('Chime audio blocked:', e));
              }
            }
          } else if (message.type === 'MESSAGES_READ') {
            setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
          } else if (message.type === 'APPOINTMENT_CONFIRMED') {
            const { messageId } = message.data;
            setMessages(prev => prev.map(m => 
              m.id === messageId ? { ...m, isConfirmed: true } : m
            ));
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('maya_wayne_data', JSON.stringify(patientData));
  }, [patientData]);

  const isSevere = (text: string | undefined): boolean => {
    if (!text) return false;
    const severeWords = ['dying', 'kill', 'suicide', 'death', 'emergency', 'severe', 'unbearable', 'help', 'hospital'];
    const lowerText = text.toLowerCase();
    return severeWords.some(word => lowerText.includes(word));
  };

  const addLog = async (log: Omit<PatientLog, 'id'>) => {
    const journalText = log.journal || log.journalNote;
    const riskLevel = isSevere(journalText) ? 'High' : 'Stable';
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newLog: PatientLog = {
      ...log,
      id: `log-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      riskLevel
    };
    
    // Generate a full 24-hour heart rate series for this date
    const baselinePoints = [
      "12:00 AM", "02:00 AM", "04:00 AM", "06:00 AM", "08:00 AM", "10:00 AM", 
      "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM", "10:00 PM"
    ].map(time => ({
      time,
      bpm: 70 + Math.floor(Math.random() * 10), // Random baseline 70-80
      date: dateStr
    }));

    // Add the actual log point as a peak if high risk
    const logPoint = {
      time: timeStr,
      bpm: riskLevel === 'High' ? 135 : 72,
      date: dateStr
    };

    const newHRSeries = [...baselinePoints, logPoint];

    // Update local state
    setPatientData(prev => {
      const updatedLogs = [newLog, ...prev.logs];
      const updatedHeartRateSeries = [...prev.biometrics.heartRateSeries, ...newHRSeries];
      
      return {
        ...prev,
        logs: updatedLogs,
        biometrics: {
          ...prev.biometrics,
          heartRate: logPoint.bpm,
          heartRateSeries: updatedHeartRateSeries,
          lastSync: 'Just now'
        }
      };
    });

    // Save to server-side JSON files
    try {
      // Save log
      await fetch('/api/save-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      
      // Save heart rate series
      await fetch('/api/save-heart-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHRSeries),
      });
    } catch (error) {
      console.error('Error saving data to server:', error);
    }
  };

  const clearLogs = () => {
    setPatientData(prev => ({
      ...prev,
      logs: []
    }));
  };

  const sendMessage = async (text: string, type: 'appointment' | 'general' = 'general') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'Doctor',
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      if (!response.ok) throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const response = await fetch('/api/mark-messages-read', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to mark messages as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const confirmAppointment = async (messageId: string) => {
    try {
      const response = await fetch('/api/confirm-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      if (!response.ok) throw new Error('Failed to confirm appointment');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Failed to confirm appointment');
    }
  };

  return (
    <DataContext.Provider value={{ 
      patientData, 
      messages, 
      addLog, 
      sendMessage, 
      markMessagesAsRead, 
      confirmAppointment,
      clearLogs, 
      isWsConnected 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
