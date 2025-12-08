import { create } from 'zustand';
import { ContentState } from '@/lib/types';
import { toast } from 'sonner';
import config from '@/config/config';

export const useContentStore = create<ContentState>((set, get) => ({
  pages: [],
  loading: false,
  error: null,
  fetchPages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/editable-content`, {
        method: 'GET',
        credentials: 'include', // ✅ Correct placement
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        set({ loading: false });
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
           
      set({ pages: data.data, loading: false });
    } catch (err) {
      set({ error: `Failed to fetch content pages ${err}`, loading: false });
    }
  },
  updatePage: async (slug, content) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${config.baseUri}/api/editable-content/${slug}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentHtml: content }),
      });

      const data = await response.json();    
      console.log('data', data);
      
      
      if(!data.success) {
        toast.error(data.message)
      }
      
      const updatedPage = data?.data;
      if (!updatedPage) {
        toast.error(`Failed to update page, ${data.message} `);
        set({ loading: false });
        return;
      }
      
      const pages = get().pages.map(p => p?.slug === slug ? updatedPage : p);
      
      set({ pages, loading: false });
      toast.success(data.message);
    } catch (err) {
      set({ error: `Failed to update page ${err}`, loading: false });
    }
  }
}));