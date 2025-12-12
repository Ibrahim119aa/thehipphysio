// stores/useExerciseStore.ts
import { create } from 'zustand';
import { ExerciseState } from '@/lib/types';
// Assume you have a config file for your base API URI
// import config from '@/config/config';
import { toast } from 'sonner';
import config from '@/config/config';

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  fetchExercises: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/exercises?page=${page}&limit=${limit}`);
      const result = await response.json();

      if (!result.success || !response.ok) {
        toast.error(result.message || 'Failed to fetch exercises');
        set({ loading: false });
        return;
      }

      set({
        exercises: result.data,
        pagination: {
          currentPage: result.pagination.page,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.total,
        },
        loading: false,
      });
    } catch (err: unknown) {
      toast.error((err as Error).message);
      set({ error: (err as Error).message, loading: false });
    }
  },

  addExercise: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/exercises`, {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed, browser sets it for FormData
        credentials: 'include'
      });
      const result = await response.json();

      if (!result.success || !response.ok) {
        toast.error(result.message || 'Failed to add exercise');
        set({ loading: false });
        return false;
      }

      toast.success(result.message || 'Exercise added successfully!');
      // Add the new exercise to the start of the list
      set({ loading: false });
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message);
      set({ error: (err as Error).message, loading: false });
      return false;
    }
  },

  updateExercise: async (formData: FormData) => {
    set({ loading: true, error: null });
    const exerciseId = formData.get('_id');
    try {
      const response = await fetch(`${config.baseUri}/api/exercises/${exerciseId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });
      const result = await response.json();

      if (!result.success || !response.ok) {
        toast.error(result.message || 'Failed to update exercise');
        set({ loading: false });
        return false;
      }

      toast.success('Exercise updated successfully!');
      // Update the exercise in the list
      set(state => ({
        exercises: state.exercises.map(ex => ex._id === exerciseId ? result.data : ex),
        loading: false
      }));
      return true;
    } catch (err: unknown) {
      toast.error((err as Error).message);
      set({ error: (err as Error).message, loading: false });
      return false;
    }
  },

  deleteExercise: async (exerciseId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/exercises/${exerciseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await response.json();

      if (!result.success || !response.ok) {
        toast.error(result.message || 'Failed to delete exercise');
        set({ loading: false });
        return;
      }

      toast.success(result.message || 'Exercise deleted successfully!');
      // Remove the exercise from the list
      set(state => ({
        exercises: state.exercises.filter(ex => ex._id !== exerciseId),
        loading: false
      }));
    } catch (err: unknown) {
      toast.error((err as Error).message);
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
