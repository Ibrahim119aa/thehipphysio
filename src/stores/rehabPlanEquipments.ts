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
  rehabPlanEquipment: RehabPlanCategory[];
  loading: boolean;
  fetchRehabPlanEquipment: () => Promise<void>;
  addRehabPlanEquipment: (p: { title: string; description: string }) => Promise<RehabPlanCategory>;
  updateRehabPlanEquipment: (p: { _id: string; title: string; description: string }) => Promise<RehabPlanCategory>;
  deleteRehabPlanEquipment: (id: string) => Promise<void>;
};


export const useRehabPlanEquipmentStore = create<State>((set) => ({
  rehabPlanEquipment: [],
  loading: false,

  fetchRehabPlanEquipment: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${config.baseUri}/api/rehab-plans/equipments`, {
        credentials: 'include',
      });

      const result = await res.json().catch(() => ({} as unknown));
      if (!result.success) {
        toast.error(result?.message || 'Failed to fetch categories')
        set({ loading: false })
        return;
      }

      set({ rehabPlanEquipment: result.equipments });
    } finally {
      set({ loading: false });
    }
  },

  addRehabPlanEquipment: async (payload) => {

    const res = await fetch(`${config.baseUri}/api/rehab-plans/equipments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as unknown));

    if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to create category');

    const created: RehabPlanCategory = data?.data ?? data?.category;

    if (created && created._id) {
      set((s) => ({ rehabPlanEquipment: [created, ...s.rehabPlanEquipment] }));
    }
    return created;
  },

  updateRehabPlanEquipment: async ({ _id, ...payload }) => {

    const res = await fetch(`${config.baseUri}/api/rehab-plans/equipments/${_id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as unknown));

    if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update category');

    const updated: RehabPlanCategory = data?.data ?? data?.category;

    set((s) => ({
      rehabPlanEquipment: s.rehabPlanEquipment.map((c) => (c._id === _id ? updated : c)),
    }));
    return updated;
  },

  deleteRehabPlanEquipment: async (id) => {
    const res = await fetch(`${config.baseUri}/api/rehab-plans/equipments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as unknown));
      throw new Error(data?.message || data?.error || 'Failed to delete category');
    }
    set((s) => ({
      rehabPlanEquipment: s.rehabPlanEquipment.filter((c) => c._id !== id),
    }));
  },
}));
