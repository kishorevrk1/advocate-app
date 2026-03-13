import axios from 'axios'
import { supabase } from '../lib/supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const analyzeCase = async (caseData: {
  category: string
  description: string
  state: string
  opponentName?: string
  amountDisputed?: number
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  const response = await axios.post(`${API_URL}/api/generate/analyze`, {
    ...caseData,
    userName: user?.email?.split('@')[0] || 'User',
  })
  return response.data.analysis
}

export const saveCase = async (caseData: any) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('cases')
    .insert({ ...caseData, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const saveDocument = async (caseId: string, type: string, content: any) => {
  const { data, error } = await supabase
    .from('documents')
    .insert({ case_id: caseId, type, content })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserCases = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('cases')
    .select('*, documents(*), escalation_steps(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const updateCase = async (caseId: string, updates: any) => {
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const saveEscalationStep = async (caseId: string, step: {
  step_number: number
  action_type: string
}) => {
  const { data, error } = await supabase
    .from('escalation_steps')
    .insert({ case_id: caseId, ...step })
    .select()
    .single()
  if (error) throw error
  return data
}

export const completeEscalationStep = async (stepId: string, notes?: string) => {
  const { data, error } = await supabase
    .from('escalation_steps')
    .update({ completed: true, completed_at: new Date().toISOString(), notes })
    .eq('id', stepId)
    .select()
    .single()
  if (error) throw error
  return data
}
