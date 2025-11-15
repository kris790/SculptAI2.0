import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import type { Database } from '../database.types'

type ProgressLog = Database['public']['Tables']['progress_logs']['Row']
type ProgressLogInsert = Database['public']['Tables']['progress_logs']['Insert']
type ProgressLogUpdate = Database['public']['Tables']['progress_logs']['Update']

export function useProgressLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ProgressLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!user) {
        setLogs([]);
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
      setLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch progress logs'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
        fetchLogs();
    } else {
        setLoading(false);
        setLogs([]);
    }
  }, [user, fetchLogs])

  const createLog = async (logData: Omit<ProgressLogInsert, 'id' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')

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
    const { error } = await supabase
      .from('progress_logs')
      .update(updates)
      .eq('id', logId)

    if (error) throw error
    await fetchLogs()
  }

  const deleteLog = async (logId: string) => {
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