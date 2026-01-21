
import React, { useState, useMemo } from 'react'
import { useProgressLogs } from '../lib/hooks/useProgressLogs'
import { useAsyncAction } from '../lib/hooks/useAsyncAction'
import { ErrorMessage } from './ui/ErrorMessage'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { progressLogSchema } from '../lib/validations'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts'

const IN_TO_CM = 2.54;
const IDEAL_RATIO = 1.5;

const cmToIn = (cm: number) => Number((cm / IN_TO_CM).toFixed(1));
const inToCm = (inch: number) => Number((inch * IN_TO_CM).toFixed(1));

export default function ProgressTracker() {
  const { logs, createLog, loading: logsLoading } = useProgressLogs()
  const { execute, loading, error, clearError } = useAsyncAction()
  
  const [showForm, setShowForm] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'in'>('in') // Default to inches for US competitors
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    weight: '',
    shoulders: '',
    body_fat_percentage: '',
    muscle_mass: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: ''
  })

  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({})

  const chartData = useMemo(() => {
    return [...logs]
      .filter(log => log.shoulders && log.waist)
      .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
      .map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        ratio: Number((log.shoulders! / log.waist!).toFixed(2)),
        shoulders: unit === 'in' ? cmToIn(log.shoulders!) : log.shoulders,
        waist: unit === 'in' ? cmToIn(log.waist!) : log.waist,
      }));
  }, [logs, unit]);

  const latestStats = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

  const idealShoulderTarget = useMemo(() => {
    const waistNum = parseFloat(formData.waist);
    if (isNaN(waistNum)) return null;
    return (waistNum * IDEAL_RATIO).toFixed(1);
  }, [formData.waist]);

  const handleUnitToggle = (newUnit: 'cm' | 'in') => {
    if (newUnit === unit) return;
    const convert = (val: string) => {
      if (!val) return '';
      const num = parseFloat(val);
      if (isNaN(num)) return val;
      return newUnit === 'in' ? cmToIn(num).toString() : inToCm(num).toString();
    };
    setFormData(prev => ({
      ...prev,
      shoulders: convert(prev.shoulders),
      waist: convert(prev.waist),
      chest: convert(prev.chest),
      hips: convert(prev.hips),
      arms: convert(prev.arms),
      thighs: convert(prev.thighs)
    }));
    setUnit(newUnit);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFormValidationErrors({})

    const processVal = (val: string) => {
      if (!val) return undefined;
      const num = parseFloat(val);
      if (isNaN(num)) return undefined;
      return unit === 'in' ? inToCm(num) : num;
    };

    const rawData = {
      log_date: formData.log_date,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      shoulders: processVal(formData.shoulders),
      body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : undefined,
      waist: processVal(formData.waist),
      notes: formData.notes || undefined
    }

    const validation = progressLogSchema.safeParse(rawData)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        const path = issue.path[0]?.toString() || 'general';
        errors[path] = issue.message;
      })
      setFormValidationErrors(errors)
      return
    }

    const result = await execute(async () => {
      await createLog(validation.data as any)
    })

    if (result !== null) {
      setShowForm(false)
      setFormData({
        log_date: new Date().toISOString().split('T')[0],
        weight: '',
        shoulders: '',
        body_fat_percentage: '',
        muscle_mass: '',
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: '',
        notes: ''
      })
    }
  }

  const displayVal = (cm: number | null | undefined) => {
    if (cm === null || cm === undefined) return '--';
    return unit === 'in' ? cmToIn(cm) : cm;
  };

  if (logsLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Ratio Analytics</h2>
          <p className="text-slate-400">Achieving the 1.50 competitive standard.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          {showForm ? 'Cancel Entry' : 'Log Measurements'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Ratio Trajectory</p>
              <h3 className="text-xl font-black text-white italic uppercase">Historical V-Taper</h3>
            </div>
            <div className="flex gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
               <button onClick={() => handleUnitToggle('in')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${unit === 'in' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>IN</button>
               <button onClick={() => handleUnitToggle('cm')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${unit === 'cm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>CM</button>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[1.1, 1.7]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <ReferenceLine 
                    y={IDEAL_RATIO} 
                    stroke="#fbbf24" 
                    strokeDasharray="8 8" 
                    label={{ value: 'Pro Standard (1.50)', position: 'insideBottomRight', fill: '#fbbf24', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em' }} 
                  />
                  <Area type="monotone" dataKey="ratio" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRatio)" />
                  <Line type="monotone" dataKey="ratio" stroke="#818cf8" strokeWidth={0} dot={{ fill: '#818cf8', r: 4 }} activeDot={{ r: 6, fill: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700/50">
                <p className="font-bold uppercase tracking-widest text-xs">Awaiting competition data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-6 shadow-xl">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Metric Focus</h4>
              <div className="space-y-4">
                <div>
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Shoulders</p>
                   <p className="text-2xl font-black text-white">{latestStats?.shoulders || '--'} <span className="text-xs text-slate-500">{unit}</span></p>
                </div>
                <div>
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Waist</p>
                   <p className="text-2xl font-black text-white">{latestStats?.waist || '--'} <span className="text-xs text-slate-500">{unit}</span></p>
                </div>
              </div>
           </div>

           <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Aesthetic Rule</h4>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Width is built in the gym, taper is revealed in the kitchen."
              </p>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-[10px] font-black text-amber-500 uppercase">Target Ratio: 1.50</p>
              </div>
           </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 mb-6 border border-slate-700 animate-fade-in ring-2 ring-indigo-500/20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Entry Verification</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors text-3xl leading-none">&times;</button>
          </div>
          
          {error && <ErrorMessage error={error} onDismiss={clearError} />}

          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Date</label>
                <input type="date" value={formData.log_date} onChange={(e) => setFormData({ ...formData, log_date: e.target.value })} required className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight (lbs)</label>
                <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0.0" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Body Fat %</label>
                <input type="number" step="0.1" value={formData.body_fat_percentage} onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })} placeholder="0.0" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white font-bold" />
              </div>
            </div>

            <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Shoulder Circumference ({unit})</label>
                    {idealShoulderTarget && (
                       <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase">Target: {idealShoulderTarget}</span>
                    )}
                  </div>
                  <input 
                    type="number" step="0.1" value={formData.shoulders} 
                    onChange={(e) => setFormData({ ...formData, shoulders: e.target.value })} 
                    placeholder="0.0" required
                    className={`w-full px-6 py-4 bg-slate-950 border ${formValidationErrors.shoulders ? 'border-red-500' : 'border-indigo-500/50'} rounded-2xl text-4xl font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center`} 
                  />
                  {formValidationErrors.shoulders && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{formValidationErrors.shoulders}</p>}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Waist Circumference ({unit})</label>
                  <input 
                    type="number" step="0.1" value={formData.waist} 
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })} 
                    placeholder="0.0" required
                    className={`w-full px-6 py-4 bg-slate-950 border ${formValidationErrors.waist ? 'border-red-500' : 'border-indigo-500/50'} rounded-2xl text-4xl font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center`} 
                  />
                  {formValidationErrors.waist && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{formValidationErrors.waist}</p>}
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-5 px-8 rounded-2xl hover:bg-indigo-500 disabled:opacity-50 font-black text-xl uppercase italic tracking-widest transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center gap-4">
              {loading ? <LoadingSpinner size="sm" /> : <>Finalize Entry <span className="text-2xl">🔥</span></>}
            </button>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-6">Historical Progression</h3>
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700/50">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No data recorded.</p>
          </div>
        ) : (
          logs.map((log) => {
            const ratio = log.shoulders && log.waist ? (log.shoulders / log.waist).toFixed(2) : null;
            return (
              <div key={log.id} className="group bg-slate-800/50 border border-slate-700 rounded-3xl p-6 shadow-lg hover:border-indigo-500/50 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-700/50 p-3 rounded-2xl">
                        <span className="text-xl">📊</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white italic">{new Date(log.log_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validated Session</p>
                      </div>
                    </div>
                    
                    {ratio && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ratio</p>
                                <p className="text-2xl font-black text-indigo-400">{ratio}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-700"></div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Weight</p>
                                <p className="text-2xl font-black text-white">{log.weight || '--'} <span className="text-xs text-slate-500">lbs</span></p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase">Shoulders</p>
                      <p className="text-xl font-black text-white">{displayVal(log.shoulders)} {unit}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase">Waist</p>
                      <p className="text-xl font-black text-white">{displayVal(log.waist)} {unit}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase">Body Fat</p>
                      <p className="text-xl font-black text-emerald-400">{log.body_fat_percentage ? `${log.body_fat_percentage}%` : '--'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase">Delta</p>
                      <p className="text-xl font-black text-indigo-400">+{((log.shoulders || 0) - (log.waist || 0)).toFixed(1)} <span className="text-xs text-slate-600">cm</span></p>
                   </div>
                </div>

                {log.notes && (
                  <div className="mt-6 pt-4 border-t border-slate-700/30">
                    <p className="text-slate-400 text-xs italic font-medium leading-relaxed">
                      "{log.notes}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
