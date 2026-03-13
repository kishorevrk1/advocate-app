export interface Profile {
  id: string
  email: string | null
  subscription_status: 'free' | 'pro'
  plan_type: 'free' | 'monthly' | 'annual'
  total_recovered: number
  created_at: string
}

export interface Case {
  id: string
  user_id: string
  category: 'deposit' | 'charges' | 'travel' | 'invoice' | 'product'
  description: string
  status: 'active' | 'resolved' | 'escalated'
  opponent_name: string | null
  amount_disputed: number | null
  state: string
  outcome: 'won' | 'lost' | 'pending' | null
  created_at: string
  resolved_at: string | null
}

export interface Document {
  id: string
  case_id: string
  type: 'letter' | 'script' | 'complaint'
  content: Record<string, any> | null
  pdf_url: string | null
  created_at: string
}

export interface EscalationStep {
  id: string
  case_id: string
  step_number: number
  action_type: string
  completed: boolean
  completed_at: string | null
  notes: string | null
}
