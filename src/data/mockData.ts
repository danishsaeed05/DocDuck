import { PatientData } from '../types';

export const initialPatientData: PatientData = {
  id: "CLI-209-88",
  name: "Maya Wayne",
  age: 15,
  dob: "02/14/2011",
  status: "Active",
  riskFlag: "Amber",
  biometrics: {
    heartRate: 72,
    heartRateSeries: [
      // OCT 22
      { date: "Oct 22, 2025", time: "00:00 AM", bpm: 60 },
      { date: "Oct 22, 2025", time: "02:00 AM", bpm: 58 },
      { date: "Oct 22, 2025", time: "04:00 AM", bpm: 62 },
      { date: "Oct 22, 2025", time: "06:00 AM", bpm: 65 },
      { date: "Oct 22, 2025", time: "08:00 AM", bpm: 70 },
      { date: "Oct 22, 2025", time: "10:00 AM", bpm: 75 },
      { date: "Oct 22, 2025", time: "12:00 PM", bpm: 78 },
      { date: "Oct 22, 2025", time: "02:00 PM", bpm: 82 },
      { date: "Oct 22, 2025", time: "04:00 PM", bpm: 80 },
      { date: "Oct 22, 2025", time: "06:00 PM", bpm: 78 },
      { date: "Oct 22, 2025", time: "08:00 PM", bpm: 75 },
      { date: "Oct 22, 2025", time: "10:00 PM", bpm: 88 }, // Spike around log-3
      { date: "Oct 22, 2025", time: "11:00 PM", bpm: 92 },

      // OCT 23
      { date: "Oct 23, 2025", time: "00:00 AM", bpm: 62 },
      { date: "Oct 23, 2025", time: "02:00 AM", bpm: 60 },
      { date: "Oct 23, 2025", time: "04:00 AM", bpm: 61 },
      { date: "Oct 23, 2025", time: "06:00 AM", bpm: 64 },
      { date: "Oct 23, 2025", time: "08:00 AM", bpm: 72 },
      { date: "Oct 23, 2025", time: "09:00 AM", bpm: 75 }, // log-2
      { date: "Oct 23, 2025", time: "10:00 AM", bpm: 78 },
      { date: "Oct 23, 2025", time: "12:00 PM", bpm: 80 },
      { date: "Oct 23, 2025", time: "02:00 PM", bpm: 85 },
      { date: "Oct 23, 2025", time: "04:00 PM", bpm: 82 },
      { date: "Oct 23, 2025", time: "06:00 PM", bpm: 79 },
      { date: "Oct 23, 2025", time: "08:00 PM", bpm: 76 },
      { date: "Oct 23, 2025", time: "10:00 PM", bpm: 74 },

      // OCT 24
      { date: "Oct 24, 2025", time: "00:00 AM", bpm: 62 },
      { date: "Oct 24, 2025", time: "02:00 AM", bpm: 58 },
      { date: "Oct 24, 2025", time: "04:00 AM", bpm: 61 },
      { date: "Oct 24, 2025", time: "06:00 AM", bpm: 68 },
      { date: "Oct 24, 2025", time: "08:00 AM", bpm: 115 }, // Spike around log-1
      { date: "Oct 24, 2025", time: "10:00 AM", bpm: 85 },
      { date: "Oct 24, 2025", time: "12:00 PM", bpm: 75 },
      { date: "Oct 24, 2025", time: "02:00 PM", bpm: 88 },
      { date: "Oct 24, 2025", time: "04:00 PM", bpm: 74 },
      { date: "Oct 24, 2025", time: "06:00 PM", bpm: 84 },
      { date: "Oct 24, 2025", time: "08:00 PM", bpm: 78 },
      { date: "Oct 24, 2025", time: "10:00 PM", bpm: 88 },
    ],
    sleepDuration: 4.2,
    sleepSeries: [
      { day: "Mon", hours: 8.5 },
      { day: "Tue", hours: 7.2 },
      { day: "Wed", hours: 6.8 },
      { day: "Thu", hours: 4.2 },
      { day: "Fri", hours: 5.5 },
      { day: "Sat", hours: 9.1 },
      { day: "Sun", hours: 8.8 },
    ],
    activityIndex: 88,
    lastSync: "12m ago"
  },
  logs: [
    {
      id: "log-1",
      date: "Oct 24, 2025",
      time: "08:00 AM", // Adjusted to match heartRateSeries
      mood: "Exhausted",
      symptoms: ["Headache", "Nausea", "Racing Heart"],
      flaggedBodyParts: ["Upper Chest", "Abdomen"],
      sleepDuration: "4h 12m",
      journalNote: "Woke up feeling very lightheaded. My chest felt tight like a band was around it. Tried to eat toast but felt too sick to finish. Spent most of the morning in the dark.",
      riskLevel: "High"
    },
    {
      id: "log-2",
      date: "Oct 23, 2025",
      time: "09:00 AM", // Adjusted to match heartRateSeries
      mood: "Energized",
      symptoms: ["Mild Fatigue"],
      flaggedBodyParts: [],
      sleepDuration: "8h 45m",
      journalNote: "Actually had a good night! Went to the park for a bit with my sister. My stomach felt fine all day today.",
      riskLevel: "Stable"
    },
    {
      id: "log-3",
      date: "Oct 22, 2025",
      time: "11:00 PM", // Adjusted to match heartRateSeries
      mood: "Moderate",
      symptoms: ["Headache", "Joint Pain"],
      flaggedBodyParts: ["Right Knee", "Left Shoulder"],
      sleepDuration: "6h 20m",
      journalNote: "Knee started acting up after walking to school. Headache is dull but annoying. Took some Tylenol at 4pm.",
      riskLevel: "Moderate"
    }
  ]
};
