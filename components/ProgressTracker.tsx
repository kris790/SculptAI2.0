
import React, { useState, useMemo } from 'react'
import { useProgressLogs } from '../lib/hooks/useProgressLogs'
import { useDummyData } from '../context/DummyDataContext'
import { useAsyncAction } from '../lib/hooks/useAsyncAction'
import { ErrorMessage } from './ui/ErrorMessage'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { progressLogSchema } from '../lib/validations'
import { PhysiqueAnalyzer } from './ai/PhysiqueAnalyzer'
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
  const { logs: realLogs, createLog, loading: logsLoading } = useProgressLogs()
  const { currentUser } = useDummyData();
  const { execute, loading, error, clearError } = useAsyncAction()
  
  const [showForm, setShowForm] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'in'>('in')
  
  // Demo mode prioritize dummy history
  const logs = realLogs.length > 3 ? realLogs : currentUser.measurements;

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    weight: '184.5',
    shoulders: '53.0',
    body_fat_percentage: '12.0',
    muscle_mass: '95',
    chest: '45',
    waist: '31.5',
    hips: '38.5',
    arms: '16.8',
    thighs: '24.5',
    notes: 'Pre-filled dummy progress note for aesthetic tracking.'
  })

  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({})

  const chartData = useMemo(() => {
    return [...logs]
      .filter(log => log.shoulders && log.waist)
      // Fix: Unify the date property as real logs use 'log_date' and dummy logs use 'date'
      .sort((a, b) => {
        const dateA = new Date((a as any).log_date || (a as any).date).getTime();
        const dateB = new Date((b as any).log_date || (b as any).date).getTime();
        return dateA - dateB;
      })
      .map(log => ({
        // Fix: Use unified date access for mapping to chart data
        date: new Date((log as any).log_date || (log as any).date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        ratio: Number((log.shoulders! / log.waist!).toFixed(2)),
        shoulders: unit === 'in' ? cmToIn(log.shoulders!) : log.shoulders,
        waist: unit === 'in' ? cmToIn(log.waist!) : log.waist,
      }));
  }, [logs, unit]);

  const latestStats = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

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

    await execute(async () => {
      await createLog(validation.data as any)
      setShowForm(false)
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {logsLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Sculpt Analytics</h2>
              <p className="text-slate-400">Precision tracking for your symmetry journey.</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {showForm ? 'Cancel Entry' : 'Log Measurements'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">V-Taper Index</p>
                  <h3 className="text-xl font-black text-white italic uppercase">Proportionality Trend</h3>
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
                      <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                        itemStyle={{ color: '#818cf8', fontWeight: 'bold', fontSize: '12px' }}
                      />
                      <ReferenceLine y={IDEAL_RATIO} stroke="#fbbf24" strokeDasharray="8 8" label={{ position: 'right', value: '1.50 TARGET', fill: '#fbbf24', fontSize: 8, fontWeight: 900 }} />
                      <Area type="monotone" dataKey="ratio" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRatio)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700/50">
                    <p className="font-bold uppercase tracking-widest text-xs">Waiting for data...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-6 shadow-xl">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Latest Scan</h4>
                  <div className="space-y-4">
                    <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">Symmetry Ratio</p>
                       <p className="text-4xl font-black text-white">{latestStats?.ratio || '--'}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">Shoulders</p>
                       <p className="text-xl font-black text-white">{latestStats?.shoulders || '--'} <span className="text-[10px] text-slate-500">{unit}</span></p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400 font-bold uppercase mb-1">Waist</p>
                       <p className="text-xl font-black text-white">{latestStats?.waist || '--'} <span className="text-[10px] text-slate-500">{unit}</span></p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📸</span>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">AI Physique Analysis</h3>
            </div>
            <PhysiqueAnalyzer />
          </section>

          {showForm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
                <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
                
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-8">New Log Entry</h3>
                
                {error && <ErrorMessage error={error} onDismiss={clearError} />}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Shoulders ({unit})</label>
                      <input 
                        type="number" step="0.1"
                        value={formData.shoulders} 
                        onChange={(e) => setFormData(p => ({...p, shoulders: e.target.value}))} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      {formValidationErrors.shoulders && <p className="text-red-400 text-[10px] mt-1">{formValidationErrors.shoulders}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Waist ({unit})</label>
                      <input 
                        type="number" step="0.1"
                        value={formData.waist} 
                        onChange={(e) => setFormData(p => ({...p, waist: e.target.value}))} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      {formValidationErrors.waist && <p className="text-red-400 text-[10px] mt-1">{formValidationErrors.waist}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Weight (lbs)</label>
                      <input 
                        type="number" step="0.1"
                        value={formData.weight} 
                        onChange={(e) => setFormData(p => ({...p, weight: e.target.value}))} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Body Fat %</label>
                      <input 
                        type="number" step="0.1"
                        value={formData.body_fat_percentage} 
                        onChange={(e) => setFormData(p => ({...p, body_fat_percentage: e.target.value}))} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-5 px-8 rounded-2xl hover:bg-indigo-500 disabled:opacity-50 font-black uppercase italic tracking-widest transition-all">
                    {loading ? <LoadingSpinner size="sm" /> : <>Finalize Entry</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
