
// stores/usePlanScheduleStore.ts
import { create } from 'zustand';
import config from '@/config/config';
import { toast } from 'sonner';
import type { Exercise } from '@/lib/types';

type SessionView = {
  sessionId: string;
  title: string;
  isComplete?: boolean;
  totalExercises: number;
  completedExercises?: number;
  exercises: Exercise[];
};

type DayView = { day: number; sessions: SessionView[] };
type WeekView = { weekName: string | undefined, week: number; days: DayView[] };

type PlanHeader = { _id: string; name: string; phase?: string | null };

type PlanSchedule = {
  plan: PlanHeader;
  weeks: WeekView[];
};

type State = {
  schedule: PlanSchedule | null;
  loading: boolean;
  error: string | null;
  editeWeekName: (planId: string, weekNumber: string, weekName: string) => Promise<void>;
  fetchSchedule: (planId: string) => Promise<void>;
  duplicateWeek: (planId: string, week: number) => Promise<void>;
  addExercisesToSession: (p: { sessionId: string; exerciseIds: string[] }) => Promise<boolean>;
  removeExerciseFromSession: (p: { sessionId: string; exerciseId: string }) => Promise<boolean>;
};

export const usePlanScheduleStore = create<State>((set) => ({
  schedule: null,
  loading: false,
  error: null,
  editeWeekName: async (planId, weekNumber, weekName) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/${planId}/schedule`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekName,
          week: weekNumber
        }),
      });

      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to update week name');
        set({ loading: false });
        return;
      }

      // ✅ Update week name in local state tree (no refetch)
      set((state) => {
        if (!state.schedule) return state;

        const next = structuredClone(state.schedule) as PlanSchedule;

        const targetWeek = next.weeks.find((w) => w.week === Number(weekNumber));
        if (targetWeek) {
          targetWeek.weekName = weekName;
        }

        toast.success("Week name updated successfully");
        return { ...state, schedule: next, loading: false };
      });

    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update week name');
      set({
        error: (err as Error).message || 'Failed to update week name',
        loading: false,
      });
    }
  },

  duplicateWeek: async (planId, week) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/duplicate-schedule`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: planId,
          week: week,
        }),
      });

      const json = await res.json();
      if (!res.ok || json?.success === false) {
        toast.error(json?.message || 'Failed to load schedule');
        set({ loading: false });
        return;
      }
      set({ loading: false, schedule: json.data, error: null });

    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to load schedule');
      set({ error: (e as Error).message || 'Failed to load schedule', loading: false });
    }
  },
  fetchSchedule: async (planId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/${planId}/schedule`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        toast.error(json?.message || 'Failed to load schedule');
        set({ loading: false });
        return;
      }
      set({ schedule: json.data, loading: false });
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to load schedule');
      set({ error: (e as Error).message || 'Failed to load schedule', loading: false });
    }
  },

  addExercisesToSession: async ({ sessionId, exerciseIds }) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/session/${sessionId}/exercises`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseIds }),
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        toast.error(json?.message || 'Failed to add exercises');
        set({ loading: false });
        return false;
      }

      // Update schedule state in place
      const updatedSession = json.data;
      set((s) => {
        if (!s.schedule) return s;
        const next = structuredClone(s.schedule) as PlanSchedule;
        for (const w of next.weeks) {
          for (const d of w.days) {
            const idx = d.sessions.findIndex((x) => x.sessionId === sessionId);
            if (idx >= 0) {
              d.sessions[idx].exercises = updatedSession.exercises ?? [];
              d.sessions[idx].totalExercises = updatedSession.exercises?.length ?? 0;
            }
          }
        }
        return { ...s, schedule: next, loading: false };
      });
      toast.success('Exercises added');
      return true;
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to add exercises');
      set({ error: (e as Error).message || 'Failed to add exercises', loading: false });
      return false;
    }
  },

  removeExerciseFromSession: async ({ sessionId, exerciseId }) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        `${config.baseUri}/api/session/${sessionId}/exercises/${exerciseId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        toast.error(json?.message || 'Failed to remove exercise');
        set({ loading: false });
        return false;
      }

      const updatedSession = json.data;
      set((s) => {
        if (!s.schedule) return s;
        const next = structuredClone(s.schedule) as PlanSchedule;
        for (const w of next.weeks) {
          for (const d of w.days) {
            const idx = d.sessions.findIndex((x) => x.sessionId === sessionId);
            if (idx >= 0) {
              d.sessions[idx].exercises = updatedSession.exercises ?? [];
              d.sessions[idx].totalExercises = updatedSession.exercises?.length ?? 0;
            }
          }
        }
        return { ...s, schedule: next, loading: false };
      });
      toast.success('Exercise removed');
      return true;
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to remove exercise');
      set({ error: (e as Error).message || 'Failed to remove exercise', loading: false });
      return false;
    }
  },
}));
