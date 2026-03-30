export interface PatientLog {
  id: string;
  date: string;
  time: string;
  mood: 'Exhausted' | 'Energized' | 'Moderate' | 'Stressed' | 'Calm' | 'Stable';
  symptoms: string[];
  flaggedBodyParts?: string[];
  bodyMarkers?: {
    name: string;
    coords?: { x: number; y: number; z: number };
    position: string;
  }[];
  sleepDuration: string;
  journal?: string;
  journalNote?: string;
  riskLevel?: 'High' | 'Moderate' | 'Stable';
}

export interface HeartRatePoint {
  time: string; // e.g., "08:00 AM"
  bpm: number;
  date?: string; // e.g., "OCT 24"
}

export interface SleepPoint {
  day: string; // e.g., "Mon"
  hours: number;
}

export interface BiometricData {
  heartRate: number;
  heartRateSeries: HeartRatePoint[];
  sleepDuration: number;
  sleepSeries: SleepPoint[];
  activityIndex: number;
  lastSync: string;
}

export interface Message {
  id: string;
  sender: 'Doctor' | 'Patient';
  text: string;
  timestamp: string;
  isRead: boolean;
  type?: 'appointment' | 'general';
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  dob: string;
  status: 'Active' | 'Inactive';
  riskFlag: 'Amber' | 'Red' | 'Green';
  biometrics: BiometricData;
  logs: PatientLog[];
}
