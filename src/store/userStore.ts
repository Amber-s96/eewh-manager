import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkLog } from '../types'

interface UserStore {
  currentUserId: string
  setCurrentUserId: (id: string) => void
  workLogs: WorkLog[]
  addWorkLog: (log: WorkLog) => void
  clearWorkLogs: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUserId: 'u1',
      setCurrentUserId: (id) => set({ currentUserId: id }),
      workLogs: [],
      addWorkLog: (log) => set((s) => ({ workLogs: [log, ...s.workLogs] })),
      clearWorkLogs: () => set({ workLogs: [] }),
    }),
    { name: 'eewh-current-user-v2' }
  )
)
