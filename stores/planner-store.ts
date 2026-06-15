import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface PlannerTask {
  id: string
  title: string
  description?: string
  due_date: string // YYYY-MM-DD
  is_completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'appointment' | 'follow-up' | 'research' | 'personal' | 'general'
  milestone_id?: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  category: 'clinical' | 'career' | 'practice'
  status: 'todo' | 'in_progress' | 'achieved'
  target_date?: string
}

interface PlannerState {
  tasks: PlannerTask[]
  milestones: Milestone[]
  isLoading: boolean
  fetchTasks: () => Promise<void>
  fetchMilestones: () => Promise<void>
  addTask: (task: Omit<PlannerTask, 'id' | 'is_completed'>) => Promise<PlannerTask | null>
  toggleTask: (id: string, currentStatus: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  rescheduleTasksByDate: (fromDate: string, toDate: string) => Promise<number>
  deleteTasksByDate: (date: string) => Promise<number>
  addMilestone: (milestone: Omit<Milestone, 'id' | 'status'>) => Promise<Milestone | null>
  updateMilestoneStatus: (id: string, status: Milestone['status']) => Promise<void>
  deleteMilestone: (id: string) => Promise<void>
}


export const usePlannerStore = create<PlannerState>((set, get) => {
  const supabase = createClient()

  return {
    tasks: [],
    milestones: [],
    isLoading: false,

    fetchTasks: async () => {
      set({ isLoading: true })
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          set({ isLoading: false })
          return
        }

        const { data, error } = await (supabase as any)
          .from('planner_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true })

        if (error) throw error
        // alert('Fetched ' + (data?.length || 0) + ' tasks from DB')
        set({ tasks: data || [], isLoading: false })
      } catch (err: any) {
        console.error('Error fetching planner tasks:', err)
        alert('Failed to fetch tasks: ' + (err.message || 'Unknown error'))
        set({ isLoading: false })
      }
    },

    fetchMilestones: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await (supabase as any)
          .from('milestones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        set({ milestones: data || [] })
      } catch (err: any) {
        console.error('Error fetching milestones:', err)
      }
    },

    addTask: async (task) => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await (supabase as any)
          .from('planner_tasks')
          .insert({
            user_id: user.id,
            title: task.title,
            description: task.description,
            due_date: task.due_date ? task.due_date : null,
            priority: task.priority,
            category: task.category,
            is_completed: false,
            milestone_id: task.milestone_id,
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          set((state) => ({
            tasks: [...state.tasks, data],
          }))
          return data as PlannerTask
        }
        return null
      } catch (err: any) {
        console.error('Error adding planner task:', err)
        return null
      }
    },

    toggleTask: async (id, currentStatus) => {
      // Optimistic update
      const originalTasks = get().tasks
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, is_completed: !currentStatus } : t
        ),
      }))

      try {
        const { error } = await (supabase as any)
          .from('planner_tasks')
          .update({ is_completed: !currentStatus })
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Error toggling planner task:', err)
        // Rollback on error
        set({ tasks: originalTasks })
      }
    },

    deleteTask: async (id) => {
      // Optimistic update
      const originalTasks = get().tasks
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }))

      try {
        const { error } = await (supabase as any)
          .from('planner_tasks')
          .delete()
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Error deleting planner task:', err)
        // Rollback on error
        set({ tasks: originalTasks })
      }
    },

    rescheduleTasksByDate: async (fromDate, toDate) => {
      const tasksToMove = get().tasks.filter(
        (t) => t.due_date && t.due_date.startsWith(fromDate)
      )
      if (tasksToMove.length === 0) return 0

      // Optimistic update
      const originalTasks = get().tasks
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.due_date && t.due_date.startsWith(fromDate)
            ? { ...t, due_date: toDate }
            : t
        ),
      }))

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          set({ tasks: originalTasks })
          return 0
        }

        const { error } = await (supabase as any)
          .from('planner_tasks')
          .update({ due_date: toDate })
          .eq('user_id', user.id)
          .like('due_date', `${fromDate}%`)

        if (error) throw error
        return tasksToMove.length
      } catch (err) {
        console.error('Error rescheduling tasks:', err)
        set({ tasks: originalTasks })
        return 0
      }
    },

    deleteTasksByDate: async (date) => {
      const tasksToDelete = get().tasks.filter(
        (t) => t.due_date && t.due_date.startsWith(date)
      )
      if (tasksToDelete.length === 0) return 0

      // Optimistic update
      const originalTasks = get().tasks
      set((state) => ({
        tasks: state.tasks.filter(
          (t) => !(t.due_date && t.due_date.startsWith(date))
        ),
      }))

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          set({ tasks: originalTasks })
          return 0
        }

        const { error } = await (supabase as any)
          .from('planner_tasks')
          .delete()
          .eq('user_id', user.id)
          .like('due_date', `${date}%`)

        if (error) throw error
        return tasksToDelete.length
      } catch (err) {
        console.error('Error deleting tasks by date:', err)
        set({ tasks: originalTasks })
        return 0
      }
    },

    addMilestone: async (milestone) => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await (supabase as any)
          .from('milestones')
          .insert({
            user_id: user.id,
            title: milestone.title,
            description: milestone.description,
            category: milestone.category,
            target_date: milestone.target_date,
            status: 'todo',
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          set((state) => ({
            milestones: [data, ...state.milestones],
          }))
          return data as Milestone
        }
        return null
      } catch (err: any) {
        console.error('Error adding milestone:', err)
        return null
      }
    },

    updateMilestoneStatus: async (id, status) => {
      const originalMilestones = get().milestones
      set((state) => ({
        milestones: state.milestones.map((m) =>
          m.id === id ? { ...m, status } : m
        ),
      }))

      try {
        const { error } = await (supabase as any)
          .from('milestones')
          .update({ status })
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Error updating milestone status:', err)
        set({ milestones: originalMilestones })
      }
    },

    deleteMilestone: async (id) => {
      const originalMilestones = get().milestones
      set((state) => ({
        milestones: state.milestones.filter((m) => m.id !== id),
      }))

      try {
        const { error } = await (supabase as any)
          .from('milestones')
          .delete()
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Error deleting milestone:', err)
        set({ milestones: originalMilestones })
      }
    },
  }
})
