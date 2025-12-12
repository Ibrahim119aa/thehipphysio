import { create } from 'zustand';
import { toast } from 'sonner';
import config from '@/config/config';

export type EVCategory = { _id: string; title: string };

export type EducationalVideo = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  categories: Array<EVCategory | string>;
  createdAt?: string;
  updatedAt?: string;
};

type State = {
  videos: EducationalVideo[];
  categories: EVCategory[];
  loading: boolean;
  error: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };

  fetchVideos: (page?: number, limit?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addVideo: (form: FormData) => Promise<boolean>;
  updateVideo: (form: FormData) => Promise<boolean>;
  deleteVideo: (id: string) => Promise<void>;
};

export const useEducationalVideoStore = create<State>((set) => ({
  videos: [],
  categories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  fetchVideos: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos?page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include'
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to fetch videos');
        set({ loading: false });
        return;
      }

      set({
        videos: result.data ?? [],
        pagination: result.pagination ? {
          currentPage: result.pagination.page,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.total,
        } : undefined,
        loading: false
      });
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to fetch videos');
      set({ error: (err as { message?: string })?.message || 'Failed to fetch videos', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/category`, {
        method: 'GET',
        credentials: 'include'
      }
      );
      const result = await res.json();
      console.log(result.categories);

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to fetch categories');
        return;
      }

      set({ categories: result.categories ?? [] });
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to fetch categories');
    }
  },

  addVideo: async (formData: FormData) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to add video');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Video added successfully!');
      set({ loading: false });
      return true;
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to add video');
      set({ error: (err as { message?: string })?.message || 'Failed to add video', loading: false });
      return false;
    }
  },

  updateVideo: async (formData: FormData) => {
    set({ loading: true, error: null });
    const id = String(formData.get('_id') ?? '');
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to update video');
        set({ loading: false });
        return false;
      }

      toast.success(result?.message || 'Video updated successfully!');
      set((state) => ({
        videos: state.videos.map((v) => (v._id === id ? result.data : v)),
        loading: false,
      }));
      return true;
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to update video');
      set({ error: (err as { message?: string })?.message || 'Failed to update video', loading: false });
      return false;
    }
  },

  deleteVideo: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseUri}/api/educational-videos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message || 'Failed to delete video');
        set({ loading: false });
        return;
      }

      toast.success(result?.message || 'Video deleted successfully!');
      set((state) => ({
        videos: state.videos.filter((v) => v._id !== id),
        loading: false,
      }));
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to delete video');
      set({ error: (err as { message?: string })?.message || 'Failed to delete video', loading: false });
    }
  },
}));
