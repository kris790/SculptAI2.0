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
} from 'recharts'

const IN_TO_CM = 2.54;
const IDEAL_RATIO = 1.5;

const cmToIn = (cm: number) => Number((cm / IN_TO_CM).toFixed(1));
const inToCm = (inch: number) => Number((inch * IN_TO_CM).toFixed(1));

export default function ProgressTracker() {
  const { logs, createLog, loading: logsLoading } = useProgressLogs()
  const { execute, loading, error, clearError } = useAsyncAction()
  
  const [showForm, setShowForm] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')
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

  // Prepare chart data for V-Taper ratio evolution
  const chartData = useMemo(() => {
    return [...logs]
      .filter(log => log.shoulders && log.waist)
      .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
      .map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        ratio: Number((log.shoulders! / log.waist!).toFixed(2)),
        weight: log.weight
      }));
  }, [logs]);

  const latestRatio = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1].ratio;
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
      muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : undefined,
      chest: processVal(formData.chest),
      waist: processVal(formData.waist),
      hips: processVal(formData.hips),
      arms: processVal(formData.arms),
      thighs: processVal(formData.thighs),
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  const calculateRatio = (shoulders: number | null, waist: number | null) => {
    if (!shoulders || !waist) return null;
    return (shoulders / waist).toFixed(2);
  };

  const displayVal = (cm: number | null | undefined) => {
    if (cm === null || cm === undefined) return '--';
    return unit === 'in' ? cmToIn(cm) : cm;
  };

  if (logsLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Physique Analytics</h2>
          <p className="text-slate-400">Precision monitoring for your aesthetic development.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            <button 
              onClick={() => handleUnitToggle('cm')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${unit === 'cm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Metric (cm)
            </button>
            <button 
              onClick={() => handleUnitToggle('in')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${unit === 'in' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Imperial (in)
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            {showForm ? 'Cancel Entry' : '+ Log New Data'}
          </button>
        </div>
      </div>

      {/* Visual Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">📈</span> V-Taper Ratio Trend
            </h3>
            {latestRatio && (
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-black tracking-widest">Current Ratio</span>
                <p className="text-2xl font-black text-indigo-400">{latestRatio}</p>
              </div>
            )}
          </div>
          
          <div className="h-[240px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[1.0, 2.0]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <ReferenceLine 
                    y={IDEAL_RATIO} 
                    stroke="#fbbf24" 
                    strokeDasharray="5 5" 
                    label={{ value: 'Ideal (1.50)', position: 'insideBottomRight', fill: '#fbbf24', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ratio" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#1e293b' }}
                    activeDot={{ r: 6, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                <p>Log 2+ entries to visualize your trajectory.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights Card */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-300 font-bold uppercase text-xs tracking-widest mb-4">Aesthetic Objective</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your V-Taper score is a unit-independent mathematical representation of your physical aesthetic. 
              <br/><br/>
              By minimizing the waist and maximizing shoulder width, you work toward the <span className="text-white font-bold">1.50+</span> competitive standard.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-indigo-500/10">
            <p className="text-xs text-indigo-400 font-medium italic">
              * Measurements should be taken at the peak of the shoulder and narrowest point of the waist.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700 animate-fade-in ring-1 ring-indigo-500/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Log Measurements</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">&times;</button>
          </div>
          {error && <ErrorMessage error={error} onDismiss={clearError} />}

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entry Date</label>
                <input
                  type="date"
                  value={formData.log_date}
                  onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (lbs)</label>
                <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0.0" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Body Fat %</label>
                <input type="number" step="0.1" value={formData.body_fat_percentage} onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })} placeholder="0.0" className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
              </div>
            </div>

            <div className="p-5 bg-indigo-500/5 border border-indigo-500/30 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-black text-indigo-400 flex items-center gap-2 tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  Core V-Taper Profile ({unit})
                </h4>
                {idealShoulderTarget && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded font-bold uppercase tracking-tighter">
                    Ideal Shoulders: {idealShoulderTarget} {unit}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Shoulders ({unit}) <span className="text-indigo-400 text-lg">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={formData.shoulders} 
                    onChange={(e) => setFormData({ ...formData, shoulders: e.target.value })} 
                    placeholder="Circumference" 
                    required
                    className={`w-full px-4 py-3 bg-slate-900 border ${formValidationErrors.shoulders ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-indigo-500/30'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-bold text-lg`} 
                  />
                  {formValidationErrors.shoulders && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase">{formValidationErrors.shoulders}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Waist ({unit}) <span className="text-indigo-400 text-lg">*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={formData.waist} 
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })} 
                    placeholder="Circumference" 
                    required
                    className={`w-full px-4 py-3 bg-slate-900 border ${formValidationErrors.waist ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-indigo-500/30'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-bold text-lg`} 
                  />
                  {formValidationErrors.waist && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase">{formValidationErrors.waist}</p>}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-[0.2em]">Auxiliary Measurements ({unit})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">Chest</span>
                   <input type="number" step="0.1" value={formData.chest} onChange={(e) => setFormData({ ...formData, chest: e.target.value })} placeholder="0.0" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">Hips</span>
                   <input type="number" step="0.1" value={formData.hips} onChange={(e) => setFormData({ ...formData, hips: e.target.value })} placeholder="0.0" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">Arms</span>
                   <input type="number" step="0.1" value={formData.arms} onChange={(e) => setFormData({ ...formData, arms: e.target.value })} placeholder="0.0" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-bold text-slate-600 uppercase">Thighs</span>
                   <input type="number" step="0.1" value={formData.thighs} onChange={(e) => setFormData({ ...formData, thighs: e.target.value })} placeholder="0.0" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm" />
                </div>
              </div>
            </div>

            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              placeholder="Session notes: dietary changes, recovery status, or workout emphasis..." 
              rows={2} 
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm" 
            />

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-500 disabled:opacity-50 font-black text-lg transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3">
              {loading ? <LoadingSpinner size="sm" /> : <>Log Physique Stats <span className="text-xl">💪</span></>}
            </button>
          </form>
        </div>
      )}

      {/* Logs List Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white px-2 mb-4">Historical Progression</h3>
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
            <p className="text-slate-500 text-lg">No measurement logs available. Start your tracking journey above.</p>
          </div>
        ) : (
          logs.map((log) => {
            const ratio = calculateRatio(log.shoulders, log.waist);
            return (
              <div key={log.id} className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-md hover:border-indigo-500/50 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2.5 rounded-xl group-hover:bg-indigo-600/20 transition-colors">
                        <span className="text-xl">📅</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{formatDate(log.log_date)}</h3>
                    </div>
                    {ratio && (
                        <div className="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">V-Taper Ratio</span>
                            <span className="text-xl text-white font-black">{ratio}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Weight</span>
                    <span className="text-lg font-bold text-slate-100">{log.weight || '--'} lbs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Shoulders</span>
                    <span className="text-lg font-bold text-white">{displayVal(log.shoulders)} {unit}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Waist</span>
                    <span className="text-lg font-bold text-white">{displayVal(log.waist)} {unit}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Body Fat</span>
                    <span className="text-lg font-bold text-white">{log.body_fat_percentage ? `${log.body_fat_percentage}%` : '--'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 px-2">
                  <div className="text-xs text-slate-400"><span className="font-bold text-slate-600 mr-2 uppercase">Chest:</span>{displayVal(log.chest)} {unit}</div>
                  <div className="text-xs text-slate-400"><span className="font-bold text-slate-600 mr-2 uppercase">Hips:</span>{displayVal(log.hips)} {unit}</div>
                  <div className="text-xs text-slate-400"><span className="font-bold text-slate-600 mr-2 uppercase">Arms:</span>{displayVal(log.arms)} {unit}</div>
                  <div className="text-xs text-slate-400"><span className="font-bold text-slate-600 mr-2 uppercase">Thighs:</span>{displayVal(log.thighs)} {unit}</div>
                </div>

                {log.notes && (
                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <p className="text-slate-400 text-sm italic leading-relaxed">
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