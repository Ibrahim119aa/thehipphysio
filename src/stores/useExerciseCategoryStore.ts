// stores/useExerciseCategoryStore.ts
import config from '@/config/config';
import { toast } from 'sonner';
import { create } from 'zustand';

export type ExerciseCategory = {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type State = {
  exerciseCategories: ExerciseCategory[];
  loading: boolean;
  fetchExerciseCategories: () => Promise<void>;
  addExerciseCategory: (p: { title: string; description: string }) => Promise<ExerciseCategory>;
  updateExerciseCategory: (p: { _id: string; title: string; description: string }) => Promise<ExerciseCategory>;
  deleteExerciseCategory: (id: string) => Promise<void>;
};


export const useExerciseCategoryStore = create<State>((set, get) => ({
  exerciseCategories: [],
  loading: false,

  fetchExerciseCategories: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${config.baseUri}/api/exercise-categories`, { 
        credentials: 'include',  
      });

      const result = await res.json().catch(() => ({} as any));
      console.log("this is exercise category");
      
      console.log(result);
      
      if (!result.success) {
        toast.error(result?.message || 'Failed to fetch categories')
        set({ loading: false })
        return;
      }
 
      set({ exerciseCategories: result.data });
    } finally {
      set({ loading: false });
    }
  },

  addExerciseCategory: async (payload) => {

    const res = await fetch(`${config.baseUri}/api/exercise-categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json().catch(() => ({} as any));
    
    if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to create category');

    const created: ExerciseCategory = data?.data ?? data?.category;
    
    if (created && created._id) {
      set((s) => ({ exerciseCategories: [created, ...s.exerciseCategories] }));
    }
    return created;
  },

  updateExerciseCategory: async ({ _id, ...payload }) => {

    const res = await fetch(`${config.baseUri}/api/exercise-categories/${_id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to update category');

    const updated: ExerciseCategory = data?.data ?? data?.category;

    set((s) => ({
      exerciseCategories: s.exerciseCategories.map((c) => (c._id === _id ? updated : c)),
    }));
    return updated;
  },

  deleteExerciseCategory: async (id) => {
    const res = await fetch(`${config.baseUri}/api/exercise-categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({} as any));
      throw new Error(data?.message || data?.error || 'Failed to delete category');
    }
    set((s) => ({
      exerciseCategories: s.exerciseCategories.filter((c) => c._id !== id),
    }));
  },
}));
