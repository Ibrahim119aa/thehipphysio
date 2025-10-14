
import { create } from 'zustand';
import { toast } from 'sonner';
import config from '@/config/config';
import { RehabPlan } from '@/lib/types';

type AssignPayload = {
  planId: string;
  userId: string
};

type CreateSessionArgs = {
  planId: string;
  title: string;
  weekNumber: number;
  dayNumber: number;
  exerciseIds: string[];
};
type CreateRehabPlanEducationVideoArgs = {
  planId: string;
  title: string;
  videoIds: string[];
};
type RehabPlanStore = {
  plans: RehabPlan[];
  loading: boolean;
  error: string | null;

  fetchPlans: () => Promise<void>;
  addPlan: (payload: { name: string; planType: 'free' | 'monthly-paid' | 'yearly-paid'; totalWeeks: number; description?: string, weekStart: number, weekEnd: number, category: string[], equipment: string[] }) => Promise<boolean>;
  updatePlan: (payload: { _id: string; name: string; planType: 'free' | 'monthly-paid' | 'yearly-paid'; totalWeeks: number; description?: string, weekStart: number, weekEnd: number, category: string[], equipment: string[] }) => Promise<boolean>;
  duplicatePlan: (_id: string) => Promise<boolean>;
  deletePlan: (id: string) => Promise<void>;
  assignPlanToUser: (payload: AssignPayload) => Promise<boolean>;
  createSessionAndAttach: (args: CreateSessionArgs) => Promise<boolean>;
  createRehabPlanEducationVideo: (args: CreateRehabPlanEducationVideoArgs) => Promise<boolean>;
};

export const useRehabPlanStore = create<RehabPlanStore>((set, get) => ({
  plans: [],
  loading: false,
  error: null,

  // GET /api/rehab-plans
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans`, {
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to fetch rehab plans');
        set({ loading: false });
        return;
      }

      set({ plans: result.data, loading: false });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to fetch rehab plans');
      set({ error: (err as Error).message || 'Failed to fetch rehab plans', loading: false });
    }
  },

  // POST /api/rehab-plans
  addPlan: async (payload) => {
    set({ loading: true, error: null });
    try {
      console.log("this is add plan payload");
      console.log(payload);

      const res = await fetch(`${config.baseUri}/api/rehab-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to create rehab plan');
        set({ loading: false });
        return false;
      }

      // Inline tolerant parsing (no helpers)
      const doc: RehabPlan | undefined =
        result?.plan ??
        result?.data ??
        (result && result._id ? (result as RehabPlan) : undefined);

      if (!doc || !doc._id) {
        toast.error('Server did not return the created plan.');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Rehab plan created!');
      set((state) => ({
        plans: [doc, ...state.plans.filter(Boolean)],
        loading: false,
      }));
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to create rehab plan');
      set({ error: (err as Error).message || 'Failed to create rehab plan', loading: false });
      return false;
    }
  },
  duplicatePlan: async (_id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/duplicate/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to create rehab plan');
        set({ loading: false });
        return false;
      }

      // Inline tolerant parsing (no helpers)
      const doc: RehabPlan | undefined =
        result?.plan ??
        result?.data ??
        (result && result._id ? (result as RehabPlan) : undefined);

      if (!doc || !doc._id) {
        toast.error('Server did not return the created plan.');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Rehab plan created!');
      set((state) => ({
        plans: [doc, ...state.plans.filter(Boolean)],
        loading: false,
      }));

      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update rehab plan');
      set({ error: (err as Error).message || 'Failed to update rehab plan', loading: false });
      return false;
    }
  },
  // PUT /api/rehab-plans/:id
  updatePlan: async ({ _id, ...rest }) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(rest),
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to update rehab plan');
        set({ loading: false });
        return false;
      }

      // Inline tolerant parsing (no helpers)
      const doc: RehabPlan | undefined =
        result?.plan ??
        result?.data ??
        (result && result._id ? (result as RehabPlan) : undefined);

      if (!doc || !doc._id) {
        toast.error('Server did not return the updated plan.');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Rehab plan updated!');
      set((state) => ({
        plans: state.plans.filter(Boolean).map((p) => (p._id === _id ? doc : p)),
        loading: false,
      }));
      // set((state) => {
      //   const updatedPlans = state.plans.filter(Boolean).map((p) =>
      //     p._id === _id
      //       ? {
      //         ...p,
      //         name: doc.name,
      //         planType: doc.planType,
      //         totalWeeks: doc.totalWeeks,
      //         description: doc.description,
      //         weekStart: doc.weekStart,
      //         weekEnd: doc.weekEnd
      //       }
      //       : p
      //   );

      //   return {
      //     plans: updatedPlans,
      //     loading: false,
      //   };
      // });
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update rehab plan');
      set({ error: (err as Error).message || 'Failed to update rehab plan', loading: false });
      return false;
    }
  },


  // DELETE /api/rehab-plans/:id
  deletePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to delete rehab plan');
        set({ loading: false });
        return;
      }

      toast.success(result?.message || 'Rehab plan deleted!');
      set((state) => ({
        plans: state.plans.filter((p) => p?._id !== id),
        loading: false,
      }));
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete rehab plan');
      set({ error: (err as Error).message || 'Failed to delete rehab plan', loading: false });
    }
  },

  // POST /api/rehab-plans/:planId/assign  { userId }
  assignPlanToUser: async ({ planId, userId }) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/${planId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || 'Failed to assign plan');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Plan assigned successfully!');
      set({ loading: false });
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to assign plan');
      set({ error: (err as Error).message || 'Failed to assign plan', loading: false });
      return false;
    }
  },

  createRehabPlanEducationVideo: async ({ planId, title, videoIds }) => {

    if (videoIds.length === 0) {
      toast.error('No video provided');
      return false;
    }


    set({ loading: true, error: null });
    try {

      const res1 = await fetch(`${config.baseUri}/api/rehab-plans/educational-video`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          planId: planId,
          videoId: videoIds,
        }),
      });

      const data1 = await res1.json().catch(() => ({} as unknown));

      if (!res1.ok || data1?.success === false) {
        toast.error(data1?.message || 'Failed to create session');
        set({ loading: false });
        return false;
      }

      // const sessionId: string | undefined = data1?.data?._id ?? data1?.session?._id ?? data1?._id;

      // if (!sessionId) {
      //   toast.error('Server did not return session id');
      //   set({ loading: false });
      //   return false;
      // }

      // const res2 = await fetch(`${config.baseUri}/api/rehab-plans/${planId}`, {
      //   method: 'PUT',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     schedule: [
      //       {
      //         sessions: [sessionId],
      //       },
      //     ],
      //   }),
      // });

      // const data2 = await res2.json().catch(() => ({} as unknown));

      // if (!res2.ok || data2?.success === false) {
      //   toast.error(data2?.message || 'Failed to attach session to plan');
      //   set({ loading: false });
      //   return false;
      // }

      toast.success(data1?.message || 'Session added to plan!');

      await get().fetchPlans(); // refresh list

      set({ loading: false });
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to add session');
      set({ error: (err as Error).message || 'Failed to add session', loading: false });
      return false;
    }
  },

  createSessionAndAttach: async ({ planId, title, weekNumber, dayNumber, exerciseIds }) => {

    if (exerciseIds.length === 0) {
      toast.error('No exercise provided');
      return false;
    }

    set({ loading: true, error: null });
    try {
      // 1) Create the Session
      const res1 = await fetch(`${config.baseUri}/api/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          rehabPlan: planId,
          weekNumber,
          dayNumber,
          exercises: exerciseIds, // Array of Exercise ObjectIds
        }),
      });

      const data1 = await res1.json().catch(() => ({} as unknown));

      if (!res1.ok || data1?.success === false) {
        toast.error(data1?.message || 'Failed to create session');
        set({ loading: false });
        return false;
      }

      const sessionId: string | undefined = data1?.data?._id ?? data1?.session?._id ?? data1?._id;

      if (!sessionId) {
        toast.error('Server did not return session id');
        set({ loading: false });
        return false;
      }

      // 2) Attach to plan.schedule (upsert week/day + push sessionId)
      const res2 = await fetch(`${config.baseUri}/api/rehab-plans/${planId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: [
            {
              week: weekNumber,
              day: dayNumber,
              sessions: [sessionId],
            },
          ],
        }),
      });

      const data2 = await res2.json().catch(() => ({} as unknown));

      if (!res2.ok || data2?.success === false) {
        toast.error(data2?.message || 'Failed to attach session to plan');
        set({ loading: false });
        return false;
      }

      toast.success(data2?.message || 'Session added to plan!');

      await get().fetchPlans(); // refresh list

      set({ loading: false });
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to add session');
      set({ error: (err as Error).message || 'Failed to add session', loading: false });
      return false;
    }
  }



}));
