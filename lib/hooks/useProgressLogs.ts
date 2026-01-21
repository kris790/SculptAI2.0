
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import type { Database } from '../database.types'

type ProgressLog = Database['public']['Tables']['progress_logs']['Row']
type ProgressLogInsert = Database['public']['Tables']['progress_logs']['Insert']
type ProgressLogUpdate = Database['public']['Tables']['progress_logs']['Update']

const DUMMY_LOGS: ProgressLog[] = [
  {
    id: 'l-1', user_id: 'guest', log_date: new Date().toISOString(), weight: 182, shoulders: 126.5, waist: 78.5,
    body_fat_percentage: 10.5, muscle_mass: 94, chest: 110, hips: 92, arms: 41, thighs: 62, notes: 'Tightening up the midsection. Peak symmetry.', created_at: ''
  },
  {
    id: 'l-2', user_id: 'guest', log_date: new Date(Date.now() - 604800000).toISOString(), weight: 183.5, shoulders: 125, waist: 80,
    body_fat_percentage: 11.2, muscle_mass: 93, chest: 108, hips: 93, arms: 40.5, thighs: 61.5, notes: 'Focus on lateral head of the deltoids.', created_at: ''
  },
  {
    id: 'l-3', user_id: 'guest', log_date: new Date(Date.now() - 1209600000).toISOString(), weight: 185, shoulders: 124, waist: 82,
    body_fat_percentage: 12.0, muscle_mass: 92, chest: 107, hips: 94, arms: 40, thighs: 61, notes: 'Baseline at start of prep.', created_at: ''
  }
];

export function useProgressLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ProgressLog[]>(DUMMY_LOGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!user) {
        setLogs(DUMMY_LOGS);
        setLoading(false);
        return;
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })

      if (fetchError) throw fetchError
      const finalData = data && data.length > 0 ? data : DUMMY_LOGS;
      setLogs(finalData)
    } catch (err) {
      setLogs(DUMMY_LOGS);
      setError(err instanceof Error ? err : new Error('Failed to fetch progress logs'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchLogs();
  }, [user, fetchLogs])

  const createLog = async (logData: Omit<ProgressLogInsert, 'id' | 'user_id'>) => {
    if (!user) {
      const newLog: ProgressLog = {
        ...logData,
        id: Math.random().toString(),
        user_id: 'guest',
        weight: logData.weight ?? null,
        body_fat_percentage: logData.body_fat_percentage ?? null,
        muscle_mass: logData.muscle_mass ?? null,
        chest: logData.chest ?? null,
        shoulders: logData.shoulders ?? null,
        waist: logData.waist ?? null,
        hips: logData.hips ?? null,
        arms: logData.arms ?? null,
        thighs: logData.thighs ?? null,
        notes: logData.notes ?? null,
        created_at: new Date().toISOString()
      };
      setLogs(prev => [newLog, ...prev]);
      return newLog;
    }

    const logToInsert: ProgressLogInsert = {
      ...logData,
      user_id: user.id,
      weight: logData.weight ?? null,
      body_fat_percentage: logData.body_fat_percentage ?? null,
      muscle_mass: logData.muscle_mass ?? null,
      chest: logData.chest ?? null,
      waist: logData.waist ?? null,
      hips: logData.hips ?? null,
      arms: logData.arms ?? null,
      thighs: logData.thighs ?? null,
      notes: logData.notes ?? null,
    };

    const { data, error } = await supabase
      .from('progress_logs')
      .insert(logToInsert)
      .select()
      .single()

    if (error) throw error
    await fetchLogs()
    return data
  }

  const updateLog = async (logId: string, updates: ProgressLogUpdate) => {
    if (!user) return;
    const { error } = await supabase
      .from('progress_logs')
      .update(updates)
      .eq('id', logId)

    if (error) throw error
    await fetchLogs()
  }

  const deleteLog = async (logId: string) => {
    if (!user) {
      setLogs(prev => prev.filter(l => l.id !== logId));
      return;
    }
    const { error } = await supabase
      .from('progress_logs')
      .delete()
      .eq('id', logId)

    if (error) throw error
    await fetchLogs()
  }

  return {
    logs,
    loading,
    error,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog
  }
}
