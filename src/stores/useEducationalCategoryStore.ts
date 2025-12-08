import { create } from 'zustand';
import { toast } from 'sonner';
import config from '@/config/config';

export type EducationalCategory = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type State = {
  categories: EducationalCategory[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  addCategory: (payload: { title: string; description: string }) => Promise<boolean>;
  updateCategory: (payload: { _id: string; title: string; description: string }) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<void>;
};

export const useEducationalCategoryStore = create<State>((set => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/category`, {
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to fetch categories');
        set({ loading: false });
        return;
      }

      set({ categories: result.categories ?? [], loading: false });
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to fetch categories');
      set({ error: (err as { message?: string })?.message || 'Failed to fetch categories', loading: false });
    }
  },

  addCategory: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to add category');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Category added successfully!');
      set((state) => ({ categories: [result.data, ...state.categories], loading: false }));
      return true;
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to add category');
      set({ error: (err as { message?: string })?.message || 'Failed to add category', loading: false });
      return false;
    }
  },

  updateCategory: async (payload) => {
    set({ loading: true, error: null });
    const { _id, ...rest } = payload;
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/category/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(rest),
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to update category');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Category updated successfully!');
      set((state) => ({
        categories: state.categories.map((c) => (c._id === _id ? result.data : c)),
        loading: false,
      }));
      return true;
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to update category');
      set({ error: (err as { message?: string })?.message || 'Failed to update category', loading: false });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/category/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to delete category');
        set({ loading: false });
        return;
      }

      toast.success(result?.message || 'Category deleted successfully!');
      set((state) => ({
        categories: state.categories.filter((c) => c._id !== id),
        loading: false,
      }));
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to delete category');
      set({ error: (err as { message?: string })?.message || 'Failed to delete category', loading: false });
    }
  },
})));
