import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, Task } from '../types'
import { SEED_PROJECTS } from '../constants/seed-data'

interface ProjectStore {
  projects: Project[]
  addProject: (p: Project) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  addTask: (projectId: string, task: Task) => void
  updateTask: (projectId: string, taskId: string, patch: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: SEED_PROJECTS,

      addProject: (p) =>
        set((s) => ({ projects: [...s.projects, p] })),

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addTask: (projectId, task) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p
          ),
        })),

      updateTask: (projectId, taskId, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p
            return {
              ...p,
              tasks: p.tasks.map((t) => {
                if (t.id !== taskId) return t
                const updated = { ...t, ...patch }
                // 自動寫入 / 清除 completedAt
                if (patch.completed === true && !t.completed) {
                  updated.completedAt = new Date().toISOString().slice(0, 10)
                } else if (patch.completed === false) {
                  updated.completedAt = undefined
                }
                return updated
              }),
            }
          }),
        })),

      deleteTask: (projectId, taskId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
              : p
          ),
        })),
    }),
    { name: 'eewh-projects-v2' }
  )
)
