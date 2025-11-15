import React, { useState } from 'react'
import { useProgressLogs } from '../lib/hooks/useProgressLogs'
import { useAsyncAction } from '../lib/hooks/useAsyncAction'
import { ErrorMessage } from './ui/ErrorMessage'
import { LoadingSpinner } from './ui/LoadingSpinner'

export default function ProgressTracker() {
  const { logs, createLog, loading: logsLoading } = useProgressLogs()
  const { execute, loading, error, clearError } = useAsyncAction()
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const logData = {
      log_date: formData.log_date,
      weight: formData.weight ? parseFloat(formData.weight) : null,
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

  if (logsLoading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Progress Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Log Progress'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">New Progress Entry</h3>
          {error && <ErrorMessage error={error} onDismiss={clearError} />}

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
              <input
                type="date"
                value={formData.log_date}
                onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="Weight (kg)" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="number" step="0.1" value={formData.body_fat_percentage} onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })} placeholder="Body Fat %" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Measurements (cm)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <input type="number" step="0.1" value={formData.chest} onChange={(e) => setFormData({ ...formData, chest: e.target.value })} placeholder="Chest" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" step="0.1" value={formData.waist} onChange={(e) => setFormData({ ...formData, waist: e.target.value })} placeholder="Waist" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" step="0.1" value={formData.hips} onChange={(e) => setFormData({ ...formData, hips: e.target.value })} placeholder="Hips" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" step="0.1" value={formData.arms} onChange={(e) => setFormData({ ...formData, arms: e.target.value })} placeholder="Arms" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" step="0.1" value={formData.thighs} onChange={(e) => setFormData({ ...formData, thighs: e.target.value })} placeholder="Thighs" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Notes..." rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {loading ? <LoadingSpinner size="sm" /> : 'Save Progress'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400">No progress logs yet. Start tracking your journey!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{formatDate(log.log_date)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                {log.weight && <div><p className="text-sm text-gray-400">Weight</p><p className="text-lg font-semibold">{log.weight} kg</p></div>}
                {log.body_fat_percentage && <div><p className="text-sm text-gray-400">Body Fat</p><p className="text-lg font-semibold">{log.body_fat_percentage}%</p></div>}
                {log.muscle_mass && <div><p className="text-sm text-gray-400">Muscle Mass</p><p className="text-lg font-semibold">{log.muscle_mass} kg</p></div>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-gray-300">
                {log.chest && <div><span className="text-gray-500">Chest:</span> {log.chest}</div>}
                {log.waist && <div><span className="text-gray-500">Waist:</span> {log.waist}</div>}
                {log.hips && <div><span className="text-gray-500">Hips:</span> {log.hips}</div>}
                {log.arms && <div><span className="text-gray-500">Arms:</span> {log.arms}</div>}
                {log.thighs && <div><span className="text-gray-500">Thighs:</span> {log.thighs}</div>}
              </div>
              {log.notes && <p className="text-gray-300 text-sm mt-3 italic border-t border-gray-700 pt-3">{log.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}