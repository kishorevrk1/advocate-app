import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  hasSeenOnboarding: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setHasSeenOnboarding: (seen: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  hasSeenOnboarding: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isLoading: false }),
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, hasSeenOnboarding: false })
  },
}))
