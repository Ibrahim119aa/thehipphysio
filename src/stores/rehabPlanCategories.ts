import config from '@/config/config';
import { toast } from 'sonner';
import { create } from 'zustand';

export type RehabPlanCategory = {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type State = {
  rehabPlanCategories: RehabPlanCategory[];
  loading: boolean;
  fetchRehabPlanCategories: () => Promise<void>;
  addRehabPlanCategory: (p: { title: string; description: string }) => Promise<RehabPlanCategory | null>;
  updateRehabPlanCategory: (p: { _id: string; title: string; description: string }) => Promise<RehabPlanCategory>;
  deleteRehabPlanCategory: (id: string) => Promise<void>;
};


export const useRehabPlanCategoryStore = create<State>((set) => ({
  rehabPlanCategories: [],
  loading: false,

  fetchRehabPlanCategories: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/category`, {
        credentials: 'include',
      });

      const result = await res.json().catch(() => ({} as unknown));

      if (!result.success) {
        toast.error(result?.message || 'Failed to fetch categories')
        set({ loading: false })
        return;
      }

      set({ rehabPlanCategories: result.categories });
    } finally {
      set({ loading: false });
    }
  },

  addRehabPlanCategory: async (payload) => {

    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/category`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as unknown));

      if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to create category');

      const created: RehabPlanCategory = data?.data ?? data?.category;

      if (created && created._id) {
        toast.error('Server did not return the created plan category.');
        // set((s) => ({ rehabPlanCategories: [created, ...s.rehabPlanCategories] }));
      }


      toast.success(data?.message || 'Rehab plan category created successfully.');
      return created;
    } catch (err) {
      toast.error((err as Error).message);
      // set({ error: (err as Error).message, loading: false });
      return null;
    }
  },

  updateRehabPlanCategory: async ({ _id, ...payload }) => {

    const res = await fetch(`${config.baseUri}/api/rehab-plans/category/${_id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as unknown));

    if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update category');

    const updated: RehabPlanCategory = data?.data ?? data?.category;

    set((s) => ({
      rehabPlanCategories: s.rehabPlanCategories.map((c) => (c._id === _id ? updated : c)),
    }));
    return updated;
  },

  deleteRehabPlanCategory: async (id) => {
    const res = await fetch(`${config.baseUri}/api/rehab-plans/category/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as unknown));
      throw new Error(data?.message || data?.error || 'Failed to delete category');
    }
    set((s) => ({
      rehabPlanCategories: s.rehabPlanCategories.filter((c) => c._id !== id),
    }));
  },
}));
