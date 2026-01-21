import React, { useState, useMemo } from 'react'
import { useProgressLogs } from '../lib/hooks/useProgressLogs'
import { useAsyncAction } from '../lib/hooks/useAsyncAction'
import { ErrorMessage } from './ui/ErrorMessage'
import { LoadingSpinner } from './ui/LoadingSpinner'
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

export default function ProgressTracker() {
  const { logs, createLog, loading: logsLoading } = useProgressLogs()
  const { execute, loading, error, clearError } = useAsyncAction()
  
  const [showForm, setShowForm] = useState(false)
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

  // Prepare chart data for V-Taper ratio evolution
  // We filter out entries missing core V-Taper data to ensure accurate trend tracking
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const logData = {
      log_date: formData.log_date,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      shoulders: formData.shoulders ? parseFloat(formData.shoulders) : null,
      body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
      muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : null,
      chest: formData.chest ? parseFloat(formData.chest) : null,
      waist: formData.waist ? parseFloat(formData.waist) : null,
      hips: formData.hips ? parseFloat(formData.hips) : null,
      arms: formData.arms ? parseFloat(formData.arms) : null,
      thighs: formData.thighs ? parseFloat(formData.thighs) : null,
      notes: formData.notes || null
    }

    const result = await execute(async () => {
      await createLog(logData)
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

  if (logsLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Physique Analysis</h2>
          <p className="text-slate-400">Track your V-Taper evolution and key measurements.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          {showForm ? 'Cancel Entry' : '+ Log New Stats'}
        </button>
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
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Current</span>
                <p className="text-2xl font-black text-white">{latestRatio}</p>
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
                    y={1.618} 
                    stroke="#fbbf24" 
                    strokeDasharray="5 5" 
                    label={{ value: 'Golden Ratio (1.61)', position: 'insideBottomRight', fill: '#fbbf24', fontSize: 10, fontWeight: 'bold' }} 
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
                <p>Add 2+ entries to visualize your V-Taper curve.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights Card */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-300 font-bold uppercase text-xs tracking-widest mb-4">Why V-Taper?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              The ratio of shoulder circumference to waist circumference is a key metric in aesthetic bodybuilding. 
              <br/><br/>
              A target of <span className="text-white font-bold">1.50 - 1.61</span> creates the powerful "V" frame characteristic of a elite physique.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-indigo-500/10">
            <p className="text-xs text-indigo-400 font-medium italic">
              * Consistency in measurement locations is key for accurate tracking.
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Log Measurements</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">&times;</button>
          </div>
          {error && <ErrorMessage error={error} onDismiss={clearError} />}

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
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

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
              <h4 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2">
                📏 V-Taper Core Measurements (cm)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shoulders (cm) *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={formData.shoulders} 
                    onChange={(e) => setFormData({ ...formData, shoulders: e.target.value })} 
                    placeholder="0.0" 
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-indigo-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waist (cm) *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={formData.waist} 
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })} 
                    placeholder="0.0" 
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-indigo-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" 
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Optional Details (cm)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <input type="number" step="0.1" value={formData.chest} onChange={(e) => setFormData({ ...formData, chest: e.target.value })} placeholder="Chest" className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                <input type="number" step="0.1" value={formData.hips} onChange={(e) => setFormData({ ...formData, hips: e.target.value })} placeholder="Hips" className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                <input type="number" step="0.1" value={formData.arms} onChange={(e) => setFormData({ ...formData, arms: e.target.value })} placeholder="Arms" className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
                <input type="number" step="0.1" value={formData.thighs} onChange={(e) => setFormData({ ...formData, thighs: e.target.value })} placeholder="Thighs" className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white" />
              </div>
            </div>

            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              placeholder="How are you feeling? Note anything about your diet or recovery..." 
              rows={2} 
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" 
            />

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-500 disabled:opacity-50 font-black text-lg transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
              {loading ? <LoadingSpinner size="sm" /> : 'Confirm Log Entry'}
            </button>
          </form>
        </div>
      )}

      {/* Logs List Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white px-2">Log History</h3>
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
            <p className="text-slate-500 text-lg">No measurement logs found.</p>
          </div>
        ) : (
          logs.map((log) => {
            const ratio = calculateRatio(log.shoulders, log.waist);
            return (
              <div key={log.id} className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-md hover:border-indigo-500/50 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2.5 rounded-xl">
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
                  {log.weight && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 uppercase mb-1">Weight</span>
                      <span className="text-lg font-bold text-slate-100">{log.weight} lbs</span>
                    </div>
                  )}
                  {log.shoulders && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-400 uppercase mb-1">Shoulders</span>
                      <span className="text-lg font-bold text-white">{log.shoulders} cm</span>
                    </div>
                  )}
                  {log.waist && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-400 uppercase mb-1">Waist</span>
                      <span className="text-lg font-bold text-white">{log.waist} cm</span>
                    </div>
                  )}
                  {log.body_fat_percentage && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-400 uppercase mb-1">Body Fat</span>
                      <span className="text-lg font-bold text-white">{log.body_fat_percentage}%</span>
                    </div>
                  )}
                </div>

                {(log.chest || log.hips || log.arms || log.thighs) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 px-2">
                    {log.chest && <div className="text-sm text-slate-400"><span className="font-bold text-slate-600 mr-2">Chest:</span>{log.chest}cm</div>}
                    {log.hips && <div className="text-sm text-slate-400"><span className="font-bold text-slate-600 mr-2">Hips:</span>{log.hips}cm</div>}
                    {log.arms && <div className="text-sm text-slate-400"><span className="font-bold text-slate-600 mr-2">Arms:</span>{log.arms}cm</div>}
                    {log.thighs && <div className="text-sm text-slate-400"><span className="font-bold text-slate-600 mr-2">Thighs:</span>{log.thighs}cm</div>}
                  </div>
                )}

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
