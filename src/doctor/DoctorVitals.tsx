import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../data/dataStore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const DoctorVitals: React.FC = () => {
  const { patientData } = useData();
  const navigate = useNavigate();

  // Get unique dates from logs and heart rate series
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    patientData.logs.forEach(log => dates.add(log.date));
    patientData.biometrics.heartRateSeries.forEach(point => {
      if (point.date) dates.add(point.date);
    });
    
    return Array.from(dates).sort((a, b) => {
      // Robust date sorting
      const dateA = new Date(a).getTime();
      const dateB = new Date(b).getTime();
      
      // If parsing fails (e.g. "OCT 24" without year), fallback to simple comparison
      if (isNaN(dateA) || isNaN(dateB)) {
        return b.localeCompare(a);
      }
      return dateB - dateA; // Descending order (newest first)
    });
  }, [patientData]);

  const [selectedDate, setSelectedDate] = useState<string>('');

  // Sync selectedDate with availableDates
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Prepare Heart Rate data with log overlays for the selected date
  const hrData = useMemo(() => {
    return (patientData.biometrics?.heartRateSeries || [])
      .filter(point => !point.date || point.date === selectedDate)
      .map(point => {
        // Find if there's a log at this specific hour on the selected date
        const logAtTime = patientData.logs.find(log => log.time === point.time && log.date === selectedDate);
        return {
          ...point,
          log: logAtTime
        };
      });
  }, [patientData, selectedDate]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg max-w-[200px] cursor-pointer pointer-events-auto"
          onClick={() => {
            if (data.log) {
              navigate(`/doctor/logs?id=${data.log.id}`);
            } else {
              navigate('/doctor/logs');
            }
          }}
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{data.time}</p>
          <p className="text-lg font-black text-primary">{data.bpm} <span className="text-xs font-medium text-slate-400">BPM</span></p>
          {data.log && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[14px] text-error" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                <span className="text-[10px] font-bold text-error uppercase">Patient Log</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-tight italic line-clamp-2">
                "{data.log.journal || data.log.journalNote}"
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.log) {
      const isHighRisk = payload.log.riskLevel === 'High';
      return (
        <g 
          key={`dot-${payload.time}`} 
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/doctor/logs?id=${payload.log.id}`);
          }}
        >
          <circle 
            cx={cx} 
            cy={cy} 
            r={6} 
            fill={isHighRisk ? "#ff4d4d" : "#ff9800"} 
            stroke="#fff" 
            strokeWidth={2}
            className="animate-pulse"
          />
          <circle 
            cx={cx} 
            cy={cy} 
            r={10} 
            fill={isHighRisk ? "#ff4d4d" : "#ff9800"} 
            fillOpacity={0.2}
          />
        </g>
      );
    }
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill="#002d62" 
        stroke="#fff" 
        strokeWidth={1} 
        key={`dot-${payload.time}`} 
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          navigate('/doctor/logs');
        }}
      />
    );
  };

  const renderActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={7} 
        fill={payload.log ? (payload.log.riskLevel === 'High' ? "#ff4d4d" : "#ff9800") : "#002d62"}
        stroke="#fff"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          if (payload.log) {
            navigate(`/doctor/logs?id=${payload.log.id}`);
          } else {
            navigate('/doctor/logs');
          }
        }}
      />
    );
  };

  const activityData = [
    { name: 'Active', value: patientData.biometrics.activityIndex },
    { name: 'Remaining', value: 100 - patientData.biometrics.activityIndex },
  ];

  return (
    <div className="p-8 bg-surface space-y-8">
      {/* Patient Header Section */}
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-surface-container">
            <img 
              alt="Maya Wayne Patient Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd7h0o3Sggo9WVG3zwjSpsVdcZCw_Ehobm5Sjj3xe3JeDcUtpKxCAhGclnZxbIHL3pVVke8Nq357fyrcaHPFbj_6lL-qdZy4B2Qcx4bJBLoa9JUJMwa3H7k7d9DZm479SeB7rsVtZwLMHHlKM3r3z0ucOy3iVNWIU_tFDCBXaVBXf6oJrc4t16_movQOQ_uE8JagX-Ahw_2Hu-Rai6QaWrU2m5-mnbPoCVjb8kFyHu_9Q4tJ_I-Gl_PW-EUugHZoJ0-wBld2vJsMY" 
            />
          </div>
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-primary mb-1">{patientData.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-sm font-medium">
              <span>{patientData.age} years old</span>
              <span className="text-slate-300">|</span>
              <span>DOB: {patientData.dob}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold border border-secondary/20">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
            Consented to wearable data sharing
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-xs font-bold border border-tertiary/20">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>flag</span>
            Amber Alert: Recent Anomaly
          </div>
        </div>
      </section>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Secondary Sidebar: Patient List */}
        <div className="col-span-12 lg:col-span-3 bg-surface-container-low rounded-xl overflow-hidden self-stretch">
          <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center">
            <h3 className="font-headline font-bold text-sm text-primary uppercase">Current Ward</h3>
            <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary font-bold">12 Patients</span>
          </div>
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border-l-4 border-tertiary shadow-sm transition-all">
              <img 
                alt="Maya Wayne Small" 
                className="w-10 h-10 rounded-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd7h0o3Sggo9WVG3zwjSpsVdcZCw_Ehobm5Sjj3xe3JeDcUtpKxCAhGclnZxbIHL3pVVke8Nq357fyrcaHPFbj_6lL-qdZy4B2Qcx4bJBLoa9JUJMwa3H7k7d9DZm479SeB7rsVtZwLMHHlKM3r3z0ucOy3iVNWIU_tFDCBXaVBXf6oJrc4t16_movQOQ_uE8JagX-Ahw_2Hu-Rai6QaWrU2m5-mnbPoCVjb8kFyHu_9Q4tJ_I-Gl_PW-EUugHZoJ0-wBld2vJsMY" 
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{patientData.name}</p>
                <p className="text-[10px] text-tertiary font-bold">Anomaly Detected</p>
              </div>
              <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>priority_high</span>
            </div>
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heart Rate Chart */}
            <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-headline font-bold text-primary">Heart Rate Analysis</h4>
                  <p className="text-xs text-slate-500">
                    {selectedDate} | Avg: {Math.round(hrData.reduce((acc, curr) => acc + curr.bpm, 0) / (hrData.length || 1))} BPM
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Select Date:</span>
                    <select 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs font-bold text-primary outline-none focus:border-primary transition-all"
                    >
                      {availableDates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 border-l border-slate-100 pl-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Severe Log</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Moderate Log</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-80 w-full rounded-lg bg-surface-container-low/30 p-4 border border-outline-variant/15">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={hrData} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    style={{ cursor: 'pointer' }}
                    onClick={(data: any) => {
                      if (data && data.activePayload) {
                        const payload = data.activePayload[0].payload;
                        if (payload.log) {
                          navigate(`/doctor/logs?id=${payload.log.id}`);
                        } else {
                          navigate('/doctor/logs');
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      interval={2}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                      domain={[40, 130]}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      wrapperStyle={{ pointerEvents: 'auto' }}
                      isAnimationActive={false}
                      offset={10}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bpm" 
                      stroke="#002d62" 
                      strokeWidth={3} 
                      dot={renderCustomDot}
                      activeDot={renderActiveDot}
                      style={{ cursor: 'pointer' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep Duration Chart */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <h4 className="font-headline font-bold text-primary text-sm uppercase tracking-wide">Sleep Duration (7 Days)</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientData.biometrics.sleepSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0, 45, 98, 0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {patientData.biometrics.sleepSeries.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hours < 6 ? '#ff4d4d' : '#002d62'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Weekly Average</span>
                <span className="text-sm font-black text-primary">6.9 Hours</span>
              </div>
            </div>

            {/* Daily Activity */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <h4 className="font-headline font-bold text-primary text-sm uppercase tracking-wide">Daily Activity</h4>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-primary">{patientData.biometrics.activityIndex}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Goal Reached</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#002d62" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Steps</p>
                  <p className="text-sm font-black text-primary">8,432</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Calories</p>
                  <p className="text-sm font-black text-primary">420 kcal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVitals;
