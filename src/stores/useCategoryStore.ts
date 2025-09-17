// stores/useCategoryStore.ts
import { create } from 'zustand';
import { ExerciseCategory } from '@/lib/types';
import { toast } from 'sonner';
import config from '@/config/config';
// This would ideally come from a central config file
// const API_BASE_URL = 'http://localhost:4200'; 

interface CategoryState {
    categories: ExerciseCategory[];
    loading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: async () => {
    // Avoid refetching if data already exists in the store
    if (get().categories.length > 0) return; 
        
    set({ loading: true, error: null });
      try {
        const response = await fetch(`${config.baseUri}/api/exercise-categories`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        // if (!response.ok) {
        //   throw new Error('Failed to fetch exercise categories');
        // }

        // The API returns the array directly, so we use the result itself
        const result = await response.json();
        
        // if(!result.data.success) {
        //   toast.error(result.data.message);
        // }            

        set({ categories: result.data, loading: false });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
      }
  },
}));
